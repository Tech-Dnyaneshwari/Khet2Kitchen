/**
 * Khet2Kitchen — shared domain types.
 *
 * These mirror the intended PostgreSQL / Prisma schema so the mock service layer
 * can be swapped for a real REST API with no changes to the UI. Enums are modelled
 * as string-literal unions (the values match what the backend will send).
 */

/* ------------------------------------------------------------------ */
/*  Enums                                                              */
/* ------------------------------------------------------------------ */

export type Role = 'FARMER' | 'RESTAURANT' | 'ADMIN';

export type CategoryId =
  | 'VEGETABLES'
  | 'FRUITS'
  | 'GRAINS'
  | 'PULSES'
  | 'HERBS'
  | 'SPICES'
  | 'OTHER';

export type Unit = 'KG' | 'QUINTAL' | 'TON' | 'DOZEN' | 'BOX' | 'CRATE' | 'PIECE' | 'LITRE';

export type Grade = 'A' | 'B' | 'C';

export type ProductStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SOLD_OUT'
  | 'REJECTED';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type BusinessType =
  | 'RESTAURANT'
  | 'HOTEL'
  | 'MESS'
  | 'CANTEEN'
  | 'CATERER'
  | 'FOOD_PROCESSOR'
  | 'OTHER';

/** The full order lifecycle, in order, powering the tracking timeline. */
export type OrderStatus =
  | 'REQUEST_SENT'
  | 'ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type FulfilmentType = 'DELIVERY' | 'PICKUP';

export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'COD';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type RequirementStatus = 'OPEN' | 'MATCHED' | 'CLOSED' | 'EXPIRED';

export type NotificationType = 'ORDER' | 'REQUIREMENT' | 'PAYMENT' | 'LISTING' | 'SYSTEM';

/* ------------------------------------------------------------------ */
/*  Core entities                                                      */
/* ------------------------------------------------------------------ */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Farmer {
  id: string;
  userId: string;
  farmName: string;
  ownerName: string;
  description: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  verificationStatus: VerificationStatus;
  rating: number;
  totalOrders: number;
  yearsSupplying: number;
  /** Distance from the current buyer, in km — computed by the backend in production. */
  distanceKm?: number;
  avatarKeyword: string;
  coverKeyword: string;
  accent: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  userId: string;
  restaurantName: string;
  ownerName: string;
  businessType: BusinessType;
  description: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  verificationStatus: VerificationStatus;
  rating: number;
  totalOrders: number;
  gstin?: string;
  logoKeyword: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  accent: string;
  imageKeyword: string;
  blurb: string;
}

export interface Product {
  id: string;
  farmerId: string;
  /** Denormalised farmer summary for convenient rendering (backend returns a join). */
  farmer?: FarmerSummary;
  categoryId: CategoryId;
  name: string;
  variety: string;
  description: string;
  quantity: number;
  unit: Unit;
  price: number;
  grade: Grade;
  harvestDate: string;
  availableFrom: string;
  availableUntil?: string;
  location: string;
  district: string;
  isAvailable: boolean;
  status: ProductStatus;
  /** Keyword(s) used to fetch a realistic photo, with graceful emoji fallback. */
  imageKeyword: string;
  emoji: string;
  rating: number;
  reviewsCount: number;
  minOrderQty: number;
  isOrganic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerSummary {
  id: string;
  farmName: string;
  ownerName: string;
  location: string;
  district: string;
  rating: number;
  verificationStatus: VerificationStatus;
  distanceKm?: number;
  accent: string;
}

export interface RequirementItem {
  id: string;
  categoryId: CategoryId;
  productName: string;
  quantity: number;
  unit: Unit;
  preferredPrice?: number;
}

export interface Requirement {
  id: string;
  restaurantId: string;
  restaurant?: Pick<Restaurant, 'id' | 'restaurantName' | 'businessType' | 'location' | 'district'>;
  items: RequirementItem[];
  requiredBy: string;
  fulfilment: FulfilmentType;
  location: string;
  district: string;
  notes?: string;
  status: RequirementStatus;
  matchesCount: number;
  createdAt: string;
}

/** A ranked farmer/product suggestion for a requirement. */
export interface Match {
  farmer: Farmer;
  product: Product;
  price: number;
  availableQty: number;
  distanceKm: number;
  score: number;
  reasons: string[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  categoryId: CategoryId;
  farmerId: string;
  farmerName: string;
  unit: Unit;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageKeyword: string;
  emoji: string;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  restaurantId: string;
  restaurantName: string;
  businessType: BusinessType;
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  items: OrderItem[];
  productTotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  fulfilment: FulfilmentType;
  deliveryDate: string;
  address?: string;
  status: OrderStatus;
  payment?: Payment;
  timeline: OrderTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  txnRef?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  audienceRole: Role;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId?: string;
  authorName: string;
  targetType: 'FARMER' | 'PRODUCT' | 'RESTAURANT';
  targetId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  contactName: string;
  contactPhone: string;
  line1: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

/* ------------------------------------------------------------------ */
/*  Auth / session                                                     */
/* ------------------------------------------------------------------ */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Linked profile id (farmerId / restaurantId) when applicable. */
  profileId?: string;
  avatarKeyword?: string;
  isDemo: boolean;
}

/* ------------------------------------------------------------------ */
/*  Query + stats helpers                                              */
/* ------------------------------------------------------------------ */

export type ProductSort = 'best' | 'price-lo' | 'price-hi' | 'distance' | 'fresh' | 'rating';

export interface ProductQuery {
  q?: string;
  category?: CategoryId | 'ALL';
  maxPrice?: number;
  maxDistanceKm?: number;
  minQuantity?: number;
  grade?: Grade;
  availableToday?: boolean;
  minRating?: number;
  sort?: ProductSort;
}

export interface FarmerStats {
  activeProducts: number;
  buyerRequests: number;
  activeOrders: number;
  monthSales: number;
  rating: number;
  lifetimeOrders: number;
  weeklySales: { label: string; value: number }[];
}

export interface AdminStats {
  totalFarmers: number;
  activeFarmers: number;
  totalRestaurants: number;
  activeRestaurants: number;
  productsListed: number;
  orders: number;
  gmv: number;
  revenue: number;
  ordersOverTime: { label: string; value: number }[];
  revenueOverTime: { label: string; value: number }[];
  topProducts: { name: string; value: number }[];
  topLocations: { name: string; value: number }[];
}

export interface ApiListResult<T> {
  data: T[];
  total: number;
}
