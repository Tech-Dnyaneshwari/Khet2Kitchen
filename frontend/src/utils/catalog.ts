import type {
  BusinessType,
  Category,
  CategoryId,
  Grade,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  Unit,
  VerificationStatus,
} from '@/types';

/** Semantic tone used by <Badge> / <StatusBadge>. */
export type Tone = 'green' | 'amber' | 'blue' | 'red' | 'neutral' | 'soil';

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

export const CATEGORIES: Category[] = [
  { id: 'VEGETABLES', name: 'Vegetables', emoji: '🥬', accent: '#2F7A34', imageKeyword: 'fresh,vegetables,harvest', blurb: 'Leafy greens & everyday sabzi' },
  { id: 'FRUITS', name: 'Fruits', emoji: '🥭', accent: '#C1651B', imageKeyword: 'fresh,fruits,orchard', blurb: 'Orchard-picked, seasonal' },
  { id: 'GRAINS', name: 'Grains', emoji: '🌾', accent: '#A67C12', imageKeyword: 'wheat,rice,grain,field', blurb: 'Rice, wheat, jowar & more' },
  { id: 'PULSES', name: 'Pulses', emoji: '🫘', accent: '#8A6D3B', imageKeyword: 'lentils,pulses,dal', blurb: 'Dals & legumes in bulk' },
  { id: 'HERBS', name: 'Herbs', emoji: '🌿', accent: '#1E8A6B', imageKeyword: 'fresh,herbs,coriander', blurb: 'Aromatic & fresh-cut' },
  { id: 'SPICES', name: 'Spices', emoji: '🌶️', accent: '#B4472E', imageKeyword: 'indian,spices,chilli', blurb: 'Ginger, garlic, chilli' },
  { id: 'OTHER', name: 'Other', emoji: '🧺', accent: '#5E6B60', imageKeyword: 'farm,produce,agriculture', blurb: 'Other farm produce' },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => ((acc[c.id] = c), acc),
  {} as Record<CategoryId, Category>,
);

export function categoryName(id: CategoryId): string {
  return CATEGORY_MAP[id]?.name ?? 'Other';
}

/* ------------------------------------------------------------------ */
/*  Units                                                              */
/* ------------------------------------------------------------------ */

export const UNITS: { value: Unit; label: string }[] = [
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'QUINTAL', label: 'Quintal' },
  { value: 'TON', label: 'Ton' },
  { value: 'DOZEN', label: 'Dozen' },
  { value: 'BOX', label: 'Box' },
  { value: 'CRATE', label: 'Crate' },
  { value: 'PIECE', label: 'Piece' },
  { value: 'LITRE', label: 'Litre' },
];

/* ------------------------------------------------------------------ */
/*  Grades                                                             */
/* ------------------------------------------------------------------ */

export const GRADE_LABEL: Record<Grade, string> = {
  A: 'Grade A · Premium',
  B: 'Grade B · Standard',
  C: 'Grade C · Value',
};

export const GRADES: Grade[] = ['A', 'B', 'C'];

/* ------------------------------------------------------------------ */
/*  Order status                                                       */
/* ------------------------------------------------------------------ */

/** Canonical happy-path lifecycle (used by the tracking timeline). */
export const ORDER_FLOW: OrderStatus[] = [
  'REQUEST_SENT',
  'ACCEPTED',
  'PAYMENT_PENDING',
  'PAID',
  'PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  REQUEST_SENT: 'Request sent',
  ACCEPTED: 'Accepted',
  PAYMENT_PENDING: 'Payment pending',
  PAID: 'Paid',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for pickup',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  REQUEST_SENT: 'amber',
  ACCEPTED: 'blue',
  PAYMENT_PENDING: 'amber',
  PAID: 'blue',
  PREPARING: 'blue',
  READY_FOR_PICKUP: 'blue',
  OUT_FOR_DELIVERY: 'blue',
  DELIVERED: 'green',
  COMPLETED: 'green',
  CANCELLED: 'red',
  REJECTED: 'red',
};

/* ------------------------------------------------------------------ */
/*  Product status                                                     */
/* ------------------------------------------------------------------ */

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  PENDING_APPROVAL: 'Pending approval',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  SOLD_OUT: 'Sold out',
  REJECTED: 'Rejected',
};

export const PRODUCT_STATUS_TONE: Record<ProductStatus, Tone> = {
  PENDING_APPROVAL: 'amber',
  ACTIVE: 'green',
  PAUSED: 'neutral',
  SOLD_OUT: 'soil',
  REJECTED: 'red',
};

/* ------------------------------------------------------------------ */
/*  Verification                                                       */
/* ------------------------------------------------------------------ */

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  PENDING: 'Verification pending',
  VERIFIED: 'Verified',
  REJECTED: 'Not verified',
};

export const VERIFICATION_TONE: Record<VerificationStatus, Tone> = {
  PENDING: 'amber',
  VERIFIED: 'green',
  REJECTED: 'red',
};

/* ------------------------------------------------------------------ */
/*  Business types                                                     */
/* ------------------------------------------------------------------ */

export const BUSINESS_TYPE_LABEL: Record<BusinessType, string> = {
  RESTAURANT: 'Restaurant',
  HOTEL: 'Hotel',
  MESS: 'Mess',
  CANTEEN: 'Canteen',
  CATERER: 'Caterer',
  FOOD_PROCESSOR: 'Food processor',
  OTHER: 'Other business',
};

export const BUSINESS_TYPES: { value: BusinessType; label: string }[] = (
  Object.keys(BUSINESS_TYPE_LABEL) as BusinessType[]
).map((value) => ({ value, label: BUSINESS_TYPE_LABEL[value] }));

/* ------------------------------------------------------------------ */
/*  Payments                                                           */
/* ------------------------------------------------------------------ */

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  UPI: 'UPI',
  CARD: 'Credit / Debit card',
  NET_BANKING: 'Net banking',
  COD: 'Cash on delivery',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  PENDING: 'amber',
  PAID: 'green',
  FAILED: 'red',
  REFUNDED: 'neutral',
};
