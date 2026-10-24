import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const reviewSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['BUYER']);
    const body = await req.json();

    const validated = reviewSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Invalid review data' },
        { status: 400 }
      );
    }

    const { orderId, rating, comment } = validated.data;

    // Verify the order belongs to this buyer and is delivered
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { farmer: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }
    if (order.buyerId !== session.userId) {
      return NextResponse.json({ error: 'You can only review your own orders.' }, { status: 403 });
    }
    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'You can only review orders that have been delivered.' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this order.' }, { status: 409 });
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          orderId,
          farmerId: order.farmerId,
          buyerId: session.userId,
          rating,
          comment: comment || null,
          isPublic: true,
        },
      });

      // Recalculate farmer's average rating
      const allReviews = await tx.review.findMany({
        where: { farmerId: order.farmerId },
        select: { rating: true },
      });
      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await tx.farmerProfile.update({
        where: { id: order.farmerId },
        data: {
          rating: Math.round(avgRating * 100) / 100,
          reviewsCount: allReviews.length,
        },
      });

      // Notify farmer
      await tx.notification.create({
        data: {
          userId: order.farmer.userId,
          title: `New Review for Order ${order.orderNumber}`,
          message: `A buyer rated you ${rating}/5 stars. ${comment ? `"${comment.substring(0, 60)}..."` : ''}`,
          type: 'REVIEW',
          linkUrl: '/dashboard/farmer/profile',
        },
      });

      return newReview;
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED') || error.message?.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
