import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { produceListingSchema } from '@/lib/validations';

// GET: public or filtered produce listings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const grade = searchParams.get('grade');
    const query = searchParams.get('q');
    const maxPrice = searchParams.get('maxPrice');
    const farmerId = searchParams.get('farmerId');
    const status = searchParams.get('status') || 'ACTIVE';

    const where: any = {};
    if (status !== 'all') {
      where.status = status;
    }
    if (farmerId) {
      where.farmerId = farmerId;
    }
    if (category && category !== 'all') {
      where.category = { slug: category };
    }
    if (grade && grade !== 'all') {
      where.qualityGrade = grade;
    }
    if (maxPrice) {
      where.pricePerUnit = { lte: parseFloat(maxPrice) };
    }
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { farmer: { farmName: { contains: query } } },
      ];
    }

    const produce = await prisma.produceListing.findMany({
      where,
      include: {
        farmer: true,
        category: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, produce });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create produce listing (Farmer or Admin)
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(['FARMER', 'ADMIN']);
    const body = await req.json();

    const validated = produceListingSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Invalid listing fields' },
        { status: 400 }
      );
    }

    const data = validated.data;

    let farmerId = body.farmerId;
    if (session.role === 'FARMER') {
      const farmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!farmerProfile) {
        return NextResponse.json({ error: 'Farmer profile not found for this user.' }, { status: 404 });
      }
      farmerId = farmerProfile.id;
    }

    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newListing = await prisma.produceListing.create({
      data: {
        farmerId,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        qualityGrade: data.qualityGrade as any,
        unit: data.unit,
        pricePerUnit: data.pricePerUnit,
        availableStockKg: data.availableStockKg,
        minOrderQuantityKg: data.minOrderQuantityKg,
        harvestDate: data.harvestDate,
        availabilityDate: data.availabilityDate,
        status: data.availableStockKg > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
        isFeatured: data.isFeatured,
        images: data.imageUrl
          ? {
              create: [
                {
                  imageUrl: data.imageUrl,
                  isPrimary: true,
                  order: 1,
                },
              ],
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, produce: newListing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update produce listing or quick quantity update
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(['FARMER', 'ADMIN']);
    const body = await req.json();
    const { id, pricePerUnit, availableStockKg, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
    }

    const existing = await prisma.produceListing.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    // Security check: verify farmer ownership
    if (session.role === 'FARMER' && existing.farmer.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized: You can only edit your own produce listings.' }, { status: 403 });
    }

    const updateData: any = {};
    if (pricePerUnit !== undefined) updateData.pricePerUnit = parseFloat(pricePerUnit);
    if (availableStockKg !== undefined) {
      updateData.availableStockKg = parseFloat(availableStockKg);
      if (updateData.availableStockKg <= 0) {
        updateData.status = 'OUT_OF_STOCK';
      }
    }
    if (status !== undefined) updateData.status = status;

    const updated = await prisma.produceListing.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Deactivate listing
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(['FARMER', 'ADMIN']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required.' }, { status: 400 });
    }

    const existing = await prisma.produceListing.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (session.role === 'FARMER' && existing.farmer.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized: You can only delete your own produce listings.' }, { status: 403 });
    }

    await prisma.produceListing.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true, message: 'Produce listing archived.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
