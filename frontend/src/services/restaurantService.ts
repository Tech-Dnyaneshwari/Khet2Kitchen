import type { ApiListResult, Restaurant, VerificationStatus } from '@/types';
import { ApiError, isMock, mock, request } from './http';
import { db } from './db';

export async function getRestaurant(id: string): Promise<Restaurant> {
  if (!isMock) return request<Restaurant>(`/restaurants/${id}`);
  return mock(() => {
    const r = db.restaurants.find((x) => x.id === id);
    if (!r) throw new ApiError('Business not found.', 404);
    return r;
  });
}

export interface RestaurantQuery {
  q?: string;
  verification?: VerificationStatus;
}

export async function listRestaurants(query: RestaurantQuery = {}): Promise<ApiListResult<Restaurant>> {
  if (!isMock) {
    const qs = new URLSearchParams(query as Record<string, string>).toString();
    return request<ApiListResult<Restaurant>>(`/restaurants${qs ? `?${qs}` : ''}`);
  }
  return mock(() => {
    let rows = [...db.restaurants];
    if (query.verification) rows = rows.filter((r) => r.verificationStatus === query.verification);
    if (query.q) {
      const q = query.q.trim().toLowerCase();
      rows = rows.filter((r) =>
        [r.restaurantName, r.ownerName, r.district, r.location].some((s) => s.toLowerCase().includes(q)),
      );
    }
    return { data: rows, total: rows.length };
  });
}

export async function setVerification(id: string, status: VerificationStatus): Promise<Restaurant> {
  if (!isMock) {
    return request<Restaurant>(`/restaurants/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
  return mock(() => {
    const r = db.restaurants.find((x) => x.id === id);
    if (!r) throw new ApiError('Business not found.', 404);
    r.verificationStatus = status;
    r.updatedAt = new Date().toISOString();
    return r;
  });
}

export async function updateRestaurant(id: string, patch: Partial<Restaurant>): Promise<Restaurant> {
  if (!isMock) {
    return request<Restaurant>(`/restaurants/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  }
  return mock(() => {
    const r = db.restaurants.find((x) => x.id === id);
    if (!r) throw new ApiError('Business not found.', 404);
    Object.assign(r, patch, { updatedAt: new Date().toISOString() });
    return r;
  });
}
