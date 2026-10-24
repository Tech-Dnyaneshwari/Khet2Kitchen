import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const data = validated.data;
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email address already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);

    // Create user and profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          name: data.name.trim(),
          phone: data.phone.trim(),
          role: data.role as any,
          isActive: true,
          isVerified: false,
        },
      });

      if (data.role === 'FARMER') {
        await tx.farmerProfile.create({
          data: {
            userId: user.id,
            farmName: data.farmName || `${data.name}'s Farm`,
            village: data.village || 'Local Village',
            taluka: data.taluka || 'Taluka',
            district: data.district || 'Pune',
            pinCode: '411001',
            primaryCrops: data.primaryCrops || 'Tomato,Onion',
            isVerified: false,
            verificationStatus: 'PENDING',
          },
        });
      } else if (data.role === 'BUYER') {
        const profile = await tx.businessProfile.create({
          data: {
            userId: user.id,
            businessName: data.businessName || `${data.name}'s Kitchen`,
            businessType: (data.businessType as any) || 'RESTAURANT',
            contactPerson: data.name,
            gstin: data.gstin || null,
            city: data.city || 'Pune',
            district: 'Pune',
            pinCode: '411001',
            isVerified: false,
            verificationStatus: 'PENDING',
          },
        });

        // Initialize empty cart
        await tx.cart.create({
          data: { buyerId: user.id },
        });

        // Initialize default delivery address
        await tx.address.create({
          data: {
            userId: user.id,
            label: 'Primary Kitchen',
            street: 'Main Delivery Gate',
            city: data.city || 'Pune',
            district: 'Pune',
            pinCode: '411001',
            isDefault: true,
          },
        });
      } else if (data.role === 'TRANSPORT_PARTNER') {
        await tx.transportPartnerProfile.create({
          data: {
            userId: user.id,
            vehicleType: (data.vehicleType as any) || 'MINI_TRUCK',
            vehicleNumber: data.vehicleNumber || `MH-${Math.floor(10 + Math.random() * 89)}-AB-${Math.floor(1000 + Math.random() * 8999)}`,
            maxPayloadKg: data.maxPayloadKg || 1200,
            drivingLicenseNo: data.drivingLicenseNo || 'MH12-PENDING-VERIFICATION',
            isVerified: false,
            verificationStatus: 'PENDING',
            isAvailable: true,
          },
        });
      }

      // Add welcome notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Khet2Kitchen!',
          message: 'Your account is ready. Explore wholesale farm lots or submit verification details.',
          type: 'SYSTEM',
          linkUrl: '/',
        },
      });

      return user;
    });

    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as any,
      name: newUser.name,
    });

    const redirectMap: Record<string, string> = {
      FARMER: '/dashboard/farmer',
      BUYER: '/dashboard/buyer',
      TRANSPORT_PARTNER: '/dashboard/transport',
      ADMIN: '/dashboard/admin',
    };

    return NextResponse.json({
      success: true,
      role: newUser.role,
      redirectUrl: redirectMap[newUser.role] || '/',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
