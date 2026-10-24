import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { adminSettingsSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['ADMIN']);
    const body = await req.json();

    const validated = adminSettingsSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Invalid settings values' },
        { status: 400 }
      );
    }

    const {
      commission_rate_percent,
      logistics_base_fee,
      logistics_per_km_fee,
      default_buyer_subscription_price,
    } = validated.data;

    await prisma.$transaction([
      prisma.platformSettings.upsert({
        where: { key: 'commission_rate_percent' },
        update: { value: commission_rate_percent.toString(), updatedAt: new Date() },
        create: {
          key: 'commission_rate_percent',
          value: commission_rate_percent.toString(),
          description: 'Platform commission percent',
          updatedAt: new Date(),
        },
      }),
      prisma.platformSettings.upsert({
        where: { key: 'logistics_base_fee' },
        update: { value: logistics_base_fee.toString(), updatedAt: new Date() },
        create: {
          key: 'logistics_base_fee',
          value: logistics_base_fee.toString(),
          description: 'Base logistics charge',
          updatedAt: new Date(),
        },
      }),
      prisma.platformSettings.upsert({
        where: { key: 'logistics_per_km_fee' },
        update: { value: logistics_per_km_fee.toString(), updatedAt: new Date() },
        create: {
          key: 'logistics_per_km_fee',
          value: logistics_per_km_fee.toString(),
          description: 'Logistics per km charge',
          updatedAt: new Date(),
        },
      }),
      prisma.platformSettings.upsert({
        where: { key: 'default_buyer_subscription_price' },
        update: { value: default_buyer_subscription_price.toString(), updatedAt: new Date() },
        create: {
          key: 'default_buyer_subscription_price',
          value: default_buyer_subscription_price.toString(),
          description: 'Monthly subscription fee',
          updatedAt: new Date(),
        },
      }),
      // Audit log
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'PLATFORM_SETTINGS_UPDATED',
          entityType: 'SETTINGS',
          detailsJson: JSON.stringify(validated.data),
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Platform financial settings updated.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
