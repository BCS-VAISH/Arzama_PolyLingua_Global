import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 },
      );
    }

    // Get PayPal credentials
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || 'sandbox';

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 },
      );
    }

    const baseUrl = paypalMode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to authenticate with PayPal' },
        { status: 500 },
      );
    }

    const { access_token } = await tokenResponse.json();

    // Capture the order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!captureResponse.ok) {
      const errorText = await captureResponse.text();
      console.error('PayPal capture error:', errorText);
      return NextResponse.json(
        { error: 'Failed to capture PayPal order' },
        { status: 500 },
      );
    }

    const captureData = await captureResponse.json();

    // Find the payment receipt by order ID
    const receipt = await prisma.paymentReceipt.findUnique({
      where: { stripeSessionId: orderId }, // PayPal order ID stored here
      include: {
        enrollment: true,
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { error: 'Payment receipt not found' },
        { status: 404 },
      );
    }

    // Update enrollment status to PAID
    if (captureData.status === 'COMPLETED') {
      await prisma.enrollment.update({
        where: { id: receipt.enrollment.id },
        data: { status: 'PAID' },
      });

      // Update payment receipt with PayPal details
      const paymentInfo = captureData.purchase_units[0]?.payments?.captures[0];
      await prisma.paymentReceipt.update({
        where: { id: receipt.id },
        data: {
          cardBrand: 'PayPal',
          cardLast4: paymentInfo?.id?.slice(-4) || 'PPAL',
        },
      });

      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        paymentId: orderId,
        enrollmentId: receipt.enrollment.id,
      });
    }

    return NextResponse.json({
      success: false,
      status: captureData.status,
      paymentId: orderId,
    });
  } catch (error) {
    console.error('Error capturing PayPal order', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal order' },
      { status: 500 },
    );
  }
}

