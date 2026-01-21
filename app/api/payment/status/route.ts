import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/payment/status?paymentId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId query parameter is required' },
        { status: 400 },
      );
    }

    // Find payment receipt by payment ID (stored in stripeSessionId field)
    const receipt = await prisma.paymentReceipt.findUnique({
      where: { stripeSessionId: paymentId },
      include: {
        enrollment: {
          include: {
            course: true,
            user: true,
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      paymentId,
      status: receipt.enrollment.status,
      amount: (receipt.amountCents / 100).toFixed(2),
      currency: receipt.currency.toUpperCase(),
      courseName: receipt.enrollment.course.name,
    });
  } catch (error) {
    console.error('Error checking payment status', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 },
    );
  }
}

// POST /api/payment/status - Manual payment confirmation (for testing/admin)
export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 },
      );
    }

    // Find payment receipt
    const receipt = await prisma.paymentReceipt.findUnique({
      where: { stripeSessionId: paymentId },
      include: {
        enrollment: {
          include: {
            course: true,
            user: true,
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 },
      );
    }

    if (receipt.enrollment.status === 'PAID') {
      return NextResponse.json({
        message: 'Payment already confirmed',
        status: 'PAID',
      });
    }

    // Mark enrollment as paid
    await prisma.enrollment.update({
      where: { id: receipt.enrollment.id },
      data: { status: 'PAID' },
    });

    // Update receipt with payment details (if available)
    await prisma.paymentReceipt.update({
      where: { id: receipt.id },
      data: {
        cardBrand: 'UPI',
        cardLast4: 'QR',
      },
    });

    return NextResponse.json({
      message: 'Payment confirmed successfully',
      status: 'PAID',
      receiptId: receipt.id,
    });
  } catch (error) {
    console.error('Error confirming payment', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 },
    );
  }
}

