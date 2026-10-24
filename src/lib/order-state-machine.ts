import prisma from './prisma';

export type OrderStatus =
  | 'PENDING_FARMER_CONFIRMATION'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

// Transition rules: which states can transition to which
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_FARMER_CONFIRMATION: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'DELIVERED'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

// Role authorization for transitions
export const ROLE_TRANSITION_PERMISSIONS: Record<
  OrderStatus,
  Array<'FARMER' | 'BUYER' | 'TRANSPORT_PARTNER' | 'ADMIN'>
> = {
  PENDING_FARMER_CONFIRMATION: ['BUYER'], // Initial creation
  ACCEPTED: ['FARMER', 'ADMIN'],
  REJECTED: ['FARMER', 'ADMIN'],
  PREPARING: ['FARMER', 'ADMIN'],
  READY_FOR_PICKUP: ['FARMER', 'ADMIN'],
  PICKED_UP: ['TRANSPORT_PARTNER', 'FARMER', 'BUYER', 'ADMIN'],
  IN_TRANSIT: ['TRANSPORT_PARTNER', 'ADMIN'],
  DELIVERED: ['TRANSPORT_PARTNER', 'BUYER', 'ADMIN'],
  CANCELLED: ['BUYER', 'FARMER', 'ADMIN'],
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  actorRole: 'FARMER' | 'BUYER' | 'TRANSPORT_PARTNER' | 'ADMIN'
): { allowed: boolean; reason?: string } {
  const allowedTargets = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowedTargets.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Illegal state transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  const allowedRoles = ROLE_TRANSITION_PERMISSIONS[targetStatus];
  if (!allowedRoles.includes(actorRole)) {
    return {
      allowed: false,
      reason: `Role ${actorRole} is not permitted to advance order to ${targetStatus}.`,
    };
  }

  return { allowed: true };
}

export async function transitionOrderStatus(params: {
  orderId: string;
  targetStatus: OrderStatus;
  changedById: string;
  actorRole: 'FARMER' | 'BUYER' | 'TRANSPORT_PARTNER' | 'ADMIN';
  note?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: params.orderId },
      include: {
        items: true,
        delivery: true,
        farmer: true,
      },
    });

    if (!order) {
      throw new Error(`Order ${params.orderId} not found.`);
    }

    const currentStatus = order.status as OrderStatus;
    const check = canTransitionOrder(currentStatus, params.targetStatus, params.actorRole);
    if (!check.allowed) {
      throw new Error(check.reason);
    }

    // Handle inventory restorations if cancelled or rejected
    if (params.targetStatus === 'CANCELLED' || params.targetStatus === 'REJECTED') {
      for (const item of order.items) {
        await tx.produceListing.update({
          where: { id: item.produceId },
          data: {
            availableStockKg: {
              increment: item.quantity,
            },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            produceId: item.produceId,
            orderId: order.id,
            changeAmountKg: item.quantity,
            balanceAfterKg: 0, // balance updated in trigger/logic
            movementType: 'ORDER_CANCELLED_RESTORE',
            note: `Restored stock due to order ${order.orderNumber} ${params.targetStatus}`,
          },
        });
      }
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: params.orderId },
      data: {
        status: params.targetStatus,
        cancellationReason: params.targetStatus === 'CANCELLED' ? params.note : undefined,
        rejectionReason: params.targetStatus === 'REJECTED' ? params.note : undefined,
      },
    });

    // Record transition history
    await tx.orderStatusHistory.create({
      data: {
        orderId: params.orderId,
        fromStatus: currentStatus,
        toStatus: params.targetStatus,
        changedById: params.changedById,
        note: params.note || `Order advanced to ${params.targetStatus}`,
      },
    });

    // Sync delivery status if present
    if (order.delivery) {
      let deliveryStatus = order.delivery.status;
      if (params.targetStatus === 'PICKED_UP') deliveryStatus = 'PICKED_UP';
      else if (params.targetStatus === 'IN_TRANSIT') deliveryStatus = 'IN_TRANSIT';
      else if (params.targetStatus === 'DELIVERED') deliveryStatus = 'DELIVERED';
      else if (params.targetStatus === 'CANCELLED' || params.targetStatus === 'REJECTED') deliveryStatus = 'CANCELLED';

      if (deliveryStatus !== order.delivery.status) {
        await tx.delivery.update({
          where: { id: order.delivery.id },
          data: {
            status: deliveryStatus,
            deliveredAt: params.targetStatus === 'DELIVERED' ? new Date() : undefined,
          },
        });
      }
    }

    // Notify buyer & farmer
    const notifyUserIds = [order.buyerId, order.farmer.userId].filter((id) => id !== params.changedById);
    for (const uid of notifyUserIds) {
      await tx.notification.create({
        data: {
          userId: uid,
          title: `Order #${order.orderNumber} Status: ${params.targetStatus.replace(/_/g, ' ')}`,
          message: params.note || `Order updated to ${params.targetStatus}`,
          type: 'ORDER_UPDATE',
          linkUrl: `/dashboard/buyer/orders`,
        },
      });
    }

    return updatedOrder;
  });
}
