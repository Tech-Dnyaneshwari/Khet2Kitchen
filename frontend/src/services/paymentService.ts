import type { Payment, PaymentMethod } from '@/types';
import { ApiError, isMock, mock, nextId, request } from './http';
import { db } from './db';

/**
 * MOCK payment gateway.
 *
 * This is deliberately fake. No real payment credentials, secret keys or card
 * data ever touch the frontend. In production the browser only receives a
 * client token / order id from the backend, which talks to the real gateway
 * server-side. Here we simply flip the order to PAID after a short delay.
 */

export interface PayInput {
  orderId: string;
  method: PaymentMethod;
}

export async function pay(input: PayInput): Promise<Payment> {
  if (!isMock) {
    return request<Payment>(`/orders/${input.orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ method: input.method }),
    });
  }
  return mock(() => {
    const order = db.orders.find((o) => o.id === input.orderId);
    if (!order) throw new ApiError('Order not found.', 404);
    if (order.payment?.status === 'PAID') return order.payment;

    const now = new Date().toISOString();
    const payment: Payment = {
      id: nextId('pay'),
      orderId: order.id,
      method: input.method,
      status: 'PAID',
      amount: order.total,
      txnRef: `${input.method}-${Math.floor(100000 + Math.random() * 899999)}DEMO`,
      createdAt: now,
    };
    order.payment = payment;
    order.status = 'PAID';
    order.updatedAt = now;
    order.timeline = [...order.timeline, { status: 'PAID', at: now, note: `Paid via ${input.method}` }];
    return payment;
  }, 900);
}

export async function getPayment(orderId: string): Promise<Payment | null> {
  if (!isMock) return request<Payment | null>(`/orders/${orderId}/payment`);
  return mock(() => db.orders.find((o) => o.id === orderId)?.payment ?? null);
}
