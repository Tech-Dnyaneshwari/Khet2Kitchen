import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Invalid input fields' },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials. User does not exist.' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated by administrator.' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials. Incorrect password.' }, { status: 401 });
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
