import type { ApiListResult, Farmer, FarmerStats, Review, VerificationStatus } from '@/types';
import { ApiError, isMock, mock, request } from './http';
import { db } from './db';

const ACTIVE_ORDER_STATES = new Set([
  'REQUEST_SENT', 'ACCEPTED', 'PAYMENT_PENDING', 'PAID', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY',
]);
const EARNED_ORDER_STATES = new Set(['PAID', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED']);

export async function getFarmer(id: string): Promise<Farmer> {
  if (!isMock) return request<Farmer>(`/farmers/${id}`);
  return mock(() => {
    const f = db.farmers.find((x) => x.id === id);
    if (!f) throw new ApiError('Farmer not found.', 404);
    return f;
  });
}

export interface FarmerQuery {
  q?: string;
  verification?: VerificationStatus;
}

export async function listFarmers(query: FarmerQuery = {}): Promise<ApiListResult<Farmer>> {
  if (!isMock) {
    const qs = new URLSearchParams(query as Record<string, string>).toString();
    return request<ApiListResult<Farmer>>(`/farmers${qs ? `?${qs}` : ''}`);
  }
  return mock(() => {
    let rows = [...db.farmers];
    if (query.verification) rows = rows.filter((f) => f.verificationStatus === query.verification);
    if (query.q) {
      const q = query.q.trim().toLowerCase();
      rows = rows.filter((f) =>
        [f.farmName, f.ownerName, f.district, f.location].some((s) => s.toLowerCase().includes(q)),
      );
    }
    return { data: rows, total: rows.length };
  });
}

export async function getFarmerStats(farmerId: string): Promise<FarmerStats> {
  if (!isMock) return request<FarmerStats>(`/farmers/${farmerId}/stats`);
  return mock(() => {
    const farmer = db.farmers.find((f) => f.id === farmerId);
    const products = db.products.filter((p) => p.farmerId === farmerId);
    const orders = db.orders.filter((o) => o.farmerId === farmerId);

    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
    const activeOrders = orders.filter((o) => ACTIVE_ORDER_STATES.has(o.status)).length;

    const monthAgo = Date.now() - 30 * 86_400_000;
    const monthSales = orders
      .filter((o) => EARNED_ORDER_STATES.has(o.status) && +new Date(o.createdAt) >= monthAgo)
      .reduce((s, o) => s + o.productTotal, 0);

    // Open buyer requirements whose category the farmer supplies.
    const myCategories = new Set(products.map((p) => p.categoryId));
    const buyerRequests = db.requirements.filter(
      (r) => r.status === 'OPEN' && r.items.some((i) => myCategories.has(i.categoryId)),
    ).length;

    // Last 7 days of earned sales, bucketed by day.
    const weeklySales = buildDailyBuckets(7).map(({ label, start, end }) => ({
      label,
      value: orders
        .filter((o) => {
          const t = +new Date(o.createdAt);
          return EARNED_ORDER_STATES.has(o.status) && t >= start && t < end;
        })
        .reduce((s, o) => s + o.productTotal, 0),
    }));

    return {
      activeProducts,
      buyerRequests,
      activeOrders,
      monthSales,
      rating: farmer?.rating ?? 0,
      lifetimeOrders: farmer?.totalOrders ?? orders.length,
      weeklySales,
    };
  });
}

export async function getFarmerReviews(farmerId: string): Promise<Review[]> {
  if (!isMock) return request<Review[]>(`/farmers/${farmerId}/reviews`);
  return mock(() => db.reviews.filter((r) => r.targetType === 'FARMER' && r.targetId === farmerId));
}

export async function setVerification(id: string, status: VerificationStatus): Promise<Farmer> {
  if (!isMock) {
    return request<Farmer>(`/farmers/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
  return mock(() => {
    const f = db.farmers.find((x) => x.id === id);
    if (!f) throw new ApiError('Farmer not found.', 404);
    f.verificationStatus = status;
    f.updatedAt = new Date().toISOString();
    return f;
  });
}

export async function updateFarmer(id: string, patch: Partial<Farmer>): Promise<Farmer> {
  if (!isMock) {
    return request<Farmer>(`/farmers/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  }
  return mock(() => {
    const f = db.farmers.find((x) => x.id === id);
    if (!f) throw new ApiError('Farmer not found.', 404);
    Object.assign(f, patch, { updatedAt: new Date().toISOString() });
    return f;
  });
}

/** Day buckets for the last `n` days, oldest first, labelled Mon/Tue/… */
function buildDailyBuckets(n: number): { label: string; start: number; end: number }[] {
  const out: { label: string; start: number; end: number }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    out.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      start,
      end: start + 86_400_000,
    });
  }
  return out;
}
