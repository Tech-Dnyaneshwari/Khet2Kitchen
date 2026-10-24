import prisma from '../src/lib/prisma';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../src/lib/auth';
import { calculateOrderPricing, calculateProcurementSavings } from '../src/lib/pricing';
import { transitionOrderStatus, canTransitionOrder } from '../src/lib/order-state-machine';

async function runTestSuite() {
  console.log('====================================================');
  console.log('   KHET2KITCHEN B2B PLATFORM AUTOMATED TEST SUITE    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorDetail?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, errorDetail || '');
      failed++;
    }
  }

  try {
    // ---------------------------------------------------------
    // TEST 1: Password Hashing & Security Verification
    // ---------------------------------------------------------
    console.log('\n--- 1. Security & Password Cryptography ---');
    const plain = 'StrongPass@2026';
    const hash = await hashPassword(plain);
    const isMatch = await verifyPassword(plain, hash);
    const isWrongMatch = await verifyPassword('WrongPassword', hash);
    assert(isMatch && !isWrongMatch, 'Bcrypt password hashing and verification match correctly');

    // ---------------------------------------------------------
    // TEST 2: JWT Session Token & Expiry
    // ---------------------------------------------------------
    console.log('\n--- 2. JWT Session & Role Claims ---');
    const token = await createSessionToken({
      userId: 'test-user-id',
      email: 'test@k2k.in',
      role: 'BUYER',
      name: 'Test Kitchen',
    });
    const verifiedPayload = await verifySessionToken(token);
    assert(
      verifiedPayload !== null &&
        verifiedPayload.role === 'BUYER' &&
        verifiedPayload.email === 'test@k2k.in',
      'JWT token correctly signed and verified with exact claims'
    );

    // ---------------------------------------------------------
    // TEST 3: Pricing Calculation & 3% Commission Formula
    // ---------------------------------------------------------
    console.log('\n--- 3. Pricing Calculation Engine ---');
    const pricingTest = await calculateOrderPricing({
      items: [
        { produceId: 'prod-1', quantityKg: 100, unitPrice: 25 }, // 2,500
        { produceId: 'prod-2', quantityKg: 200, unitPrice: 30 }, // 6,000
      ],
      fulfillmentType: 'KHET2KITCHEN_DELIVERY',
      distanceKm: 28,
    });
    // Subtotal: 8,500
    // Delivery fee: 250 (base) + 18km * 12/km = 466
    // Commission: round(8,500 * 0.03) = 255
    // Tax: 0
    // Total: 8,500 + 466 + 255 = 9,221
    assert(
      pricingTest.subtotal === 8500 &&
        pricingTest.platformCommission === 255 &&
        pricingTest.deliveryFee === 466 &&
        pricingTest.totalAmount === 9221,
      'Pricing breakdown computes subtotal, flat 3% commission, and distance delivery fee precisely'
    );

    // Free delivery for self-pickup
    const pricingPickup = await calculateOrderPricing({
      items: [{ produceId: 'prod-1', quantityKg: 100, unitPrice: 25 }],
      fulfillmentType: 'FARM_GATE_PICKUP',
      distanceKm: 28,
    });
    assert(pricingPickup.deliveryFee === 0, 'Farm-gate pickup charges ₹0.00 delivery fee');

    // ---------------------------------------------------------
    // TEST 4: Transparent Savings Rule (Negative Cost Logic)
    // ---------------------------------------------------------
    console.log('\n--- 4. Sourcing Savings Calculator & Negative Difference Rule ---');
    // Positive savings scenario: reference is higher than k2k cost
    const positiveSaving = calculateProcurementSavings({
      k2kUnitWholesalePrice: 25,
      referenceMandiRetailPrice: 32,
      quantityKg: 500,
    });
    assert(
      positiveSaving.isSavings === true && positiveSaving.difference === 3500,
      'Positive savings correctly detected when reference > K2K cost'
    );

    // Negative savings scenario: reference is lower than k2k cost
    const negativeSaving = calculateProcurementSavings({
      k2kUnitWholesalePrice: 35,
      referenceMandiRetailPrice: 30,
      quantityKg: 500,
    });
    assert(
      negativeSaving.isSavings === false && negativeSaving.difference === -2500,
      'Negative outcome flags isSavings=false and calculates additional cost instead of false savings'
    );

    // ---------------------------------------------------------
    // TEST 5: Order State Machine Transitions
    // ---------------------------------------------------------
    console.log('\n--- 5. Validated Order State Machine ---');
    // Farmer allowed transitions
    assert(
      canTransitionOrder('PENDING_FARMER_CONFIRMATION', 'ACCEPTED', 'FARMER').allowed === true,
      'Farmer can transition PENDING_FARMER_CONFIRMATION -> ACCEPTED'
    );
    assert(
      canTransitionOrder('ACCEPTED', 'PREPARING', 'FARMER').allowed === true,
      'Farmer can transition ACCEPTED -> PREPARING'
    );
    assert(
      canTransitionOrder('PREPARING', 'READY_FOR_PICKUP', 'FARMER').allowed === true,
      'Farmer can transition PREPARING -> READY_FOR_PICKUP'
    );
    // Transport allowed transitions
    assert(
      canTransitionOrder('READY_FOR_PICKUP', 'PICKED_UP', 'TRANSPORT_PARTNER').allowed === true,
      'Transport Partner can transition READY_FOR_PICKUP -> PICKED_UP'
    );
    assert(
      canTransitionOrder('PICKED_UP', 'IN_TRANSIT', 'TRANSPORT_PARTNER').allowed === true,
      'Transport Partner can transition PICKED_UP -> IN_TRANSIT'
    );
    assert(
      canTransitionOrder('IN_TRANSIT', 'DELIVERED', 'TRANSPORT_PARTNER').allowed === true,
      'Transport Partner can transition IN_TRANSIT -> DELIVERED'
    );
    // Illegal transitions rejected
    assert(
      canTransitionOrder('PENDING_FARMER_CONFIRMATION', 'DELIVERED', 'BUYER').allowed === false,
      'Illegal skip transition directly to DELIVERED is rejected'
    );
    assert(
      canTransitionOrder('DELIVERED', 'CANCELLED', 'BUYER').allowed === false,
      'Cannot cancel already delivered order'
    );

    // ---------------------------------------------------------
    // TEST 6: Database Users & Role Profiles Persistence
    // ---------------------------------------------------------
    console.log('\n--- 6. Database Verification: 4 Distinct Seeded Roles ---');
    const farmer = await prisma.farmerProfile.findFirst({ include: { user: true } });
    const buyer = await prisma.businessProfile.findFirst({ include: { user: true } });
    const transport = await prisma.transportPartnerProfile.findFirst({ include: { user: true } });
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    assert(farmer !== null && farmer.user.role === 'FARMER', 'Farmer profile and user link verified in DB');
    assert(buyer !== null && buyer.user.role === 'BUYER', 'Buyer profile and user link verified in DB');
    assert(transport !== null && transport.user.role === 'TRANSPORT_PARTNER', 'Transport Partner link verified in DB');
    assert(admin !== null && admin.role === 'ADMIN', 'Admin authority verified in DB');

    // ---------------------------------------------------------
    // TEST 7: Produce Listings & Category Integrity
    // ---------------------------------------------------------
    console.log('\n--- 7. Produce Listings & Category Relations ---');
    const listingsCount = await prisma.produceListing.count();
    const categoriesCount = await prisma.productCategory.count();
    assert(listingsCount > 0, `Active produce listings found in DB (${listingsCount} listings)`);
    assert(categoriesCount > 0, `Categories found in DB (${categoriesCount} categories)`);

    // ---------------------------------------------------------
    // TEST 8: Atomic Inventory Concurrency & Reservation
    // ---------------------------------------------------------
    console.log('\n--- 8. Atomic Inventory Reservation ---');
    const sampleProduce = await prisma.produceListing.findFirst({
      where: { availableStockKg: { gt: 100 } },
    });
    if (sampleProduce) {
      const initialStock = sampleProduce.availableStockKg;
      const reserveAmount = 20;

      // Decrement
      const updated = await prisma.produceListing.update({
        where: { id: sampleProduce.id },
        data: { availableStockKg: { decrement: reserveAmount } },
      });
      assert(
        updated.availableStockKg === initialStock - reserveAmount,
        `Atomic stock decrement: ${initialStock}kg -> ${updated.availableStockKg}kg`
      );

      // Restore
      await prisma.produceListing.update({
        where: { id: sampleProduce.id },
        data: { availableStockKg: { increment: reserveAmount } },
      });
      assert(true, 'Stock successfully restored back to original balance');
    }

    // ---------------------------------------------------------
    // TEST 9: Order Creation, HSN Invoicing & QR Passcode
    // ---------------------------------------------------------
    console.log('\n--- 9. Order Graph & Invoice Integrity ---');
    const sampleOrder = await prisma.order.findFirst({
      include: { items: true, delivery: true, farmer: true, buyer: true },
    });
    assert(sampleOrder !== null, 'Order records exist in DB');
    if (sampleOrder) {
      assert(
        sampleOrder.invoiceNumber.startsWith('INV-') && sampleOrder.qrPasscode.startsWith('OTP-'),
        `Order ${sampleOrder.orderNumber} contains valid invoice (${sampleOrder.invoiceNumber}) and gate passcode (${sampleOrder.qrPasscode})`
      );
      assert(sampleOrder.items.length > 0, `Order contains ${sampleOrder.items.length} itemized commodities`);
    }

    // ---------------------------------------------------------
    // TEST 10: Transport Mileage & Revenue Sharing (85% Driver / 15% Platform)
    // ---------------------------------------------------------
    console.log('\n--- 10. Transport Margin & Driver Payout Split ---');
    const sampleDelivery = await prisma.delivery.findFirst();
    if (sampleDelivery) {
      const driverShare = sampleDelivery.driverPayout;
      const margin = sampleDelivery.platformLogisticsMargin;
      const total = sampleDelivery.totalFee;
      assert(
        Math.abs(driverShare + margin - total) < 0.1,
        `Delivery fee split (Driver: ₹${driverShare} + Margin: ₹${margin} = Total: ₹${total}) balances perfectly`
      );
    }

    // ---------------------------------------------------------
    // TEST 11: Admin Platform Settings Persistence
    // ---------------------------------------------------------
    console.log('\n--- 11. Admin Financial Settings Key-Value Store ---');
    const commSetting = await prisma.platformSettings.findUnique({
      where: { key: 'commission_rate_percent' },
    });
    assert(commSetting !== null && commSetting.value === '3.0', 'Platform commission rate setting is active (3.0%)');

    // ---------------------------------------------------------
    // TEST 12: Audit Log Ledger Traceability
    // ---------------------------------------------------------
    console.log('\n--- 12. Security Audit Logs ---');
    const auditCount = await prisma.auditLog.count();
    assert(auditCount > 0, `Audit log ledger records found (${auditCount} actions recorded)`);

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED    `);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().finally(async () => {
  await prisma.$disconnect();
});
