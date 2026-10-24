import type { FulfilmentType, Order, OrderItem, OrderStatus, Role } from '@/types';
import { ApiError, isMock, mock, nextId, request } from './http';
import { db } from './db';

function computeTotals(items: OrderItem[]) {
  const productTotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const deliveryFee = productTotal >= 5000 ? 0 : 300;
  const platformFee = Math.round(productTotal * 0.02);
  return { productTotal, deliveryFee, platformFee, total: productTotal + deliveryFee + platformFee };
}

let orderNoSeq = 1027;
function nextOrderNo(): string {
  orderNoSeq += 1;
  return `KK${orderNoSeq}`;
}

export interface OrderScope {
  role: Role;
  profileId?: string;
  status?: OrderStatus;
}

/** Orders visible to the current actor: a farmer sees theirs, a buyer theirs, admin all. */
export async function listOrders(scope: OrderScope): Promise<Order[]> {
  if (!isMock) {
    const qs = new URLSearchParams(scope as unknown as Record<string, string>).toString();
    return request<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
  }
  return mock(() => {
    let rows = [...db.orders];
    if (scope.role === 'FARMER' && scope.profileId) {
      rows = rows.filter((o) => o.farmerId === scope.profileId);
    } else if (scope.role === 'RESTAURANT' && scope.profileId) {
      rows = rows.filter((o) => o.restaurantId === scope.profileId);
    }
    if (scope.status) rows = rows.filter((o) => o.status === scope.status);
    return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  });
}

export async function getOrder(id: string): Promise<Order> {
  if (!isMock) return request<Order>(`/orders/${id}`);
  return mock(() => {
    const o = db.orders.find((x) => x.id === id);
    if (!o) throw new ApiError('Order not found.', 404);
    return o;
  });
}

export interface CreateOrderInput {
  restaurantId: string;
  items: { productId: string; quantity: number }[];
  fulfilment: FulfilmentType;
  deliveryDate: string;
  address?: string;
  note?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!isMock) {
    return request<Order>('/orders', { method: 'POST', body: JSON.stringify(input) });
  }
  return mock(() => {
    const restaurant = db.restaurants.find((r) => r.id === input.restaurantId);
    if (!restaurant) throw new ApiError('Business profile not found.', 404);
    if (!input.items.length) throw new ApiError('Add at least one product to your order.', 400);

    const items: OrderItem[] = input.items.map(({ productId, quantity }) => {
      const p = db.products.find((x) => x.id === productId);
      if (!p) throw new ApiError('One of the products is no longer available.', 404);
      if (quantity < p.minOrderQty) {
        throw new ApiError(`Minimum order for ${p.name} is ${p.minOrderQty} ${p.unit.toLowerCase()}.`, 400);
      }
      return {
        id: nextId('oi'),
        productId: p.id, productName: p.name, categoryId: p.categoryId,
        farmerId: p.farmerId, farmerName: p.farmer?.farmName ?? '', unit: p.unit,
        unitPrice: p.price, quantity, lineTotal: p.price * quantity,
        imageKeyword: p.imageKeyword, emoji: p.emoji,
      };
    });

    // A single order is to one farm (matches the request-to-farmer model).
    const farmerId = items[0].farmerId;
    if (!items.every((i) => i.farmerId === farmerId)) {
      throw new ApiError('Please order from one farm at a time.', 400);
    }
    const farmer = db.farmers.find((f) => f.id === farmerId);
    const now = new Date().toISOString();

    const order: Order = {
      id: nextId('o'),
      orderNo: nextOrderNo(),
      restaurantId: restaurant.id, restaurantName: restaurant.restaurantName, businessType: restaurant.businessType,
      farmerId, farmerName: farmer?.farmName ?? items[0].farmerName,
      farmLocation: farmer ? `${farmer.location}, ${farmer.district}` : '',
      items,
      ...computeTotals(items),
      fulfilment: input.fulfilment,
      deliveryDate: input.deliveryDate,
      address: input.fulfilment === 'DELIVERY' ? input.address : undefined,
      status: 'REQUEST_SENT',
      timeline: [{ status: 'REQUEST_SENT', at: now, note: input.note || 'Request sent to farmer' }],
      createdAt: now,
      updatedAt: now,
    };
    db.orders.unshift(order);
    return order;
  }, 620);
}

export async function updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
  if (!isMock) {
    return request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }
  return mock(() => {
    const o = db.orders.find((x) => x.id === id);
    if (!o) throw new ApiError('Order not found.', 404);
    const now = new Date().toISOString();
    o.status = status;
    o.updatedAt = now;
    o.timeline = [...o.timeline, { status, at: now, note }];
    return o;
  });
}

export const acceptOrder = (id: string) => updateOrderStatus(id, 'ACCEPTED', 'Farmer accepted the request');
export const rejectOrder = (id: string, note?: string) => updateOrderStatus(id, 'REJECTED', note || 'Farmer could not fulfil this order');
export const cancelOrder = (id: string, note?: string) => updateOrderStatus(id, 'CANCELLED', note || 'Cancelled by buyer');
export const markPreparing = (id: string) => updateOrderStatus(id, 'PREPARING', 'Farmer is preparing your order');
export const markOutForDelivery = (id: string) => updateOrderStatus(id, 'OUT_FOR_DELIVERY', 'Order dispatched');
export const markDelivered = (id: string) => updateOrderStatus(id, 'DELIVERED', 'Order delivered');
export const completeOrder = (id: string) => updateOrderStatus(id, 'COMPLETED', 'Order completed');

export async function recentOrders(limit = 8): Promise<Order[]> {
  if (!isMock) return request<Order[]>(`/orders/recent?limit=${limit}`);
  return mock(() =>
    [...db.orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, limit),
  );
}
