import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { z } from 'zod';

const farmerProfileUpdateSchema = z.object({
  farmName: z.string().min(2).optional(),
  village: z.string().min(2).optional(),
  taluka: z.string().min(2).optional(),
  district: z.string().min(2).optional(),
  state: z.string().optional(),
  pinCode: z.string().min(6).optional(),
  primaryCrops: z.string().optional(),
  landSizeAcres: z.coerce.number().positive().optional(),
  bankAccountNo: z.string().optional(),
  bankIfsc: z.string().optional(),
  bankName: z.string().optional(),
});

const buyerProfileUpdateSchema = z.object({
  businessName: z.string().min(2).optional(),
  businessType: z.enum(['RESTAURANT', 'HOTEL', 'MESS', 'HOSTEL', 'CANTEEN', 'CATERER', 'OTHER']).optional(),
  contactPerson: z.string().min(2).optional(),
  gstin: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
});

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        farmerProfile: true,
        businessProfile: true,
        transportPartnerProfile: true,
        addresses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Never expose passwordHash
    const { passwordHash: _, ...safeUser } = user as any;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const userResult = userUpdateSchema.safeParse(body);
    if (!userResult.success) {
      return NextResponse.json(
        { error: userResult.error.errors[0]?.message || 'Invalid profile data' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Update base user fields if provided
      if (userResult.data.name || userResult.data.phone) {
        await tx.user.update({
          where: { id: session.userId },
          data: {
            ...(userResult.data.name ? { name: userResult.data.name.trim() } : {}),
            ...(userResult.data.phone ? { phone: userResult.data.phone.trim() } : {}),
          },
        });
      }

      if (session.role === 'FARMER') {
        const farmerResult = farmerProfileUpdateSchema.safeParse(body);
        if (farmerResult.success && Object.keys(farmerResult.data).length > 0) {
          await tx.farmerProfile.update({
            where: { userId: session.userId },
            data: farmerResult.data,
          });
        }
      } else if (session.role === 'BUYER') {
        const buyerResult = buyerProfileUpdateSchema.safeParse(body);
        if (buyerResult.success && Object.keys(buyerResult.data).length > 0) {
          await tx.businessProfile.update({
            where: { userId: session.userId },
            data: buyerResult.data,
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
