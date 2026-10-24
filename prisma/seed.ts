import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Khet2Kitchen database seeding with verified demonstration records...');

  // 1. Clean existing data in relational order
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.businessSubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.featuredListing.deleteMany();
  await prisma.commissionRecord.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.produceListing.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.address.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.transportPartnerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformSettings.deleteMany();

  // Common password hash for demo accounts: "Demo@12345"
  const defaultPasswordHash = await bcrypt.hash('Demo@12345', 10);

  // 2. Platform Settings
  await prisma.platformSettings.createMany({
    data: [
      {
        key: 'commission_rate_percent',
        value: '3.0',
        description: 'Platform commission percentage charged on eligible order subtotal (Demonstration: 3%)',
      },
      {
        key: 'logistics_base_fee',
        value: '250.0',
        description: 'Base logistics charge for farm-to-kitchen transportation (INR)',
      },
      {
        key: 'logistics_per_km_fee',
        value: '12.0',
        description: 'Per kilometer logistics fee beyond base radius (INR)',
      },
      {
        key: 'default_buyer_subscription_price',
        value: '499.0',
        description: 'Standard monthly subscription rate for commercial buyers (INR)',
      },
    ],
  });

  // 3. Subscription Plans
  const starterPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Starter Kitchen Plan (Demo)',
      slug: 'starter-kitchen',
      tier: 'STARTER',
      monthlyPrice: 499.0,
      maxOrdersPerMonth: 20,
      hasPriorityDelivery: true,
      hasDedicatedSupport: false,
      isActive: true,
    },
  });

  const institutionalPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Institutional Bulk Mess Plan (Demo)',
      slug: 'institutional-bulk',
      tier: 'INSTITUTIONAL',
      monthlyPrice: 1499.0,
      maxOrdersPerMonth: 9999,
      hasPriorityDelivery: true,
      hasDedicatedSupport: true,
      isActive: true,
    },
  });

  // 4. Product Categories
  const catVeg = await prisma.productCategory.create({
    data: {
      name: 'Fresh Vegetables',
      slug: 'fresh-vegetables',
      description: 'Daily harvested vegetables directly from local farm gates [Demonstration Catalog]',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
    },
  });

  const catGrains = await prisma.productCategory.create({
    data: {
      name: 'Grains & Millets',
      slug: 'grains-and-millets',
      description: 'Farm-cleaned, graded wheat, rice, jowar and bajra lots [Demonstration Catalog]',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    },
  });

  const catSpices = await prisma.productCategory.create({
    data: {
      name: 'Roots & Seasoning',
      slug: 'roots-and-seasoning',
      description: 'Fresh ginger, turmeric, garlic and chillies [Demonstration Catalog]',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
    },
  });

  // 5. Users and Profiles

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@k2k.in',
      passwordHash: defaultPasswordHash,
      name: 'K2K Platform Administrator [Demo]',
      phone: '+91 20 2554 8890',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  });

  // Farmer 1: Rajesh Patil
  const farmer1User = await prisma.user.create({
    data: {
      email: 'farmer@k2k.in',
      passwordHash: defaultPasswordHash,
      name: 'Rajesh Patil [Demonstration Profile]',
      phone: '+91 98220 14820',
      role: 'FARMER',
      isActive: true,
      isVerified: true,
    },
  });

  const farmer1Profile = await prisma.farmerProfile.create({
    data: {
      userId: farmer1User.id,
      farmName: 'Patil Agro Fresh Farms [Demo]',
      village: 'Otur',
      taluka: 'Junnar',
      district: 'Pune',
      state: 'Maharashtra',
      pinCode: '412409',
      landSizeAcres: 12.5,
      primaryCrops: 'Tomato,Onion,Potato,Green Chillies',
      bankAccountNo: '9876543210142',
      bankIfsc: 'MAHB0000142',
      bankName: 'Bank of Maharashtra (Otur Branch)',
      isVerified: true,
      verificationStatus: 'APPROVED',
      verificationNotes: 'Demonstration verified farmer with 7/12 extract on record.',
      rating: 4.85,
      reviewsCount: 64,
      totalEarnings: 184500.0,
      middlemanSaved: 22140.0,
      coordinatesLat: 19.2592,
      coordinatesLng: 73.9875,
    },
  });

  // Farmer 2: Suresh Deshmukh
  const farmer2User = await prisma.user.create({
    data: {
      email: 'suresh@k2k.in',
      passwordHash: defaultPasswordHash,
      name: 'Suresh Deshmukh [Demonstration Profile]',
      phone: '+91 94230 88219',
      role: 'FARMER',
      isActive: true,
      isVerified: true,
    },
  });

  const farmer2Profile = await prisma.farmerProfile.create({
    data: {
      userId: farmer2User.id,
      farmName: 'Sahyadri Organic Orchards [Demo]',
      village: 'Pimpalgaon Baswant',
      taluka: 'Niphad',
      district: 'Nashik',
      state: 'Maharashtra',
      pinCode: '422209',
      landSizeAcres: 18.0,
      primaryCrops: 'Tomato,Red Onion,Potato,Ginger',
      bankAccountNo: '5432167890123',
      bankIfsc: 'SBIN0001234',
      bankName: 'State Bank of India',
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.9,
      reviewsCount: 88,
      totalEarnings: 320400.0,
      middlemanSaved: 38400.0,
      coordinatesLat: 20.1738,
      coordinatesLng: 73.9856,
    },
  });

  // Farmer 3: Anita Shinde
  const farmer3User = await prisma.user.create({
    data: {
      email: 'anita@k2k.in',
      passwordHash: defaultPasswordHash,
      name: 'Anita Shinde [Demonstration Profile]',
      phone: '+91 98812 77410',
      role: 'FARMER',
      isActive: true,
      isVerified: true,
    },
  });

  const farmer3Profile = await prisma.farmerProfile.create({
    data: {
      userId: farmer3User.id,
      farmName: 'Shinde Krishi Vikas Farm [Demo]',
      village: 'Patas',
      taluka: 'Daund',
      district: 'Pune',
      state: 'Maharashtra',
      pinCode: '412219',
      landSizeAcres: 15.0,
      primaryCrops: 'Lokwan Wheat,Wada Kolam Rice',
      bankAccountNo: '1122334455667',
      bankIfsc: 'CBIN0281234',
      bankName: 'Central Bank of India',
      isVerified: true,
      verificationStatus: 'APPROVED',
      rating: 4.75,
      reviewsCount: 39,
      totalEarnings: 142000.0,
      middlemanSaved: 17040.0,
      coordinatesLat: 18.4328,
      coordinatesLng: 74.4172,
    },
  });

  // Buyer 1: Spice Garden Restaurant
  const buyer1User = await prisma.user.create({
    data: {
      email: 'buyer@k2k.in',
      passwordHash: defaultPasswordHash,
      name: 'Spice Garden Restaurant [Demonstration Account]',
      phone: '+91 98234 56789',
      role: 'BUYER',
      isActive: true,
      isVerified: true,
    },
  });

  const buyer1Profile = await prisma.businessProfile.create({
    data: {
      userId: buyer1User.id,
      businessName: 'Spice Garden Multi-Cuisine Restaurant [Demo]',
      businessType: 'RESTAURANT',
      contactPerson: 'Vikram Joshi (Executive Chef & Procurement)',
      gstin: '27AABCS1429G1Z5',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pinCode: '411004',
      isVerified: true,
      verificationStatus: 'APPROVED',
      monthlyProcurementSpent: 84500.0,
      coordinatesLat: 18.5204,
      coordinatesLng: 73.8567,
    },
  });

  const buyer1Address = await prisma.address.create({
    data: {
      userId: buyer1User.id,
      label: 'Main Kitchen & Loading Bay',
      street: '42, Fergusson College Road, Deccan Gymkhana',
      landmark: 'Near Goodluck Cafe Gate',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pinCode: '411004',
      coordinatesLat: 18.5204,
      coordinatesLng: 73.8567,
      isDefault: true,
    },
  });

  // Buyer 2: COEP Hostel Mess
  const buyer2User = await prisma.user.create({
    data: {
      email: 'coep@k2k.in',
      passwordHash: defaultPasswordHash,
      name: 'COEP Engineering Hostel Mess [Demo]',
      phone: '+91 99221 44556',
      role: 'BUYER',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.businessProfile.create({
    data: {
      userId: buyer2User.id,
      businessName: 'COEP Students Hostel Canteen & Mess [Demo]',
      businessType: 'MESS',
      contactPerson: 'Milind Kulkarni (Mess Secretary)',
      gstin: '27AAATC8820B1Z1',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pinCode: '411005',
      isVerified: true,
      verificationStatus: 'APPROVED',
      monthlyProcurementSpent: 165000.0,
      coordinatesLat: 18.5293,
      coordinatesLng: 73.8565,
    },
  });

  // Buyer 1 Active Subscription
  await prisma.businessSubscription.create({
    data: {
      businessId: buyer1Profile.id,
      planId: starterPlan.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      amountPaid: 499.0,
      autoRenew: true,
    },
  });

  // Transport Partner 1: Ganesh Shinde
  const transport1User = await prisma.user.create({
    data: {
      email: 'transport@k2k.in',
      passwordHash: defaultPasswordHash,
      name: 'Ganesh Shinde [Demo Logistics]',
      phone: '+91 98500 12345',
      role: 'TRANSPORT_PARTNER',
      isActive: true,
      isVerified: true,
    },
  });

  const transport1Profile = await prisma.transportPartnerProfile.create({
    data: {
      userId: transport1User.id,
      vehicleType: 'MINI_TRUCK',
      vehicleNumber: 'MH-12-QE-4521',
      maxPayloadKg: 1500.0,
      drivingLicenseNo: 'MH12-2018-0099881',
      isVerified: true,
      verificationStatus: 'APPROVED',
      isAvailable: true,
      currentLocation: 'Pune-Nashik Highway, Narayangaon Hub',
      rating: 4.9,
      totalTrips: 84,
      totalEarnings: 42000.0,
    },
  });

  // 6. Produce Listings
  const prodTomato = await prisma.produceListing.create({
    data: {
      farmerId: farmer1Profile.id,
      categoryId: catVeg.id,
      name: 'Fresh Red Hybrid Tomato (Grade A) [Demo]',
      slug: 'fresh-red-hybrid-tomato-grade-a',
      description: 'Firm, uniform size, naturally vine-ripened tomatoes. Handpicked at 5 AM. Zero cold-storage stagnation.',
      qualityGrade: 'GRADE_A',
      unit: 'kg',
      pricePerUnit: 25.0,
      availableStockKg: 1200.0,
      minOrderQuantityKg: 100.0,
      harvestDate: 'Daily Harvested (Today 5:30 AM)',
      availabilityDate: 'Immediate Farm Gate Dispatch',
      status: 'ACTIVE',
      isFeatured: true,
    },
  });

  await prisma.productImage.create({
    data: {
      produceId: prodTomato.id,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      isPrimary: true,
      order: 1,
    },
  });

  const prodOnion = await prisma.produceListing.create({
    data: {
      farmerId: farmer1Profile.id,
      categoryId: catVeg.id,
      name: 'Nashik Red Onion (Medium Size) [Demo]',
      slug: 'nashik-red-onion-medium',
      description: 'Cured medium onions with tight outer dry skins, ideal for high-volume commercial gravies, curries and slicing.',
      qualityGrade: 'GRADE_A',
      unit: 'kg',
      pricePerUnit: 28.0,
      availableStockKg: 2500.0,
      minOrderQuantityKg: 150.0,
      harvestDate: 'Cured & Graded Yesterday',
      availabilityDate: 'Ready for Dispatch',
      status: 'ACTIVE',
      isFeatured: true,
    },
  });

  await prisma.productImage.create({
    data: {
      produceId: prodOnion.id,
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      isPrimary: true,
      order: 1,
    },
  });

  const prodPotato = await prisma.produceListing.create({
    data: {
      farmerId: farmer2Profile.id,
      categoryId: catVeg.id,
      name: 'Jyoti / Chipsona Table Potato [Demo]',
      slug: 'jyoti-table-potato-premium',
      description: 'Cleaned table potatoes, low sugar, high dry-matter content suitable for french fries, curries and boiled snacks.',
      qualityGrade: 'PREMIUM',
      unit: 'kg',
      pricePerUnit: 22.0,
      availableStockKg: 1800.0,
      minOrderQuantityKg: 100.0,
      harvestDate: 'Fresh Dig, Dry Cleaned',
      availabilityDate: 'Ready for Dispatch',
      status: 'ACTIVE',
      isFeatured: false,
    },
  });

  await prisma.productImage.create({
    data: {
      produceId: prodPotato.id,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      isPrimary: true,
      order: 1,
    },
  });

  const prodWheat = await prisma.produceListing.create({
    data: {
      farmerId: farmer3Profile.id,
      categoryId: catGrains.id,
      name: 'Lokwan Sharbati Golden Wheat [Demo]',
      slug: 'lokwan-sharbati-golden-wheat',
      description: 'Machine cleaned, destoned whole wheat berries in sealed 50kg bags. Excellent soft roti texture for student messes.',
      qualityGrade: 'PREMIUM',
      unit: 'kg',
      pricePerUnit: 32.0,
      availableStockKg: 3500.0,
      minOrderQuantityKg: 200.0,
      harvestDate: 'Seasonal Harvest Lot, Cleaned',
      availabilityDate: 'In Farm Warehouse',
      status: 'ACTIVE',
      isFeatured: true,
    },
  });

  await prisma.productImage.create({
    data: {
      produceId: prodWheat.id,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      isPrimary: true,
      order: 1,
    },
  });

  const prodGinger = await prisma.produceListing.create({
    data: {
      farmerId: farmer2Profile.id,
      categoryId: catSpices.id,
      name: 'Satara Fresh Aromatic Ginger [Demo]',
      slug: 'satara-fresh-aromatic-ginger',
      description: 'Cleaned high-fiber aromatic ginger root from Wai Valley. Sharp aroma for masala gravies and tea prep.',
      qualityGrade: 'ORGANIC',
      unit: 'kg',
      pricePerUnit: 85.0,
      availableStockKg: 400.0,
      minOrderQuantityKg: 30.0,
      harvestDate: 'Harvested 2 Days Ago',
      availabilityDate: 'Immediate Farm Dispatch',
      status: 'ACTIVE',
      isFeatured: false,
    },
  });

  await prisma.productImage.create({
    data: {
      produceId: prodGinger.id,
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      isPrimary: true,
      order: 1,
    },
  });

  // 7. Seed Demonstration Orders

  // Order 1: Completed Order (Spice Garden -> Rajesh Patil)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'K2K-2026-1048',
      buyerId: buyer1User.id,
      farmerId: farmer1Profile.id,
      status: 'DELIVERED',
      subtotal: 12500.0, // 500kg * 25
      deliveryFee: 650.0,
      platformCommission: 375.0, // 3% of 12500
      taxAmount: 0.0, // Agri exempt
      totalAmount: 13525.0,
      fulfillmentType: 'KHET2KITCHEN_DELIVERY',
      deliveryAddressId: buyer1Address.id,
      preferredDeliveryDate: 'Yesterday 08:30 AM',
      preferredTimeSlot: 'Morning (07:00 AM - 09:30 AM)',
      farmerNotes: 'Packed in 25 returnable crates, weighed on electronic scale.',
      qrPasscode: 'OTP-7842',
      invoiceNumber: 'INV-2026-001048',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      produceId: prodTomato.id,
      productName: prodTomato.name,
      qualityGrade: 'GRADE_A',
      unit: 'kg',
      quantity: 500.0,
      unitPrice: 25.0,
      subtotal: 12500.0,
    },
  });

  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order1.id,
        fromStatus: 'PENDING_FARMER_CONFIRMATION',
        toStatus: 'ACCEPTED',
        changedById: farmer1User.id,
        note: 'Farmer accepted batch & price reservation.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        orderId: order1.id,
        fromStatus: 'ACCEPTED',
        toStatus: 'PREPARING',
        changedById: farmer1User.id,
        note: 'Harvesting & sorting at farm bay.',
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
      },
      {
        orderId: order1.id,
        fromStatus: 'PREPARING',
        toStatus: 'READY_FOR_PICKUP',
        changedById: farmer1User.id,
        note: 'Weighed and crated at Farm Gate Bay 2.',
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      },
      {
        orderId: order1.id,
        fromStatus: 'READY_FOR_PICKUP',
        toStatus: 'PICKED_UP',
        changedById: transport1User.id,
        note: 'Loaded into MH-12-QE-4521 with weighing slip.',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        orderId: order1.id,
        fromStatus: 'PICKED_UP',
        toStatus: 'DELIVERED',
        changedById: transport1User.id,
        note: 'Delivered at restaurant kitchen with verified OTP.',
        createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
      },
    ],
  });

  // Delivery record for Order 1
  await prisma.delivery.create({
    data: {
      orderId: order1.id,
      transportPartnerId: transport1Profile.id,
      pickupAddress: 'Patil Agro Fresh Farms, Loading Bay 2, Otur, Junnar',
      deliveryAddress: 'Spice Garden Restaurant, 42 FC Road, Deccan Gymkhana, Pune',
      estimatedDistanceKm: 42.0,
      baseFee: 250.0,
      perKmFee: 12.0,
      totalFee: 650.0,
      platformLogisticsMargin: 100.0,
      driverPayout: 550.0,
      status: 'DELIVERED',
      proofOfDeliveryNotes: 'Handover complete. 25 crates counted & weighed at kitchen gate.',
      deliveredAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    },
  });

  // Payment for Order 1
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      amount: 13525.0,
      currency: 'INR',
      method: 'MOCK_UPI',
      status: 'COMPLETED',
      providerTransactionRef: 'UPI-DEMO-REF-9921448',
      paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  // Commission record for Order 1
  await prisma.commissionRecord.create({
    data: {
      orderId: order1.id,
      farmerId: farmer1Profile.id,
      grossSubtotal: 12500.0,
      commissionRatePercent: 3.0,
      commissionAmount: 375.0,
      netFarmerPayout: 12125.0,
      status: 'SETTLED',
    },
  });

  // Review for Order 1
  await prisma.review.create({
    data: {
      orderId: order1.id,
      farmerId: farmer1Profile.id,
      buyerId: buyer1User.id,
      rating: 5,
      comment: 'Super fresh Grade A tomatoes! Delivered within 4 hours of harvest. Gravies taste significantly better.',
      isPublic: true,
    },
  });

  // Order 2: In-Transit Order
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'K2K-2026-1052',
      buyerId: buyer1User.id,
      farmerId: farmer1Profile.id,
      status: 'IN_TRANSIT',
      subtotal: 8400.0, // 300kg onion * 28
      deliveryFee: 550.0,
      platformCommission: 252.0,
      taxAmount: 0.0,
      totalAmount: 9202.0,
      fulfillmentType: 'KHET2KITCHEN_DELIVERY',
      deliveryAddressId: buyer1Address.id,
      preferredDeliveryDate: 'Today 11:00 AM',
      preferredTimeSlot: 'Morning Slot',
      farmerNotes: 'Grade A sorted mesh bags (50kg x 6 bags).',
      qrPasscode: 'OTP-4912',
      invoiceNumber: 'INV-2026-001052',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      produceId: prodOnion.id,
      productName: prodOnion.name,
      qualityGrade: 'GRADE_A',
      unit: 'kg',
      quantity: 300.0,
      unitPrice: 28.0,
      subtotal: 8400.0,
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order2.id,
      transportPartnerId: transport1Profile.id,
      pickupAddress: 'Patil Agro Fresh Farms, Bay 2, Otur',
      deliveryAddress: 'Spice Garden Restaurant, 42 FC Road, Pune',
      estimatedDistanceKm: 38.0,
      baseFee: 250.0,
      perKmFee: 12.0,
      totalFee: 550.0,
      platformLogisticsMargin: 80.0,
      driverPayout: 470.0,
      status: 'IN_TRANSIT',
      proofOfDeliveryNotes: 'Driver en route via Pune-Nashik highway.',
      pickedUpAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      amount: 9202.0,
      currency: 'INR',
      method: 'INSTITUTIONAL_CREDIT_NET30',
      status: 'COMPLETED',
      providerTransactionRef: 'NET30-APPROVED-CREDIT',
      paidAt: new Date(),
    },
  });

  // Order 3: Pending Confirmation for Farmer 2 (Suresh Deshmukh)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'K2K-2026-1055',
      buyerId: buyer2User.id,
      farmerId: farmer2Profile.id,
      status: 'PENDING_FARMER_CONFIRMATION',
      subtotal: 8800.0, // 400kg potato * 22
      deliveryFee: 750.0,
      platformCommission: 264.0,
      taxAmount: 0.0,
      totalAmount: 9814.0,
      fulfillmentType: 'KHET2KITCHEN_DELIVERY',
      preferredDeliveryDate: 'Tomorrow 08:00 AM',
      preferredTimeSlot: 'Early Morning',
      qrPasscode: 'OTP-8319',
      invoiceNumber: 'INV-2026-001055',
      createdAt: new Date(),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      produceId: prodPotato.id,
      productName: prodPotato.name,
      qualityGrade: 'PREMIUM',
      unit: 'kg',
      quantity: 400.0,
      unitPrice: 22.0,
      subtotal: 8800.0,
    },
  });

  // 8. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: farmer1User.id,
        title: 'New Order Received: K2K-2026-1052',
        message: 'Spice Garden Restaurant placed a direct order for 300kg Nashik Red Onion.',
        type: 'ORDER_UPDATE',
        linkUrl: '/dashboard/farmer/orders',
        isRead: true,
      },
      {
        userId: farmer2User.id,
        title: 'New Order Awaiting Acceptance: K2K-2026-1055',
        message: 'COEP Engineering Hostel Mess requested 400kg Jyoti Table Potatoes for tomorrow morning.',
        type: 'ORDER_UPDATE',
        linkUrl: '/dashboard/farmer/orders',
        isRead: false,
      },
      {
        userId: buyer1User.id,
        title: 'Order Dispatched: K2K-2026-1052',
        message: 'Driver Ganesh Shinde (MH-12-QE-4521) picked up your onions and is en route.',
        type: 'DELIVERY_UPDATE',
        linkUrl: '/dashboard/buyer/orders',
        isRead: false,
      },
      {
        userId: transport1User.id,
        title: 'Delivery Mission Assigned',
        message: 'Order K2K-2026-1052 assigned to your vehicle MH-12-QE-4521 from Otur to FC Road.',
        type: 'DELIVERY_UPDATE',
        linkUrl: '/dashboard/transport/deliveries',
        isRead: true,
      },
    ],
  });

  // 9. Demonstration Support Ticket
  await prisma.supportTicket.create({
    data: {
      userId: buyer1User.id,
      subject: 'Inquiry: Weekly Recurring Standing Order for Tomatoes',
      category: 'ORDER_ISSUE',
      message: 'Can we set up an automated standing procurement of 500kg Grade A tomatoes every Tuesday and Friday morning?',
      priority: 'NORMAL',
      status: 'RESOLVED',
      resolutionNotes: 'K2K Account Manager set up recurring calendar schedule with Rajesh Patil.',
    },
  });

  // 10. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'PLATFORM_INITIALIZATION',
      entityType: 'SETTINGS',
      entityId: 'SYSTEM',
      detailsJson: JSON.stringify({
        environment: 'Demonstration / Local MVP',
        version: '1.0.0',
        activeProducersCount: 3,
        activeBuyersCount: 2,
        activeLogisticsPartnersCount: 1,
      }),
    },
  });

  console.log('✅ Khet2Kitchen database seeding completed successfully!');
  console.log(`
  Demo Credentials (Password for all: Demo@12345):
  -------------------------------------------------------------
  Admin:             admin@k2k.in
  Farmer:            farmer@k2k.in (Rajesh Patil, Junnar)
  Business Buyer:    buyer@k2k.in  (Spice Garden Restaurant, Pune)
  Transport Partner: transport@k2k.in (Ganesh Shinde, MH-12-QE-4521)
  -------------------------------------------------------------
  All demonstration profiles and data are clearly labeled.
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
