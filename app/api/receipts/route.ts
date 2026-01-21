import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/receipts?sessionId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId query parameter is required' },
        { status: 400 },
      );
    }

    // Find receipt by payment ID (stored in stripeSessionId field for compatibility)
    const receipt = await prisma.paymentReceipt.findUnique({
      where: { stripeSessionId: sessionId },
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
        { error: 'Receipt not found' },
        { status: 404 },
      );
    }

    // Format receipt for response
    const formattedReceipt = {
      id: receipt.id,
      courseName: receipt.enrollment.course.name,
      studentName: receipt.enrollment.user.name || receipt.enrollment.user.email,
      studentEmail: receipt.enrollment.user.email,
      amountCents: receipt.amountCents,
      amount: (receipt.amountCents / 100).toFixed(2),
      currency: receipt.currency.toUpperCase(),
      cardBrand: receipt.cardBrand || 'N/A',
      cardLast4: receipt.cardLast4 || 'N/A',
      stripeSessionId: receipt.stripeSessionId,
      stripePaymentIntentId: receipt.stripePaymentIntentId || 'N/A',
      createdAt: receipt.createdAt.toISOString(),
      paymentDate: receipt.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    return NextResponse.json(formattedReceipt);
  } catch (error) {
    console.error('Error fetching receipt', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 },
    );
  }
}

