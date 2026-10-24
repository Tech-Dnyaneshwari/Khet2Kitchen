import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const assignSchema = z.object({
  deliveryId: z.string().min(1, 'Delivery ID required'),
  transportPartnerId: z.string().min(1, 'Transport partner ID required'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['ADMIN']);
    const body = await req.json();

    const validated = assignSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Invalid assignment data' },
        { status: 400 }
      );
    }

    const { deliveryId, transportPartnerId } = validated.data;

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { include: { buyer: true } } },
    });

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery record not found.' }, { status: 404 });
    }

    const partner = await prisma.transportPartnerProfile.findUnique({
      where: { id: transportPartnerId },
      include: { user: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Transport partner not found.' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: deliveryId },
        data: {
          transportPartnerId,
          status: 'ASSIGNED',
          assignedAt: new Date(),
        },
      });

      // Notify the transport partner
      await tx.notification.create({
        data: {
          userId: partner.user.id,
          title: `New Delivery Assignment: ${delivery.order.orderNumber}`,
          message: `Pickup from ${delivery.pickupAddress} → Deliver to ${delivery.deliveryAddress}. Fee: ₹${delivery.totalFee}`,
          type: 'DELIVERY_UPDATE',
          linkUrl: '/dashboard/transport/deliveries',
        },
      });

      // Notify buyer
      await tx.notification.create({
        data: {
          userId: delivery.order.buyerId,
          title: `Driver Assigned for Order ${delivery.order.orderNumber}`,
          message: `Vehicle ${partner.vehicleNumber} assigned. Driver: ${partner.user.name}`,
          type: 'DELIVERY_UPDATE',
          linkUrl: `/dashboard/buyer/orders/${delivery.orderId}`,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: 'TRANSPORT_PARTNER_ASSIGNED',
          entityType: 'DELIVERY',
          entityId: deliveryId,
          detailsJson: JSON.stringify({
            transportPartnerId,
            partnerName: partner.user.name,
            vehicleNumber: partner.vehicleNumber,
            orderId: delivery.orderId,
          }),
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Transport partner assigned successfully.' });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED') || error.message?.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
