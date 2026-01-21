import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const webhookData = await req.json();
    const eventType = webhookData.event_type;

    // Handle different PayPal webhook events
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = webhookData.resource;
      const orderId = resource.supplementary_data?.related_ids?.order_id;
      
      if (!orderId) {
        return NextResponse.json({ received: true });
      }

      // Find the payment receipt by PayPal order ID
      const receipt = await prisma.paymentReceipt.findUnique({
        where: { stripeSessionId: orderId },
        include: {
          enrollment: true,
        },
      });

      if (receipt && receipt.enrollment.status !== 'PAID') {
        // Update enrollment status to PAID
        await prisma.enrollment.update({
          where: { id: receipt.enrollment.id },
          data: { status: 'PAID' },
        });

        // Update payment receipt
        await prisma.paymentReceipt.update({
          where: { id: receipt.id },
          data: {
            cardBrand: 'PayPal',
            cardLast4: resource.id?.slice(-4) || 'PPAL',
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

