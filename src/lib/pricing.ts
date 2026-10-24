import prisma from './prisma';

export interface PricingBreakdown {
  subtotal: number;
  deliveryFee: number;
  platformCommission: number;
  taxAmount: number;
  totalAmount: number;
  commissionRatePercent: number;
  totalWeightKg: number;
  estimatedSavings?: {
    referenceCost: number;
    k2kCost: number;
    difference: number;
    isSavings: boolean;
    percentageDiff: number;
  };
}

export async function getPlatformSettings() {
  try {
    const settings = await prisma.platformSettings.findMany();
    const map: Record<string, number> = {};
    for (const s of settings) {
      map[s.key] = parseFloat(s.value);
    }
    return {
      commissionRatePercent: map['commission_rate_percent'] ?? 3.0,
      logisticsBaseFee: map['logistics_base_fee'] ?? 250.0,
      logisticsPerKmFee: map['logistics_per_km_fee'] ?? 12.0,
      defaultBuyerSubscriptionPrice: map['default_buyer_subscription_price'] ?? 499.0,
    };
  } catch (error) {
    return {
      commissionRatePercent: 3.0,
      logisticsBaseFee: 250.0,
      logisticsPerKmFee: 12.0,
      defaultBuyerSubscriptionPrice: 499.0,
    };
  }
}

export async function calculateOrderPricing(params: {
  items: Array<{ produceId: string; quantityKg: number; unitPrice: number }>;
  fulfillmentType: 'FARM_GATE_PICKUP' | 'KHET2KITCHEN_DELIVERY';
  distanceKm?: number;
  referencePricePerKg?: number;
}): Promise<PricingBreakdown> {
  const settings = await getPlatformSettings();

  // 1. Calculate Produce Subtotal
  let subtotal = 0;
  let totalWeightKg = 0;

  for (const item of params.items) {
    const qty = Math.max(0, item.quantityKg);
    const itemSubtotal = qty * item.unitPrice;
    subtotal += itemSubtotal;
    totalWeightKg += qty;
  }

  subtotal = Math.round(subtotal * 100) / 100;

  // 2. Calculate Delivery Fee
  let deliveryFee = 0;
  if (params.fulfillmentType === 'KHET2KITCHEN_DELIVERY') {
    const distance = Math.max(0, params.distanceKm ?? 25);
    // Base fee covers first 10 km, additional km charged at perKm rate
    const extraKm = Math.max(0, distance - 10);
    deliveryFee = settings.logisticsBaseFee + extraKm * settings.logisticsPerKmFee;
  }
  deliveryFee = Math.round(deliveryFee * 100) / 100;

  // 3. Calculate Platform Commission (Configurable, default 3% on subtotal)
  const platformCommission = Math.round(((subtotal * settings.commissionRatePercent) / 100) * 100) / 100;

  // 4. Taxes (Indian GST rules for agricultural raw produce is 0% exempt)
  const taxAmount = 0.0;

  // 5. Total Payable
  const totalAmount = Math.round((subtotal + deliveryFee + platformCommission + taxAmount) * 100) / 100;

  // 6. Savings Calculation
  let estimatedSavings: PricingBreakdown['estimatedSavings'] | undefined;
  if (params.referencePricePerKg && params.referencePricePerKg > 0 && totalWeightKg > 0) {
    const referenceCost = Math.round(params.referencePricePerKg * totalWeightKg * 100) / 100;
    const difference = Math.round((referenceCost - totalAmount) * 100) / 100;
    const isSavings = difference >= 0;
    const percentageDiff = referenceCost > 0 ? Math.round((Math.abs(difference) / referenceCost) * 100) : 0;

    estimatedSavings = {
      referenceCost,
      k2kCost: totalAmount,
      difference: Math.abs(difference),
      isSavings,
      percentageDiff,
    };
  }

  return {
    subtotal,
    deliveryFee,
    platformCommission,
    taxAmount,
    totalAmount,
    commissionRatePercent: settings.commissionRatePercent,
    totalWeightKg,
    estimatedSavings,
  };
}

export function calculateProcurementSavings(params: {
  k2kUnitWholesalePrice: number;
  referenceMandiRetailPrice: number;
  quantityKg: number;
}) {
  const referencePurchaseCost = params.quantityKg * params.referenceMandiRetailPrice;
  const k2kOrderCost = params.quantityKg * params.k2kUnitWholesalePrice;
  const difference = referencePurchaseCost - k2kOrderCost;
  const isSavings = difference >= 0;
  const percentage = referencePurchaseCost > 0 ? Math.round((Math.abs(difference) / referencePurchaseCost) * 100) : 0;
  return {
    referencePurchaseCost,
    k2kOrderCost,
    difference,
    isSavings,
    percentage,
  };
}
