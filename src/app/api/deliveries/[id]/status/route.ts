import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { transitionOrderStatus } from '@/lib/order-state-machine';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(['TRANSPORT_PARTNER', 'ADMIN']);
    const body = await req.json();
    const { status, proofNotes, proofUrl, failedReason } = body;

    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: { order: true },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery record not found.' }, { status: 404 });
    }

    const updatedDelivery = await prisma.delivery.update({
      where: { id: params.id },
      data: {
        status,
        proofOfDeliveryNotes: proofNotes || delivery.proofOfDeliveryNotes,
        proofOfDeliveryUrl: proofUrl || delivery.proofOfDeliveryUrl,
        failedReason: failedReason || undefined,
        pickedUpAt: status === 'PICKED_UP' ? new Date() : delivery.pickedUpAt,
        deliveredAt: status === 'DELIVERED' ? new Date() : delivery.deliveredAt,
      },
    });

    // Sync order state machine
    if (status === 'PICKED_UP' && delivery.order.status !== 'PICKED_UP') {
      await transitionOrderStatus({
        orderId: delivery.orderId,
        targetStatus: 'PICKED_UP',
        changedById: session.userId,
        actorRole: session.role,
        note: 'Mini-truck driver picked up batch from farm gate.',
      });
    } else if (status === 'IN_TRANSIT' && delivery.order.status !== 'IN_TRANSIT') {
      await transitionOrderStatus({
        orderId: delivery.orderId,
        targetStatus: 'IN_TRANSIT',
        changedById: session.userId,
        actorRole: session.role,
        note: 'Vehicle en route on highway to kitchen destination.',
      });
    } else if (status === 'DELIVERED' && delivery.order.status !== 'DELIVERED') {
      await transitionOrderStatus({
        orderId: delivery.orderId,
        targetStatus: 'DELIVERED',
        changedById: session.userId,
        actorRole: session.role,
        note: proofNotes || 'Consignment verified and unloaded at kitchen bay.',
      });
    }

    return NextResponse.json({ success: true, delivery: updatedDelivery });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
