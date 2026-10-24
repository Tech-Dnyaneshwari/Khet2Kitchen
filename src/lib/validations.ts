import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['FARMER', 'BUYER', 'TRANSPORT_PARTNER']),

  // Farmer specific fields
  farmName: z.string().optional(),
  village: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  primaryCrops: z.string().optional(),

  // Buyer specific fields
  businessName: z.string().optional(),
  businessType: z.enum(['RESTAURANT', 'HOTEL', 'MESS', 'HOSTEL', 'CANTEEN', 'CATERER', 'OTHER']).optional(),
  city: z.string().optional(),
  gstin: z.string().optional(),

  // Transport partner specific fields
  vehicleType: z.enum(['MINI_TRUCK', 'TEMPO', 'PICKUP_VAN', 'AUTO_LOADER', 'OTHER']).optional(),
  vehicleNumber: z.string().optional(),
  maxPayloadKg: z.coerce.number().positive().optional(),
  drivingLicenseNo: z.string().optional(),
});

export const produceListingSchema = z.object({
  name: z.string().min(2, 'Produce name is required'),
  categoryId: z.string().min(1, 'Category must be selected'),
  description: z.string().min(5, 'Provide a helpful description of produce'),
  qualityGrade: z.enum(['GRADE_A', 'GRADE_B', 'PREMIUM', 'ORGANIC']),
  unit: z.string().default('kg'),
  pricePerUnit: z.coerce.number().positive('Price must be greater than zero'),
  availableStockKg: z.coerce.number().nonnegative('Stock cannot be negative'),
  minOrderQuantityKg: z.coerce.number().positive('Minimum order quantity must be greater than zero'),
  harvestDate: z.string().min(2, 'Harvest date or freshness note is required'),
  availabilityDate: z.string().min(2, 'Availability schedule is required'),
  imageUrl: z.string().url('Please provide a valid image URL').optional().or(z.literal('')),
  isFeatured: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  fulfillmentType: z.enum(['FARM_GATE_PICKUP', 'KHET2KITCHEN_DELIVERY']),
  deliveryAddress: z.string().min(5, 'Delivery address is required for K2K delivery').optional(),
  preferredDeliveryDate: z.string().min(1, 'Please specify your preferred delivery timing'),
  preferredTimeSlot: z.string().min(1, 'Please select a delivery time slot'),
  farmerNotes: z.string().optional(),
  paymentMethod: z.enum(['MOCK_UPI', 'MOCK_NET_BANKING', 'RAZORPAY', 'CASH_ON_DELIVERY', 'INSTITUTIONAL_CREDIT_NET30']).default('MOCK_UPI'),
  referencePurchasePricePerKg: z.coerce.number().optional(), // For buyer reference savings calculation
});

export const orderStatusUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    'PENDING_FARMER_CONFIRMATION',
    'ACCEPTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
    'REJECTED',
  ]),
  reason: z.string().optional(),
});

export const deliveryStatusUpdateSchema = z.object({
  deliveryId: z.string().uuid(),
  status: z.enum(['REQUESTED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED']),
  proofNotes: z.string().optional(),
  proofUrl: z.string().optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  category: z.enum(['ORDER_ISSUE', 'QUALITY_DISPUTE', 'PAYMENT', 'TRANSPORT', 'ACCOUNT']),
  message: z.string().min(10, 'Please describe your request or issue with details'),
});

export const adminSettingsSchema = z.object({
  commission_rate_percent: z.coerce.number().min(0).max(25),
  logistics_base_fee: z.coerce.number().min(0),
  logistics_per_km_fee: z.coerce.number().min(0),
  default_buyer_subscription_price: z.coerce.number().min(0),
});
