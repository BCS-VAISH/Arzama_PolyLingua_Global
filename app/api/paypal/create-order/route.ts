import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { courseId, userEmail, userName } = await req.json();

    if (!courseId || !userEmail) {
      return NextResponse.json(
        { error: 'courseId and userEmail are required' },
        { status: 400 },
      );
    }

    // Ensure course exists or create it with defaults
    const course = await prisma.course.upsert({
      where: { courseId: courseId },
      update: {},
      create: {
        courseId: courseId,
        name:
          courseId === 'english'
            ? 'English Fluency Program'
            : courseId === 'french'
            ? 'French Language Journey'
            : 'Portuguese Mastery Course',
        description: 'Language course',
        priceCents: 359900,
        currency: 'inr',
      },
    });

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName ?? undefined },
      create: {
        email: userEmail,
        name: userName ?? null,
      },
    });

    // Create pending enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        status: 'PENDING',
      },
    });

    // Get PayPal credentials from environment
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 },
      );
    }

    // Convert INR to USD (approximate conversion, you may want to use a currency conversion API)
    const amountInINR = course.priceCents / 100;
    const amountInUSD = (amountInINR / 83).toFixed(2); // Approximate conversion rate

    // Get PayPal access token
    const baseUrl = paypalMode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('PayPal token error:', errorText);
      return NextResponse.json(
        { error: 'Failed to authenticate with PayPal' },
        { status: 500 },
      );
    }

    const { access_token } = await tokenResponse.json();

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
        'PayPal-Request-Id': `order-${enrollment.id}-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: enrollment.id,
            description: course.name,
            amount: {
              currency_code: 'USD',
              value: amountInUSD,
            },
            custom_id: enrollment.id,
          },
        ],
        application_context: {
          brand_name: 'ARZAMA PolyLingua',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-cancel`,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('PayPal order creation error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create PayPal order' },
        { status: 500 },
      );
    }

    const orderData = await orderResponse.json();

    // Store payment receipt with PayPal order ID
    const paymentReceipt = await prisma.paymentReceipt.create({
      data: {
        enrollmentId: enrollment.id,
        stripeSessionId: orderData.id, // Using this field to store PayPal order ID
        stripePaymentIntentId: orderData.id, // Store order ID here too
        amountCents: course.priceCents,
        currency: course.currency,
      },
    });

    return NextResponse.json({
      orderId: orderData.id,
      enrollmentId: enrollment.id,
      approvalUrl: orderData.links?.find((link: any) => link.rel === 'approve')?.href,
      amount: amountInUSD,
      currency: 'USD',
    });
  } catch (error) {
    console.error('Error creating PayPal order', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 },
    );
  }
}

