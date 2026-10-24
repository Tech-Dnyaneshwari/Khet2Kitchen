import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET cart items for current buyer
export async function GET() {
  try {
    const session = await requireAuth(['BUYER']);

    let cart = await prisma.cart.findUnique({
      where: { buyerId: session.userId },
      include: {
        items: {
          include: {
            produce: {
              include: {
                farmer: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { buyerId: session.userId },
        include: {
          items: {
            include: {
              produce: {
                include: {
                  farmer: true,
                  images: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes('UNAUTHORIZED') ? 401 : 500 });
  }
}

// POST: Add or update item in cart
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['BUYER']);
    const { produceId, quantityKg } = await req.json();

    if (!produceId || !quantityKg || quantityKg <= 0) {
      return NextResponse.json({ error: 'Valid produceId and positive quantity are required.' }, { status: 400 });
    }

    const produce = await prisma.produceListing.findUnique({
      where: { id: produceId },
    });

    if (!produce || produce.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Produce listing is currently unavailable or out of stock.' }, { status: 400 });
    }

    if (quantityKg < produce.minOrderQuantityKg) {
      return NextResponse.json(
        { error: `Minimum order quantity for this produce is ${produce.minOrderQuantityKg} kg.` },
        { status: 400 }
      );
    }

    if (quantityKg > produce.availableStockKg) {
      return NextResponse.json(
        { error: `Requested quantity (${quantityKg} kg) exceeds currently available stock (${produce.availableStockKg} kg).` },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findUnique({
      where: { buyerId: session.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { buyerId: session.userId },
      });
    }

    // Upsert item
    const item = await prisma.cartItem.upsert({
      where: {
        cartId_produceId: {
          cartId: cart.id,
          produceId: produce.id,
        },
      },
      update: {
        quantityKg,
        unitPriceSnapshot: produce.pricePerUnit,
      },
      create: {
        cartId: cart.id,
        produceId: produce.id,
        quantityKg,
        unitPriceSnapshot: produce.pricePerUnit,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove item from cart or clear
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(['BUYER']);
    const { searchParams } = new URL(req.url);
    const produceId = searchParams.get('produceId');

    const cart = await prisma.cart.findUnique({
      where: { buyerId: session.userId },
    });

    if (!cart) {
      return NextResponse.json({ success: true });
    }

    if (produceId) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          produceId,
        },
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
