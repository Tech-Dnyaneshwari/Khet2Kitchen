import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo user not found. Please run seed.' }, { status: 404 });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const redirectMap: Record<string, string> = {
      FARMER: '/dashboard/farmer',
      BUYER: '/dashboard/buyer',
      TRANSPORT_PARTNER: '/dashboard/transport',
      ADMIN: '/dashboard/admin',
    };

    return NextResponse.json({
      success: true,
      role: user.role,
      redirectUrl: redirectMap[user.role] || '/',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
