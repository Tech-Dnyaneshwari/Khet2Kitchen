import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { transitionOrderStatus, OrderStatus } from '@/lib/order-state-machine';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { status, note } = body;

    if (!status) {
      return NextResponse.json({ error: 'Target status is required.' }, { status: 400 });
    }

    const updatedOrder = await transitionOrderStatus({
      orderId: params.id,
      targetStatus: status as OrderStatus,
      changedById: session.userId,
      actorRole: session.role,
      note,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
