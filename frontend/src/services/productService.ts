import type { ApiListResult, Category, Product, ProductQuery, ProductStatus } from '@/types';
import { CATEGORIES } from '@/utils/catalog';
import { ApiError, isMock, mock, nextId, request } from './http';
import { db } from './db';

export async function listCategories(): Promise<Category[]> {
  return mock(() => [...CATEGORIES], 120);
}

/** Buyer-facing catalogue: only live, in-stock listings, with search/filter/sort. */
export async function listProducts(query: ProductQuery = {}): Promise<ApiListResult<Product>> {
  if (!isMock) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v != null && v !== '') as [string, string][],
    ).toString();
    return request<ApiListResult<Product>>(`/products${qs ? `?${qs}` : ''}`);
  }
  return mock(() => {
    let rows = db.products.filter((p) => p.status === 'ACTIVE' && p.isAvailable);

    if (query.category && query.category !== 'ALL') {
      rows = rows.filter((p) => p.categoryId === query.category);
    }
    if (query.q) {
      const q = query.q.trim().toLowerCase();
      rows = rows.filter((p) =>
        [p.name, p.variety, p.farmer?.farmName, p.district, p.location]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().includes(q)),
      );
    }
    if (query.maxPrice != null) rows = rows.filter((p) => p.price <= query.maxPrice!);
    if (query.maxDistanceKm != null) {
      rows = rows.filter((p) => (p.farmer?.distanceKm ?? Infinity) <= query.maxDistanceKm!);
    }
    if (query.minQuantity != null) rows = rows.filter((p) => p.quantity >= query.minQuantity!);
    if (query.grade) rows = rows.filter((p) => p.grade === query.grade);
    if (query.minRating != null) rows = rows.filter((p) => p.rating >= query.minRating!);

    const sorted = sortProducts(rows, query.sort ?? 'best');
    return { data: sorted, total: sorted.length };
  });
}

function sortProducts(rows: Product[], sort: NonNullable<ProductQuery['sort']>): Product[] {
  const copy = [...rows];
  switch (sort) {
    case 'price-lo':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-hi':
      return copy.sort((a, b) => b.price - a.price);
    case 'distance':
      return copy.sort((a, b) => (a.farmer?.distanceKm ?? 1e9) - (b.farmer?.distanceKm ?? 1e9));
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'fresh':
      return copy.sort((a, b) => +new Date(b.harvestDate) - +new Date(a.harvestDate));
    case 'best':
    default:
      // Blend rating, proximity and freshness into a simple relevance score.
      return copy.sort((a, b) => bestScore(b) - bestScore(a));
  }
}

function bestScore(p: Product): number {
  const distance = p.farmer?.distanceKm ?? 200;
  const proximity = Math.max(0, 1 - distance / 350); // 0..1
  const freshnessDays = (Date.now() - +new Date(p.harvestDate)) / 86_400_000;
  const freshness = Math.max(0, 1 - freshnessDays / 10);
  return p.rating * 2 + proximity * 3 + freshness * 2 + (p.isOrganic ? 0.5 : 0);
}

export async function getProduct(id: string): Promise<Product> {
  if (!isMock) return request<Product>(`/products/${id}`);
  return mock(() => {
    const p = db.products.find((x) => x.id === id);
    if (!p) throw new ApiError('Product not found.', 404);
    return p;
  });
}

/** Every listing for a farmer, all statuses — for the farmer's own dashboard. */
export async function listByFarmer(farmerId: string): Promise<Product[]> {
  if (!isMock) return request<Product[]>(`/farmers/${farmerId}/products`);
  return mock(() => db.products.filter((p) => p.farmerId === farmerId));
}

export async function relatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return mock(
    () =>
      db.products
        .filter(
          (p) =>
            p.id !== product.id &&
            p.status === 'ACTIVE' &&
            p.isAvailable &&
            p.categoryId === product.categoryId,
        )
        .slice(0, limit),
    150,
  );
}

export interface CreateProductInput {
  farmerId: string;
  categoryId: Product['categoryId'];
  name: string;
  variety: string;
  description?: string;
  price: number;
  unit: Product['unit'];
  quantity: number;
  minOrderQty: number;
  grade: Product['grade'];
  harvestDate: string;
  availableUntil?: string;
  isOrganic?: boolean;
  emoji?: string;
  imageKeyword?: string;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  if (!isMock) {
    return request<Product>('/products', { method: 'POST', body: JSON.stringify(input) });
  }
  return mock(() => {
    if (!input.name?.trim()) throw new ApiError('Product name is required.', 400);
    if (input.price <= 0) throw new ApiError('Price must be greater than zero.', 400);
    if (input.quantity <= 0) throw new ApiError('Quantity must be greater than zero.', 400);

    const farmer = db.farmers.find((f) => f.id === input.farmerId);
    const now = new Date().toISOString();
    const product: Product = {
      id: nextId('p'),
      farmerId: input.farmerId,
      farmer: farmer && {
        id: farmer.id, farmName: farmer.farmName, ownerName: farmer.ownerName,
        location: farmer.location, district: farmer.district, rating: farmer.rating,
        verificationStatus: farmer.verificationStatus, distanceKm: farmer.distanceKm, accent: farmer.accent,
      },
      categoryId: input.categoryId,
      name: input.name.trim(),
      variety: input.variety.trim(),
      description: input.description?.trim() || `Fresh ${input.name.toLowerCase()} from ${farmer?.farmName ?? 'our farm'}.`,
      quantity: input.quantity,
      unit: input.unit,
      price: input.price,
      grade: input.grade,
      harvestDate: input.harvestDate,
      availableFrom: now,
      availableUntil: input.availableUntil,
      location: farmer?.location ?? 'Pune',
      district: farmer?.district ?? 'Pune',
      isAvailable: true,
      // New listings await admin approval, matching the backend workflow.
      status: 'PENDING_APPROVAL',
      imageKeyword: input.imageKeyword?.trim() || `${input.name},fresh`,
      emoji: input.emoji || '🧺',
      rating: 0,
      reviewsCount: 0,
      minOrderQty: input.minOrderQty,
      isOrganic: input.isOrganic ?? false,
      createdAt: now,
      updatedAt: now,
    };
    db.products.unshift(product);
    return product;
  }, 520);
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product> {
  if (!isMock) {
    return request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
  }
  return mock(() => {
    const p = db.products.find((x) => x.id === id);
    if (!p) throw new ApiError('Product not found.', 404);
    Object.assign(p, patch, { updatedAt: new Date().toISOString() });
    return p;
  });
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<Product> {
  return updateProduct(id, { status, isAvailable: status === 'ACTIVE' });
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isMock) {
    await request(`/products/${id}`, { method: 'DELETE' });
    return;
  }
  await mock(() => {
    const i = db.products.findIndex((x) => x.id === id);
    if (i === -1) throw new ApiError('Product not found.', 404);
    db.products.splice(i, 1);
  });
}
