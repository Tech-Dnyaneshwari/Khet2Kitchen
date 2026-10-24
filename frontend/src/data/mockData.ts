import type {
  Farmer,
  FarmerSummary,
  Notification,
  Order,
  Product,
  Requirement,
  Restaurant,
  Review,
} from '@/types';
import { daysFromNow } from '@/utils/format';

/**
 * DEMO DATA — realistic Maharashtra farmers, businesses & produce.
 * Clearly mock: used by the service layer until the REST API is connected.
 */

/* ------------------------------------------------------------------ */
/*  Farmers                                                            */
/* ------------------------------------------------------------------ */

export const farmers: Farmer[] = [
  {
    id: 'f1', userId: 'u_f1', farmName: 'Ramesh Farm', ownerName: 'Ramesh Pawar',
    description: 'Family-run farm near Pune growing everyday vegetables — tomato, onion, potato and leafy greens. We harvest at dawn and dispatch the same morning.',
    location: 'Khed', district: 'Pune', state: 'Maharashtra', pincode: '411501',
    verificationStatus: 'VERIFIED', rating: 4.8, totalOrders: 342, yearsSupplying: 12,
    distanceKm: 22, avatarKeyword: 'indian,farmer,portrait', coverKeyword: 'vegetable,farm,field', accent: '#2F7A34',
    createdAt: daysFromNow(-1200), updatedAt: daysFromNow(-2),
  },
  {
    id: 'f2', userId: 'u_f2', farmName: 'Green Valley Farm', ownerName: 'Suresh Jadhav',
    description: 'Nashik-belt growers of grapes, onion and pomegranate. Bulk supply for hotels and caterers is our speciality.',
    location: 'Niphad', district: 'Nashik', state: 'Maharashtra', pincode: '422303',
    verificationStatus: 'VERIFIED', rating: 4.7, totalOrders: 512, yearsSupplying: 15,
    distanceKm: 168, avatarKeyword: 'farmer,man,india', coverKeyword: 'grape,vineyard,farm', accent: '#C1651B',
    createdAt: daysFromNow(-1600), updatedAt: daysFromNow(-1),
  },
  {
    id: 'f3', userId: 'u_f3', farmName: 'Fresh Harvest Farm', ownerName: 'Anita Deshmukh',
    description: 'Certified organic hill-grown vegetables and strawberries from the Sahyadri slopes. Cool climate, crisp produce.',
    location: 'Wai', district: 'Satara', state: 'Maharashtra', pincode: '412803',
    verificationStatus: 'VERIFIED', rating: 4.9, totalOrders: 268, yearsSupplying: 9,
    distanceKm: 95, avatarKeyword: 'woman,farmer,india', coverKeyword: 'organic,vegetable,farm', accent: '#1E8A6B',
    createdAt: daysFromNow(-980), updatedAt: daysFromNow(-3),
  },
  {
    id: 'f4', userId: 'u_f4', farmName: 'Sahyadri Organics', ownerName: 'Vikram Patil',
    description: 'Rice, jowar and pulses at wholesale volumes. Cleaned, graded and sacked for restaurant pantries.',
    location: 'Panhala', district: 'Kolhapur', state: 'Maharashtra', pincode: '416201',
    verificationStatus: 'VERIFIED', rating: 4.6, totalOrders: 421, yearsSupplying: 11,
    distanceKm: 228, avatarKeyword: 'indian,farmer,field', coverKeyword: 'rice,grain,harvest', accent: '#A67C12',
    createdAt: daysFromNow(-1350), updatedAt: daysFromNow(-4),
  },
  {
    id: 'f5', userId: 'u_f5', farmName: 'Konkan Green Farm', ownerName: 'Lata More',
    description: 'The real Devgad Alphonso, GI-tagged and naturally ripened. Seasonal mango, kokum and coconut from the Konkan coast.',
    location: 'Devgad', district: 'Sindhudurg', state: 'Maharashtra', pincode: '416613',
    verificationStatus: 'VERIFIED', rating: 4.8, totalOrders: 190, yearsSupplying: 7,
    distanceKm: 320, avatarKeyword: 'woman,farmer,portrait', coverKeyword: 'mango,orchard,tree', accent: '#C1651B',
    createdAt: daysFromNow(-820), updatedAt: daysFromNow(-6),
  },
  {
    id: 'f6', userId: 'u_f6', farmName: 'Krishna Valley Farm', ownerName: 'Ganesh Shinde',
    description: 'Mixed vegetable and herb farm near Baramati moving to full organic. Great value for canteens and messes.',
    location: 'Baramati', district: 'Pune', state: 'Maharashtra', pincode: '413102',
    verificationStatus: 'PENDING', rating: 4.5, totalOrders: 156, yearsSupplying: 6,
    distanceKm: 78, avatarKeyword: 'farmer,portrait,rural', coverKeyword: 'herbs,vegetable,farm', accent: '#8A6D3B',
    createdAt: daysFromNow(-540), updatedAt: daysFromNow(-1),
  },
];

const farmerMap = new Map(farmers.map((f) => [f.id, f]));

export function farmerSummary(id: string): FarmerSummary | undefined {
  const f = farmerMap.get(id);
  if (!f) return undefined;
  return {
    id: f.id, farmName: f.farmName, ownerName: f.ownerName,
    location: f.location, district: f.district, rating: f.rating,
    verificationStatus: f.verificationStatus, distanceKm: f.distanceKm, accent: f.accent,
  };
}

/* ------------------------------------------------------------------ */
/*  Restaurants / business buyers                                      */
/* ------------------------------------------------------------------ */

export const restaurants: Restaurant[] = [
  {
    id: 'r1', userId: 'u_r1', restaurantName: 'Shree Ganesh Restaurant', ownerName: 'Mahesh Kulkarni',
    businessType: 'RESTAURANT', description: 'Popular veg-thali restaurant on FC Road serving 600+ plates a day.',
    location: 'FC Road', district: 'Pune', state: 'Maharashtra', pincode: '411004',
    verificationStatus: 'VERIFIED', rating: 4.6, totalOrders: 88, gstin: '27ABCDE1234F1Z5',
    logoKeyword: 'restaurant,indian,interior', createdAt: daysFromNow(-400), updatedAt: daysFromNow(-1),
  },
  {
    id: 'r2', userId: 'u_r2', restaurantName: 'ABC Family Restaurant', ownerName: 'Farhan Shaikh',
    businessType: 'RESTAURANT', description: 'Multi-cuisine family restaurant in Kothrud.',
    location: 'Kothrud', district: 'Pune', state: 'Maharashtra', pincode: '411038',
    verificationStatus: 'VERIFIED', rating: 4.4, totalOrders: 61, gstin: '27FGHIJ5678K2Z9',
    logoKeyword: 'restaurant,dining,table', createdAt: daysFromNow(-360), updatedAt: daysFromNow(-2),
  },
  {
    id: 'r3', userId: 'u_r3', restaurantName: 'Hotel Sahyadri', ownerName: 'Priya Nair',
    businessType: 'HOTEL', description: '3-star hotel with banquet catering in Shivajinagar.',
    location: 'Shivajinagar', district: 'Pune', state: 'Maharashtra', pincode: '411005',
    verificationStatus: 'VERIFIED', rating: 4.7, totalOrders: 124, gstin: '27KLMNO9012P3Z1',
    logoKeyword: 'hotel,kitchen,chef', createdAt: daysFromNow(-500), updatedAt: daysFromNow(-1),
  },
  {
    id: 'r4', userId: 'u_r4', restaurantName: 'Annapurna Mess', ownerName: 'Sunil Gaikwad',
    businessType: 'MESS', description: 'Student mess near Deccan serving daily unlimited meals.',
    location: 'Deccan', district: 'Pune', state: 'Maharashtra', pincode: '411004',
    verificationStatus: 'PENDING', rating: 4.3, totalOrders: 34,
    logoKeyword: 'canteen,meal,thali', createdAt: daysFromNow(-120), updatedAt: daysFromNow(-1),
  },
  {
    id: 'r5', userId: 'u_r5', restaurantName: 'Spice Route Caterers', ownerName: 'Reena Joshi',
    businessType: 'CATERER', description: 'Event & wedding caterers handling 500–2000 guest orders.',
    location: 'Baner', district: 'Pune', state: 'Maharashtra', pincode: '411045',
    verificationStatus: 'VERIFIED', rating: 4.8, totalOrders: 97, gstin: '27QRSTU3456V7Z2',
    logoKeyword: 'catering,buffet,food', createdAt: daysFromNow(-450), updatedAt: daysFromNow(-3),
  },
];

const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));

/* ------------------------------------------------------------------ */
/*  Products                                                           */
/* ------------------------------------------------------------------ */

let pidCounter = 0;
type PInput = Partial<Product> &
  Pick<Product, 'farmerId' | 'categoryId' | 'name' | 'variety' | 'price' | 'unit' | 'quantity' | 'grade' | 'emoji' | 'imageKeyword'>;

function P(input: PInput): Product {
  pidCounter += 1;
  const f = farmerMap.get(input.farmerId);
  return {
    id: `p${pidCounter}`,
    farmer: farmerSummary(input.farmerId),
    description:
      input.description ??
      `Fresh ${input.variety} ${input.name.toLowerCase()} from ${f?.farmName ?? 'the farm'}, ${f?.district ?? ''}. Grade ${input.grade}, sorted and ready for bulk kitchen use.`,
    harvestDate: input.harvestDate ?? daysFromNow(-1),
    availableFrom: input.availableFrom ?? daysFromNow(0),
    availableUntil: input.availableUntil,
    location: input.location ?? f?.location ?? 'Pune',
    district: input.district ?? f?.district ?? 'Pune',
    isAvailable: input.isAvailable ?? true,
    status: input.status ?? 'ACTIVE',
    rating: input.rating ?? 4.6,
    reviewsCount: input.reviewsCount ?? 40,
    minOrderQty: input.minOrderQty ?? (input.unit === 'KG' ? 25 : 5),
    isOrganic: input.isOrganic ?? false,
    createdAt: input.createdAt ?? daysFromNow(-30),
    updatedAt: input.updatedAt ?? daysFromNow(-1),
    ...input,
  } as Product;
}

export const products: Product[] = [
  // --- Ramesh Farm (Pune) — vegetables
  P({ farmerId: 'f1', categoryId: 'VEGETABLES', name: 'Tomato', variety: 'Hybrid Nati', price: 25, unit: 'KG', quantity: 500, grade: 'A', emoji: '🍅', imageKeyword: 'tomato,fresh', rating: 4.8, reviewsCount: 210, minOrderQty: 50 }),
  P({ farmerId: 'f1', categoryId: 'VEGETABLES', name: 'Onion', variety: 'Nashik Red', price: 22, unit: 'KG', quantity: 1200, grade: 'A', emoji: '🧅', imageKeyword: 'onion,red', rating: 4.7, reviewsCount: 160, minOrderQty: 100 }),
  P({ farmerId: 'f1', categoryId: 'VEGETABLES', name: 'Potato', variety: 'Jyoti', price: 20, unit: 'KG', quantity: 900, grade: 'B', emoji: '🥔', imageKeyword: 'potato,pile', rating: 4.5, reviewsCount: 132, minOrderQty: 100 }),
  P({ farmerId: 'f1', categoryId: 'VEGETABLES', name: 'Spinach', variety: 'Palak', price: 30, unit: 'KG', quantity: 120, grade: 'A', emoji: '🥬', imageKeyword: 'spinach,leaf', isOrganic: true, rating: 4.9, reviewsCount: 74, minOrderQty: 10 }),
  P({ farmerId: 'f1', categoryId: 'VEGETABLES', name: 'Cauliflower', variety: 'Snowball', price: 28, unit: 'KG', quantity: 260, grade: 'A', emoji: '🥦', imageKeyword: 'cauliflower,fresh', rating: 4.6, reviewsCount: 58 }),

  // --- Green Valley (Nashik) — fruits + onion
  P({ farmerId: 'f2', categoryId: 'FRUITS', name: 'Grapes', variety: 'Thompson Seedless', price: 85, unit: 'KG', quantity: 400, grade: 'A', emoji: '🍇', imageKeyword: 'grapes,green', rating: 4.8, reviewsCount: 190, minOrderQty: 20 }),
  P({ farmerId: 'f2', categoryId: 'FRUITS', name: 'Pomegranate', variety: 'Bhagwa', price: 110, unit: 'KG', quantity: 300, grade: 'A', emoji: '🍎', imageKeyword: 'pomegranate,red', rating: 4.7, reviewsCount: 96, minOrderQty: 20 }),
  P({ farmerId: 'f2', categoryId: 'VEGETABLES', name: 'Onion', variety: 'Lasalgaon', price: 24, unit: 'QUINTAL', quantity: 80, grade: 'A', emoji: '🧅', imageKeyword: 'onion,sack', rating: 4.6, reviewsCount: 120, minOrderQty: 5, description: 'Bulk Lasalgaon onion by the quintal — ideal for hotels & caterers.' }),
  P({ farmerId: 'f2', categoryId: 'FRUITS', name: 'Banana', variety: 'Grand Naine', price: 42, unit: 'DOZEN', quantity: 500, grade: 'A', emoji: '🍌', imageKeyword: 'banana,bunch', rating: 4.5, reviewsCount: 80, minOrderQty: 10 }),

  // --- Fresh Harvest (Satara) — organic veg + berries
  P({ farmerId: 'f3', categoryId: 'VEGETABLES', name: 'Carrot', variety: 'Ooty', price: 36, unit: 'KG', quantity: 220, grade: 'A', emoji: '🥕', imageKeyword: 'carrot,fresh', isOrganic: true, rating: 4.8, reviewsCount: 88 }),
  P({ farmerId: 'f3', categoryId: 'VEGETABLES', name: 'Green Peas', variety: 'Matar', price: 62, unit: 'KG', quantity: 140, grade: 'A', emoji: '🫛', imageKeyword: 'green,peas', isOrganic: true, rating: 4.7, reviewsCount: 66 }),
  P({ farmerId: 'f3', categoryId: 'FRUITS', name: 'Strawberry', variety: 'Mahabaleshwar', price: 190, unit: 'KG', quantity: 60, grade: 'A', emoji: '🍓', imageKeyword: 'strawberry,fresh', isOrganic: true, rating: 4.9, reviewsCount: 102, minOrderQty: 10, availableUntil: daysFromNow(20) }),
  P({ farmerId: 'f3', categoryId: 'VEGETABLES', name: 'Capsicum', variety: 'Green Bell', price: 55, unit: 'KG', quantity: 130, grade: 'A', emoji: '🫑', imageKeyword: 'capsicum,pepper', isOrganic: true, rating: 4.6, reviewsCount: 44 }),

  // --- Sahyadri Organics (Kolhapur) — grains & pulses
  P({ farmerId: 'f4', categoryId: 'GRAINS', name: 'Basmati Rice', variety: 'Kolam', price: 78, unit: 'KG', quantity: 800, grade: 'A', emoji: '🍚', imageKeyword: 'rice,basmati,grain', rating: 4.7, reviewsCount: 140, minOrderQty: 50 }),
  P({ farmerId: 'f4', categoryId: 'GRAINS', name: 'Wheat', variety: 'Lokwan', price: 34, unit: 'QUINTAL', quantity: 120, grade: 'A', emoji: '🌾', imageKeyword: 'wheat,grain,field', rating: 4.6, reviewsCount: 90, minOrderQty: 2 }),
  P({ farmerId: 'f4', categoryId: 'GRAINS', name: 'Jowar', variety: 'Maldandi', price: 46, unit: 'KG', quantity: 350, grade: 'A', emoji: '🌾', imageKeyword: 'sorghum,jowar,millet', rating: 4.7, reviewsCount: 60, minOrderQty: 25 }),
  P({ farmerId: 'f4', categoryId: 'PULSES', name: 'Tur Dal', variety: 'Split Pigeon Pea', price: 132, unit: 'KG', quantity: 240, grade: 'A', emoji: '🫘', imageKeyword: 'lentils,toor,dal', rating: 4.6, reviewsCount: 96, minOrderQty: 25 }),
  P({ farmerId: 'f4', categoryId: 'PULSES', name: 'Chana', variety: 'Kabuli', price: 95, unit: 'KG', quantity: 180, grade: 'B', emoji: '🫘', imageKeyword: 'chickpea,chana', rating: 4.5, reviewsCount: 52, minOrderQty: 25 }),

  // --- Konkan Green (Sindhudurg) — mango & coconut
  P({ farmerId: 'f5', categoryId: 'FRUITS', name: 'Alphonso Mango', variety: 'Devgad Hapus', price: 650, unit: 'DOZEN', quantity: 200, grade: 'A', emoji: '🥭', imageKeyword: 'mango,alphonso', rating: 4.9, reviewsCount: 320, minOrderQty: 5, availableUntil: daysFromNow(35) }),
  P({ farmerId: 'f5', categoryId: 'OTHER', name: 'Coconut', variety: 'Tender', price: 32, unit: 'PIECE', quantity: 600, grade: 'A', emoji: '🥥', imageKeyword: 'coconut,tender', rating: 4.7, reviewsCount: 48, minOrderQty: 50 }),

  // --- Krishna Valley (Baramati) — herbs & spices, value veg
  P({ farmerId: 'f6', categoryId: 'HERBS', name: 'Coriander', variety: 'Kothimbir', price: 14, unit: 'KG', quantity: 90, grade: 'A', emoji: '🌿', imageKeyword: 'coriander,cilantro,herb', rating: 4.6, reviewsCount: 40, minOrderQty: 5 }),
  P({ farmerId: 'f6', categoryId: 'HERBS', name: 'Mint', variety: 'Pudina', price: 16, unit: 'KG', quantity: 70, grade: 'A', emoji: '🌿', imageKeyword: 'mint,pudina,herb', rating: 4.5, reviewsCount: 30, minOrderQty: 5 }),
  P({ farmerId: 'f6', categoryId: 'SPICES', name: 'Green Chilli', variety: 'Jwala', price: 48, unit: 'KG', quantity: 150, grade: 'A', emoji: '🌶️', imageKeyword: 'green,chilli,pepper', rating: 4.6, reviewsCount: 58 }),
  P({ farmerId: 'f6', categoryId: 'SPICES', name: 'Ginger', variety: 'Mahim', price: 80, unit: 'KG', quantity: 110, grade: 'A', emoji: '🫚', imageKeyword: 'ginger,root', rating: 4.6, reviewsCount: 46 }),
  P({ farmerId: 'f6', categoryId: 'SPICES', name: 'Garlic', variety: 'Desi', price: 120, unit: 'KG', quantity: 95, grade: 'A', emoji: '🧄', imageKeyword: 'garlic,cloves', rating: 4.5, reviewsCount: 38 }),
  P({ farmerId: 'f6', categoryId: 'VEGETABLES', name: 'Brinjal', variety: 'Bharli Vangi', price: 30, unit: 'KG', quantity: 160, grade: 'B', emoji: '🍆', imageKeyword: 'eggplant,brinjal', rating: 4.4, reviewsCount: 34 }),
  // A couple of non-active examples for the farmer/admin views
  P({ farmerId: 'f6', categoryId: 'VEGETABLES', name: 'Cucumber', variety: 'Green', price: 26, unit: 'KG', quantity: 0, grade: 'B', emoji: '🥒', imageKeyword: 'cucumber,fresh', status: 'SOLD_OUT', isAvailable: false, rating: 4.3, reviewsCount: 22 }),
  P({ farmerId: 'f3', categoryId: 'VEGETABLES', name: 'Broccoli', variety: 'Green Magic', price: 92, unit: 'KG', quantity: 40, grade: 'A', emoji: '🥦', imageKeyword: 'broccoli,fresh', status: 'PENDING_APPROVAL', isOrganic: true, rating: 4.7, reviewsCount: 12 }),
];

export const productMap = new Map(products.map((p) => [p.id, p]));

/* ------------------------------------------------------------------ */
/*  Orders                                                             */
/* ------------------------------------------------------------------ */

function money(items: Order['items']) {
  const productTotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const deliveryFee = productTotal >= 5000 ? 0 : 300;
  const platformFee = Math.round(productTotal * 0.02);
  return { productTotal, deliveryFee, platformFee, total: productTotal + deliveryFee + platformFee };
}

function orderItem(productId: string, quantity: number): Order['items'][number] {
  const p = productMap.get(productId)!;
  return {
    id: `oi_${productId}_${quantity}`,
    productId: p.id, productName: p.name, categoryId: p.categoryId,
    farmerId: p.farmerId, farmerName: p.farmer?.farmName ?? '', unit: p.unit,
    unitPrice: p.price, quantity, lineTotal: p.price * quantity,
    imageKeyword: p.imageKeyword, emoji: p.emoji,
  };
}

function buildOrder(o: {
  id: string; orderNo: string; restaurantId: string; farmerId: string;
  items: [string, number][]; status: Order['status']; fulfilment: Order['fulfilment'];
  deliveryInDays: number; placedDaysAgo: number; timeline: Order['timeline'];
  payment?: Order['payment'];
}): Order {
  const r = restaurantMap.get(o.restaurantId)!;
  const f = farmerMap.get(o.farmerId)!;
  const items = o.items.map(([pid, qty]) => orderItem(pid, qty));
  const m = money(items);
  return {
    id: o.id, orderNo: o.orderNo,
    restaurantId: r.id, restaurantName: r.restaurantName, businessType: r.businessType,
    farmerId: f.id, farmerName: f.farmName, farmLocation: `${f.location}, ${f.district}`,
    items, ...m, fulfilment: o.fulfilment,
    deliveryDate: daysFromNow(o.deliveryInDays),
    address: o.fulfilment === 'DELIVERY' ? `${r.location}, ${r.district} ${r.pincode}` : undefined,
    status: o.status, payment: o.payment, timeline: o.timeline,
    createdAt: daysFromNow(-o.placedDaysAgo), updatedAt: daysFromNow(0),
  };
}

export const orders: Order[] = [
  buildOrder({
    id: 'o1', orderNo: 'KK1025', restaurantId: 'r1', farmerId: 'f1',
    items: [['p1', 200]], status: 'ACCEPTED', fulfilment: 'DELIVERY', deliveryInDays: 1, placedDaysAgo: 1,
    timeline: [
      { status: 'REQUEST_SENT', at: daysFromNow(-1), note: 'Requirement sent to Ramesh Farm' },
      { status: 'ACCEPTED', at: daysFromNow(0), note: 'Farmer accepted at ₹25/kg' },
    ],
    payment: { id: 'pay_o1', orderId: 'o1', method: 'UPI', status: 'PENDING', amount: 5400, createdAt: daysFromNow(0) },
  }),
  buildOrder({
    id: 'o2', orderNo: 'KK1024', restaurantId: 'r3', farmerId: 'f2',
    items: [['p6', 40], ['p7', 20]], status: 'OUT_FOR_DELIVERY', fulfilment: 'DELIVERY', deliveryInDays: 0, placedDaysAgo: 2,
    timeline: [
      { status: 'REQUEST_SENT', at: daysFromNow(-2) },
      { status: 'ACCEPTED', at: daysFromNow(-2) },
      { status: 'PAID', at: daysFromNow(-1), note: 'Paid via UPI' },
      { status: 'PREPARING', at: daysFromNow(-1) },
      { status: 'OUT_FOR_DELIVERY', at: daysFromNow(0), note: 'Dispatched from Nashik' },
    ],
    payment: { id: 'pay_o2', orderId: 'o2', method: 'UPI', status: 'PAID', amount: 5800, txnRef: 'UPI-4821DEMO', createdAt: daysFromNow(-1) },
  }),
  buildOrder({
    id: 'o3', orderNo: 'KK1019', restaurantId: 'r5', farmerId: 'f4',
    items: [['p14', 200], ['p17', 50]], status: 'COMPLETED', fulfilment: 'DELIVERY', deliveryInDays: -3, placedDaysAgo: 8,
    timeline: [
      { status: 'REQUEST_SENT', at: daysFromNow(-8) },
      { status: 'ACCEPTED', at: daysFromNow(-8) },
      { status: 'PAID', at: daysFromNow(-7) },
      { status: 'PREPARING', at: daysFromNow(-6) },
      { status: 'OUT_FOR_DELIVERY', at: daysFromNow(-4) },
      { status: 'DELIVERED', at: daysFromNow(-3) },
      { status: 'COMPLETED', at: daysFromNow(-3), note: 'Order completed & rated' },
    ],
    payment: { id: 'pay_o3', orderId: 'o3', method: 'NET_BANKING', status: 'PAID', amount: 22200, txnRef: 'NB-1099DEMO', createdAt: daysFromNow(-7) },
  }),
  buildOrder({
    id: 'o4', orderNo: 'KK1026', restaurantId: 'r2', farmerId: 'f1',
    items: [['p2', 150]], status: 'REQUEST_SENT', fulfilment: 'PICKUP', deliveryInDays: 2, placedDaysAgo: 0,
    timeline: [{ status: 'REQUEST_SENT', at: daysFromNow(0), note: 'Awaiting farmer response' }],
  }),
  buildOrder({
    id: 'o5', orderNo: 'KK1021', restaurantId: 'r4', farmerId: 'f6',
    items: [['p20', 10], ['p22', 15]], status: 'PREPARING', fulfilment: 'DELIVERY', deliveryInDays: 1, placedDaysAgo: 1,
    timeline: [
      { status: 'REQUEST_SENT', at: daysFromNow(-1) },
      { status: 'ACCEPTED', at: daysFromNow(-1) },
      { status: 'PAID', at: daysFromNow(0) },
      { status: 'PREPARING', at: daysFromNow(0) },
    ],
    payment: { id: 'pay_o5', orderId: 'o5', method: 'CARD', status: 'PAID', amount: 1210, txnRef: 'CARD-7742DEMO', createdAt: daysFromNow(0) },
  }),
  buildOrder({
    id: 'o6', orderNo: 'KK1010', restaurantId: 'r1', farmerId: 'f5',
    items: [['p19', 20]], status: 'CANCELLED', fulfilment: 'DELIVERY', deliveryInDays: -10, placedDaysAgo: 14,
    timeline: [
      { status: 'REQUEST_SENT', at: daysFromNow(-14) },
      { status: 'ACCEPTED', at: daysFromNow(-14) },
      { status: 'CANCELLED', at: daysFromNow(-13), note: 'Cancelled by buyer — season ended' },
    ],
  }),
];

/* ------------------------------------------------------------------ */
/*  Requirements (posted by buyers)                                    */
/* ------------------------------------------------------------------ */

export const requirements: Requirement[] = [
  {
    id: 'rq1', restaurantId: 'r1',
    restaurant: { id: 'r1', restaurantName: 'Shree Ganesh Restaurant', businessType: 'RESTAURANT', location: 'FC Road', district: 'Pune' },
    items: [{ id: 'ri1', categoryId: 'VEGETABLES', productName: 'Tomato', quantity: 200, unit: 'KG', preferredPrice: 30 }],
    requiredBy: daysFromNow(1), fulfilment: 'DELIVERY', location: 'FC Road', district: 'Pune',
    notes: 'Need firm, red tomatoes for daily curry prep.', status: 'MATCHED', matchesCount: 3, createdAt: daysFromNow(-1),
  },
  {
    id: 'rq2', restaurantId: 'r3',
    restaurant: { id: 'r3', restaurantName: 'Hotel Sahyadri', businessType: 'HOTEL', location: 'Shivajinagar', district: 'Pune' },
    items: [{ id: 'ri2', categoryId: 'FRUITS', productName: 'Alphonso Mango', quantity: 30, unit: 'DOZEN', preferredPrice: 600 }],
    requiredBy: daysFromNow(3), fulfilment: 'DELIVERY', location: 'Shivajinagar', district: 'Pune',
    notes: 'For weekend dessert buffet.', status: 'OPEN', matchesCount: 1, createdAt: daysFromNow(0),
  },
  {
    id: 'rq3', restaurantId: 'r5',
    restaurant: { id: 'r5', restaurantName: 'Spice Route Caterers', businessType: 'CATERER', location: 'Baner', district: 'Pune' },
    items: [{ id: 'ri3', categoryId: 'GRAINS', productName: 'Basmati Rice', quantity: 300, unit: 'KG', preferredPrice: 75 }],
    requiredBy: daysFromNow(4), fulfilment: 'PICKUP', location: 'Baner', district: 'Pune',
    notes: 'Wedding order for 1500 guests.', status: 'OPEN', matchesCount: 1, createdAt: daysFromNow(0),
  },
];

/* ------------------------------------------------------------------ */
/*  Notifications (per audience role)                                  */
/* ------------------------------------------------------------------ */

export const notifications: Notification[] = [
  { id: 'n1', audienceRole: 'FARMER', type: 'REQUIREMENT', title: 'New buyer requirement', body: 'Shree Ganesh Restaurant needs 200 kg Tomato by tomorrow. It matches your listing.', read: false, createdAt: daysFromNow(0) },
  { id: 'n2', audienceRole: 'FARMER', type: 'ORDER', title: 'New order request', body: 'ABC Family Restaurant requested 150 kg Onion (pickup).', read: false, createdAt: daysFromNow(0) },
  { id: 'n3', audienceRole: 'FARMER', type: 'PAYMENT', title: 'Payment received', body: '₹1,210 received for order #KK1021 from Annapurna Mess.', read: true, createdAt: daysFromNow(0) },
  { id: 'n4', audienceRole: 'FARMER', type: 'LISTING', title: 'Listing expiring soon', body: 'Your Strawberry listing expires in 3 days. Extend availability?', read: true, createdAt: daysFromNow(-1) },

  { id: 'n5', audienceRole: 'RESTAURANT', type: 'ORDER', title: 'Order accepted', body: 'Ramesh Farm accepted your order #KK1025 at ₹25/kg.', read: false, createdAt: daysFromNow(0) },
  { id: 'n6', audienceRole: 'RESTAURANT', type: 'ORDER', title: 'Out for delivery', body: 'Order #KK1024 from Green Valley Farm is out for delivery.', read: false, createdAt: daysFromNow(0) },
  { id: 'n7', audienceRole: 'RESTAURANT', type: 'REQUIREMENT', title: 'Matches found', body: '3 verified farmers match your Tomato requirement.', read: true, createdAt: daysFromNow(-1) },

  { id: 'n8', audienceRole: 'ADMIN', type: 'SYSTEM', title: 'Farmer verification pending', body: 'Krishna Valley Farm has submitted documents for verification.', read: false, createdAt: daysFromNow(0) },
  { id: 'n9', audienceRole: 'ADMIN', type: 'ORDER', title: 'GMV milestone', body: 'Platform crossed ₹42L GMV this month.', read: true, createdAt: daysFromNow(-1) },
];

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

export const reviews: Review[] = [
  { id: 'rv1', orderId: 'o3', authorName: 'Spice Route Caterers', targetType: 'FARMER', targetId: 'f4', rating: 5, comment: 'Rice quality was excellent and delivery was on time for our wedding order.', createdAt: daysFromNow(-3) },
  { id: 'rv2', authorName: 'Hotel Sahyadri', targetType: 'FARMER', targetId: 'f1', rating: 5, comment: 'Ramesh Farm tomatoes are consistently fresh. Our go-to supplier.', createdAt: daysFromNow(-6) },
  { id: 'rv3', authorName: 'ABC Family Restaurant', targetType: 'PRODUCT', targetId: 'p1', rating: 4, comment: 'Good grade, firm tomatoes. Packaging could be better.', createdAt: daysFromNow(-9) },
  { id: 'rv4', authorName: 'Shree Ganesh Restaurant', targetType: 'PRODUCT', targetId: 'p19', rating: 5, comment: 'Authentic Devgad Alphonso — customers loved the dessert.', createdAt: daysFromNow(-12) },
];
