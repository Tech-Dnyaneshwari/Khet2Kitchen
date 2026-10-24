import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations';
import { calculateOrderPricing } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['BUYER']);
    const body = await req.json();

    const validated = checkoutSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Invalid checkout payload' },
        { status: 400 }
      );
    }

    const {
      fulfillmentType,
      deliveryAddress,
      preferredDeliveryDate,
      preferredTimeSlot,
      farmerNotes,
      paymentMethod,
    } = validated.data;

    // Fetch buyer's cart items
    const cart = await prisma.cart.findUnique({
      where: { buyerId: session.userId },
      include: {
        items: {
          include: {
            produce: {
              include: { farmer: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty. Please add produce before checkout.' }, { status: 400 });
    }

    // Process order in an atomic transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      // 1. Group items by farmer (separate orders per farm gate)
      const farmerId = cart.items[0].produce.farmerId;
      const farmerItems = cart.items.filter((i) => i.produce.farmerId === farmerId);

      // 2. Validate current stock and prevent overselling
      for (const item of farmerItems) {
        const currentProduce = await tx.produceListing.findUnique({
          where: { id: item.produceId },
        });

        if (!currentProduce || currentProduce.status !== 'ACTIVE') {
          throw new Error(`Item "${item.produce.name}" is no longer available.`);
        }

        if (currentProduce.availableStockKg < item.quantityKg) {
          throw new Error(
            `Insufficient stock for "${item.produce.name}". Requested: ${item.quantityKg}kg, Available: ${currentProduce.availableStockKg}kg.`
          );
        }

        // Deduct inventory atomically
        await tx.produceListing.update({
          where: { id: item.produceId },
          data: {
            availableStockKg: {
              decrement: item.quantityKg,
            },
          },
        });
      }

      // 3. Compute server-side financial figures
      const pricing = await calculateOrderPricing({
        items: farmerItems.map((i) => ({
          produceId: i.produceId,
          quantityKg: i.quantityKg,
          unitPrice: i.produce.pricePerUnit,
        })),
        fulfillmentType,
        distanceKm: 28, // Default route distance in km
      });

      const orderNumber = `K2K-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrPasscode = `OTP-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 899999)}`;

      // 4. Create immutable Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: session.userId,
          farmerId,
          status: 'PENDING_FARMER_CONFIRMATION',
          subtotal: pricing.subtotal,
          deliveryFee: pricing.deliveryFee,
          platformCommission: pricing.platformCommission,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          fulfillmentType,
          preferredDeliveryDate,
          preferredTimeSlot,
          farmerNotes,
          qrPasscode,
          invoiceNumber,
        },
      });

      // 5. Create Order Items snapshots & Inventory Movements
      for (const item of farmerItems) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            produceId: item.produceId,
            productName: item.produce.name,
            qualityGrade: item.produce.qualityGrade,
            unit: item.produce.unit,
            quantity: item.quantityKg,
            unitPrice: item.produce.pricePerUnit,
            subtotal: item.quantityKg * item.produce.pricePerUnit,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            produceId: item.produceId,
            orderId: newOrder.id,
            changeAmountKg: -item.quantityKg,
            balanceAfterKg: 0,
            movementType: 'ORDER_RESERVATION',
            note: `Stock reserved for order ${orderNumber}`,
          },
        });
      }

      // 6. Record Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          fromStatus: 'PENDING_FARMER_CONFIRMATION',
          toStatus: 'PENDING_FARMER_CONFIRMATION',
          changedById: session.userId,
          note: 'Direct order placed by commercial buyer.',
        },
      });

      // 7. Create Delivery Record if K2K fleet delivery
      if (fulfillmentType === 'KHET2KITCHEN_DELIVERY') {
        await tx.delivery.create({
          data: {
            orderId: newOrder.id,
            pickupAddress: `${farmerItems[0].produce.farmer.farmName}, ${farmerItems[0].produce.farmer.village}`,
            deliveryAddress: deliveryAddress || 'Commercial Kitchen Gate',
            estimatedDistanceKm: 28.0,
            baseFee: 250.0,
            perKmFee: 12.0,
            totalFee: pricing.deliveryFee,
            platformLogisticsMargin: 80.0,
            driverPayout: pricing.deliveryFee - 80.0,
            status: 'REQUESTED',
          },
        });
      }

      // 8. Create Payment Record (Mock payment completed)
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: pricing.totalAmount,
          currency: 'INR',
          method: paymentMethod as any,
          status: 'COMPLETED',
          providerTransactionRef: `MOCK-${paymentMethod}-${Date.now()}`,
          paidAt: new Date(),
        },
      });

      // 9. Create Commission Record
      await tx.commissionRecord.create({
        data: {
          orderId: newOrder.id,
          farmerId,
          grossSubtotal: pricing.subtotal,
          commissionRatePercent: pricing.commissionRatePercent,
          commissionAmount: pricing.platformCommission,
          netFarmerPayout: pricing.subtotal - pricing.platformCommission,
          status: 'ACCRUED',
        },
      });

      // 10. Clear ordered items from cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          produceId: { in: farmerItems.map((i) => i.produceId) },
        },
      });

      // 11. Send notification to Farmer
      await tx.notification.create({
        data: {
          userId: farmerItems[0].produce.farmer.userId,
          title: `New Order Received: ${orderNumber}`,
          message: `Commercial buyer placed order for ${pricing.totalWeightKg}kg produce (₹${pricing.totalAmount.toLocaleString('en-IN')}). Please accept or schedule harvest.`,
          type: 'ORDER_UPDATE',
          linkUrl: '/dashboard/farmer/orders',
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: orderResult,
      redirectUrl: `/dashboard/buyer/orders`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
