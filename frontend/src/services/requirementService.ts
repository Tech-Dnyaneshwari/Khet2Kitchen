import type {
  FulfilmentType,
  Match,
  Requirement,
  RequirementItem,
  Product,
} from '@/types';
import { pricePerUnit } from '@/utils/format';
import { ApiError, isMock, mock, nextId, request } from './http';
import { db } from './db';

export interface RequirementQuery {
  restaurantId?: string;
}

export async function listRequirements(query: RequirementQuery = {}): Promise<Requirement[]> {
  if (!isMock) {
    const qs = new URLSearchParams(query as Record<string, string>).toString();
    return request<Requirement[]>(`/requirements${qs ? `?${qs}` : ''}`);
  }
  return mock(() => {
    let rows = [...db.requirements];
    if (query.restaurantId) rows = rows.filter((r) => r.restaurantId === query.restaurantId);
    return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  });
}

export async function getRequirement(id: string): Promise<Requirement> {
  if (!isMock) return request<Requirement>(`/requirements/${id}`);
  return mock(() => {
    const r = db.requirements.find((x) => x.id === id);
    if (!r) throw new ApiError('Requirement not found.', 404);
    return r;
  });
}

export interface CreateRequirementInput {
  restaurantId: string;
  items: Omit<RequirementItem, 'id'>[];
  requiredBy: string;
  fulfilment: FulfilmentType;
  location: string;
  district: string;
  notes?: string;
}

export async function createRequirement(input: CreateRequirementInput): Promise<Requirement> {
  if (!isMock) {
    return request<Requirement>('/requirements', { method: 'POST', body: JSON.stringify(input) });
  }
  return mock(() => {
    const restaurant = db.restaurants.find((r) => r.id === input.restaurantId);
    if (!restaurant) throw new ApiError('Business profile not found.', 404);
    if (!input.items.length) throw new ApiError('Add at least one item to your requirement.', 400);

    const requirement: Requirement = {
      id: nextId('rq'),
      restaurantId: restaurant.id,
      restaurant: {
        id: restaurant.id, restaurantName: restaurant.restaurantName,
        businessType: restaurant.businessType, location: restaurant.location, district: restaurant.district,
      },
      items: input.items.map((i) => ({ ...i, id: nextId('ri') })),
      requiredBy: input.requiredBy,
      fulfilment: input.fulfilment,
      location: input.location,
      district: input.district,
      notes: input.notes,
      status: 'OPEN',
      matchesCount: 0,
      createdAt: new Date().toISOString(),
    };
    // Pre-compute the match count so the card shows it immediately.
    requirement.matchesCount = computeMatches(requirement).length;
    if (requirement.matchesCount > 0) requirement.status = 'MATCHED';
    db.requirements.unshift(requirement);
    return requirement;
  }, 560);
}

export async function closeRequirement(id: string): Promise<Requirement> {
  if (!isMock) return request<Requirement>(`/requirements/${id}/close`, { method: 'PATCH' });
  return mock(() => {
    const r = db.requirements.find((x) => x.id === id);
    if (!r) throw new ApiError('Requirement not found.', 404);
    r.status = 'CLOSED';
    return r;
  });
}

/** Smart matches for a requirement, ranked, each with human-readable reasons. */
export async function getMatches(requirementId: string): Promise<Match[]> {
  if (!isMock) return request<Match[]>(`/requirements/${requirementId}/matches`);
  return mock(() => {
    const requirement = db.requirements.find((r) => r.id === requirementId);
    if (!requirement) throw new ApiError('Requirement not found.', 404);
    return computeMatches(requirement);
  }, 480);
}

/* ------------------------------------------------------------------ */
/*  Matching engine                                                    */
/* ------------------------------------------------------------------ */

function computeMatches(requirement: Requirement): Match[] {
  const candidates: Match[] = [];

  for (const item of requirement.items) {
    const pool = db.products.filter(
      (p) => p.status === 'ACTIVE' && p.isAvailable && p.categoryId === item.categoryId,
    );
    // Prices in the pool, to judge "best price" relatively.
    const prices = pool.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    for (const product of pool) {
      const farmer = db.farmers.find((f) => f.id === product.farmerId);
      if (!farmer) continue;

      const distanceKm = farmer.distanceKm ?? product.farmer?.distanceKm ?? 120;
      const hasStock = product.quantity >= item.quantity;
      const nameMatch = product.name.toLowerCase() === item.productName.trim().toLowerCase();

      const { score, reasons } = scoreMatch({
        product, distanceKm, hasStock, nameMatch,
        item, minPrice, maxPrice, verified: farmer.verificationStatus === 'VERIFIED',
      });

      candidates.push({
        farmer,
        product,
        price: product.price,
        availableQty: product.quantity,
        distanceKm,
        score,
        reasons,
      });
    }
  }

  // De-duplicate by product (a product can match only once) and rank.
  const seen = new Set<string>();
  return candidates
    .sort((a, b) => b.score - a.score)
    .filter((m) => (seen.has(m.product.id) ? false : (seen.add(m.product.id), true)))
    .slice(0, 8);
}

function scoreMatch(args: {
  product: Product;
  distanceKm: number;
  hasStock: boolean;
  nameMatch: boolean;
  item: RequirementItem;
  minPrice: number;
  maxPrice: number;
  verified: boolean;
}): { score: number; reasons: string[] } {
  const { product, distanceKm, hasStock, nameMatch, item, minPrice, maxPrice, verified } = args;
  const reasons: string[] = [];
  let score = 0;

  // Exact produce name is the strongest signal.
  if (nameMatch) {
    score += 40;
    reasons.push(`Exact match for ${item.productName}`);
  }

  // Price — cheaper is better; call out the best in the pool.
  const priceSpan = Math.max(1, maxPrice - minPrice);
  score += ((maxPrice - product.price) / priceSpan) * 25;
  if (product.price === minPrice) {
    reasons.push(`Best price — ${pricePerUnit(product.price, product.unit)}`);
  } else if (item.preferredPrice && product.price <= item.preferredPrice) {
    reasons.push(`Within your budget at ${pricePerUnit(product.price, product.unit)}`);
  }

  // Proximity.
  score += Math.max(0, 25 - distanceKm / 8);
  if (distanceKm <= 40) reasons.push(`Only ${Math.round(distanceKm)} km away`);

  // Stock.
  if (hasStock) {
    score += 12;
    reasons.push(`Has ${product.quantity} ${product.unit.toLowerCase()} ready`);
  } else {
    reasons.push('Limited stock — confirm quantity');
  }

  // Trust signals.
  score += product.rating * 2;
  if (product.rating >= 4.7) reasons.push(`Top rated ${product.rating.toFixed(1)}★`);
  if (verified) {
    score += 6;
    reasons.push('Verified farmer');
  }
  if (product.isOrganic) {
    score += 3;
    reasons.push('Certified organic');
  }

  return { score: Math.round(score), reasons: reasons.slice(0, 4) };
}
