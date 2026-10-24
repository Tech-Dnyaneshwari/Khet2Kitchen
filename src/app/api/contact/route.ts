import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const { name, email, phone, subject, category, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    // Default to admin or demo user if not logged in
    let userId = session?.userId;
    if (!userId) {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      userId = admin?.id || '';
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject: `[${category || 'GENERAL'}] ${subject} (From: ${name || 'Guest'} - ${email || 'No email'})`,
        category: category || 'ACCOUNT',
        message: `${message}\n\nSender Contact: ${name || 'N/A'} | ${email || 'N/A'} | ${phone || 'N/A'}`,
        priority: 'NORMAL',
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: 'Support inquiry received! Our regional team will reach out within 2 hours.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
