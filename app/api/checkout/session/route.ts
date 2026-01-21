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

    // Generate unique payment ID
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Get UPI ID from environment or use default
    const upiId = process.env.UPI_ID || 'your-upi-id@paytm';
    const merchantName = process.env.MERCHANT_NAME || 'ARZAMA PolyLingua';
    
    // Generate UPI QR code string
    const amount = (course.priceCents / 100).toFixed(2);
    const upiQrString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=${course.currency.toUpperCase()}&tn=${encodeURIComponent(`Course: ${course.name} - Payment ID: ${paymentId}`)}`;
    
    // Store payment session in database (we'll use PaymentReceipt to track)
    const paymentReceipt = await prisma.paymentReceipt.create({
      data: {
        enrollmentId: enrollment.id,
        stripeSessionId: paymentId, // Reusing this field for payment ID
        amountCents: course.priceCents,
        currency: course.currency,
      },
    });

    return NextResponse.json({
      paymentId,
      qrCode: upiQrString,
      amount: amount,
      currency: course.currency.toUpperCase(),
      courseName: course.name,
      enrollmentId: enrollment.id,
    });
  } catch (error) {
    console.error('Error creating payment session', error);
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 },
    );
  }
}
