import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'khet2kitchen_super_secret_jwt_key_2026_min32chars_secure';
const encodedKey = new TextEncoder().encode(JWT_SECRET);
const SESSION_COOKIE_NAME = 'k2k_session';

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'FARMER' | 'BUYER' | 'TRANSPORT_PARTNER' | 'ADMIN';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<(SessionPayload & { fullUser?: any }) | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session?.userId) return null;

    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        farmerProfile: true,
        businessProfile: true,
        transportPartnerProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
      fullUser: user,
    };
  } catch (err) {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function removeSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: Array<'FARMER' | 'BUYER' | 'TRANSPORT_PARTNER' | 'ADMIN'>) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('UNAUTHORIZED: Authentication required to access this resource.');
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw new Error(`FORBIDDEN: Access restricted. Required role: ${allowedRoles.join(' or ')}.`);
  }

  return session;
}
