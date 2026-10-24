import { NextResponse } from 'next/server';
import { removeSessionCookie } from '@/lib/auth';

export async function POST() {
  removeSessionCookie();
  return NextResponse.json({ success: true, message: 'Signed out successfully' });
}
