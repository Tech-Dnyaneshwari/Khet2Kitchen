-- ============================================================
-- Khet2Kitchen — Initial Database Schema
-- PostgreSQL / Supabase Migration: 001_initial_schema
-- Run this in Supabase SQL Editor before seeding demo data.
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "Role" AS ENUM ('FARMER', 'BUYER', 'TRANSPORT_PARTNER', 'ADMIN');
CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING_FARMER_CONFIRMATION',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
  'REJECTED'
);
CREATE TYPE "FulfillmentType" AS ENUM ('FARM_GATE_PICKUP', 'KHET2KITCHEN_DELIVERY');
CREATE TYPE "DeliveryStatus" AS ENUM ('REQUESTED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');
CREATE TYPE "QualityGrade" AS ENUM ('GRADE_A', 'GRADE_B', 'PREMIUM', 'ORGANIC');
CREATE TYPE "ProduceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'OUT_OF_STOCK', 'ARCHIVED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('MOCK_UPI', 'MOCK_NET_BANKING', 'RAZORPAY', 'CASH_ON_DELIVERY', 'INSTITUTIONAL_CREDIT_NET30');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "BusinessType" AS ENUM ('RESTAURANT', 'HOTEL', 'MESS', 'HOSTEL', 'CANTEEN', 'CATERER', 'OTHER');
CREATE TYPE "VehicleType" AS ENUM ('MINI_TRUCK', 'TEMPO', 'PICKUP_VAN', 'AUTO_LOADER', 'OTHER');

-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE "User" (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" TEXT        NOT NULL,
  name          VARCHAR(255) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  role          "Role"       NOT NULL DEFAULT 'BUYER',
  "isActive"    BOOLEAN      NOT NULL DEFAULT TRUE,
  "isVerified"  BOOLEAN      NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role  ON "User"(role);

CREATE TABLE "FarmerProfile" (
  id                 UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"           UUID               UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "farmName"         VARCHAR(255)       NOT NULL,
  village            VARCHAR(100)       NOT NULL,
  taluka             VARCHAR(100)       NOT NULL,
  district           VARCHAR(100)       NOT NULL,
  state              VARCHAR(100)       NOT NULL DEFAULT 'Maharashtra',
  "pinCode"          VARCHAR(10)        NOT NULL,
  "landSizeAcres"    NUMERIC(10,2),
  "primaryCrops"     TEXT[]             NOT NULL DEFAULT '{}',
  "bankAccountNo"    VARCHAR(30),
  "bankIfsc"         VARCHAR(15),
  "bankName"         VARCHAR(100),
  "isVerified"       BOOLEAN            NOT NULL DEFAULT FALSE,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "verificationNotes" TEXT,
  rating             NUMERIC(3,2)       NOT NULL DEFAULT 5.00,
  "reviewsCount"     INTEGER            NOT NULL DEFAULT 0,
  "totalEarnings"    NUMERIC(12,2)      NOT NULL DEFAULT 0.00,
  "middlemanSaved"   NUMERIC(12,2)      NOT NULL DEFAULT 0.00,
  "coordinatesLat"   NUMERIC(10,6),
  "coordinatesLng"   NUMERIC(10,6),
  "createdAt"        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_farmer_district  ON "FarmerProfile"(district);
CREATE INDEX idx_farmer_verified  ON "FarmerProfile"("isVerified");

CREATE TABLE "BusinessProfile" (
  id                       UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"                 UUID              UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "businessName"           VARCHAR(255)      NOT NULL,
  "businessType"           "BusinessType"    NOT NULL DEFAULT 'RESTAURANT',
  "contactPerson"          VARCHAR(255)      NOT NULL,
  gstin                    VARCHAR(20),
  city                     VARCHAR(100)      NOT NULL,
  district                 VARCHAR(100)      NOT NULL,
  state                    VARCHAR(100)      NOT NULL DEFAULT 'Maharashtra',
  "pinCode"                VARCHAR(10)       NOT NULL,
  "isVerified"             BOOLEAN           NOT NULL DEFAULT FALSE,
  "verificationStatus"     "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "monthlyProcurementSpent" NUMERIC(12,2)   NOT NULL DEFAULT 0.00,
  "coordinatesLat"         NUMERIC(10,6),
  "coordinatesLng"         NUMERIC(10,6),
  "createdAt"              TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_business_district ON "BusinessProfile"(district);
CREATE INDEX idx_business_type     ON "BusinessProfile"("businessType");

CREATE TABLE "TransportPartnerProfile" (
  id                  UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"            UUID                UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "vehicleType"       "VehicleType"       NOT NULL DEFAULT 'MINI_TRUCK',
  "vehicleNumber"     VARCHAR(20)         UNIQUE NOT NULL,
  "maxPayloadKg"      NUMERIC(10,2)       NOT NULL,
  "drivingLicenseNo"  VARCHAR(30)         NOT NULL,
  "isVerified"        BOOLEAN             NOT NULL DEFAULT FALSE,
  "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "isAvailable"       BOOLEAN             NOT NULL DEFAULT TRUE,
  "currentLocation"   TEXT,
  rating              NUMERIC(3,2)        NOT NULL DEFAULT 5.00,
  "totalTrips"        INTEGER             NOT NULL DEFAULT 0,
  "totalEarnings"     NUMERIC(12,2)       NOT NULL DEFAULT 0.00,
  "createdAt"         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transport_available ON "TransportPartnerProfile"("isAvailable");

CREATE TABLE "Address" (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"        UUID         NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  label           VARCHAR(100) NOT NULL DEFAULT 'Kitchen',
  street          TEXT         NOT NULL,
  landmark        TEXT,
  city            VARCHAR(100) NOT NULL,
  district        VARCHAR(100) NOT NULL,
  state           VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
  "pinCode"       VARCHAR(10)  NOT NULL,
  "coordinatesLat" NUMERIC(10,6),
  "coordinatesLng" NUMERIC(10,6),
  "isDefault"     BOOLEAN      NOT NULL DEFAULT FALSE,
  "createdAt"     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_address_user ON "Address"("userId");

-- ============================================================
-- PRODUCE CATALOG
-- ============================================================

CREATE TABLE "ProductCategory" (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  "imageUrl"  TEXT,
  "isActive"  BOOLEAN      NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE "ProduceListing" (
  id                  UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  "farmerId"          UUID           NOT NULL REFERENCES "FarmerProfile"(id) ON DELETE CASCADE,
  "categoryId"        UUID           NOT NULL REFERENCES "ProductCategory"(id),
  name                VARCHAR(255)   NOT NULL,
  slug                VARCHAR(255)   NOT NULL,
  description         TEXT           NOT NULL,
  "qualityGrade"      "QualityGrade" NOT NULL DEFAULT 'GRADE_A',
  unit                VARCHAR(20)    NOT NULL DEFAULT 'kg',
  "pricePerUnit"      NUMERIC(10,2)  NOT NULL,
  "availableStockKg"  NUMERIC(10,2)  NOT NULL,
  "minOrderQuantityKg" NUMERIC(10,2) NOT NULL,
  "harvestDate"       TEXT           NOT NULL,
  "availabilityDate"  TEXT           NOT NULL,
  status              "ProduceStatus" NOT NULL DEFAULT 'ACTIVE',
  "isFeatured"        BOOLEAN        NOT NULL DEFAULT FALSE,
  "createdAt"         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_produce_farmer   ON "ProduceListing"("farmerId");
CREATE INDEX idx_produce_category ON "ProduceListing"("categoryId");
CREATE INDEX idx_produce_status   ON "ProduceListing"(status);
CREATE INDEX idx_produce_price    ON "ProduceListing"("pricePerUnit");

CREATE TABLE "ProductImage" (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  "produceId" UUID    NOT NULL REFERENCES "ProduceListing"(id) ON DELETE CASCADE,
  "imageUrl"  TEXT    NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT FALSE,
  "order"     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_image_produce ON "ProductImage"("produceId");

CREATE TABLE "InventoryMovement" (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "produceId"      UUID          NOT NULL REFERENCES "ProduceListing"(id) ON DELETE CASCADE,
  "orderId"        UUID,
  "changeAmountKg" NUMERIC(10,2) NOT NULL,
  "balanceAfterKg" NUMERIC(10,2) NOT NULL,
  "movementType"   VARCHAR(50)   NOT NULL,
  note             TEXT,
  "createdAt"      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inv_produce ON "InventoryMovement"("produceId");
CREATE INDEX idx_inv_order   ON "InventoryMovement"("orderId");

-- ============================================================
-- CART
-- ============================================================

CREATE TABLE "Cart" (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "buyerId"   UUID        UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CartItem" (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "cartId"            UUID          NOT NULL REFERENCES "Cart"(id) ON DELETE CASCADE,
  "produceId"         UUID          NOT NULL REFERENCES "ProduceListing"(id) ON DELETE CASCADE,
  "quantityKg"        NUMERIC(10,2) NOT NULL,
  "unitPriceSnapshot" NUMERIC(10,2) NOT NULL,
  "addedAt"           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE ("cartId", "produceId")
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE "Order" (
  id                    UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderNumber"         VARCHAR(30)       UNIQUE NOT NULL,
  "buyerId"             UUID              NOT NULL REFERENCES "User"(id),
  "farmerId"            UUID              NOT NULL REFERENCES "FarmerProfile"(id),
  status                "OrderStatus"     NOT NULL DEFAULT 'PENDING_FARMER_CONFIRMATION',
  subtotal              NUMERIC(12,2)     NOT NULL,
  "deliveryFee"         NUMERIC(10,2)     NOT NULL DEFAULT 0.00,
  "platformCommission"  NUMERIC(10,2)     NOT NULL DEFAULT 0.00,
  "taxAmount"           NUMERIC(10,2)     NOT NULL DEFAULT 0.00,
  "totalAmount"         NUMERIC(12,2)     NOT NULL,
  "fulfillmentType"     "FulfillmentType" NOT NULL DEFAULT 'KHET2KITCHEN_DELIVERY',
  "deliveryAddressId"   UUID              REFERENCES "Address"(id),
  "preferredDeliveryDate" TEXT,
  "preferredTimeSlot"   TEXT,
  "farmerNotes"         TEXT,
  "cancellationReason"  TEXT,
  "rejectionReason"     TEXT,
  "qrPasscode"          VARCHAR(20)       NOT NULL DEFAULT 'OTP-1234',
  "invoiceNumber"       VARCHAR(30)       UNIQUE NOT NULL,
  "createdAt"           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_buyer    ON "Order"("buyerId");
CREATE INDEX idx_order_farmer   ON "Order"("farmerId");
CREATE INDEX idx_order_status   ON "Order"(status);
CREATE INDEX idx_order_created  ON "Order"("createdAt");

CREATE TABLE "OrderItem" (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId"     UUID          NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "produceId"   UUID          NOT NULL REFERENCES "ProduceListing"(id),
  "productName" TEXT          NOT NULL,
  "qualityGrade" "QualityGrade" NOT NULL,
  unit          VARCHAR(20)   NOT NULL DEFAULT 'kg',
  quantity      NUMERIC(10,2) NOT NULL,
  "unitPrice"   NUMERIC(10,2) NOT NULL,
  subtotal      NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_order_item_order   ON "OrderItem"("orderId");
CREATE INDEX idx_order_item_produce ON "OrderItem"("produceId");

CREATE TABLE "OrderStatusHistory" (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId"     UUID         NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "fromStatus"  "OrderStatus" NOT NULL,
  "toStatus"    "OrderStatus" NOT NULL,
  "changedById" UUID         NOT NULL REFERENCES "User"(id),
  note          TEXT,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_history ON "OrderStatusHistory"("orderId");

-- ============================================================
-- DELIVERY
-- ============================================================

CREATE TABLE "Delivery" (
  id                       UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId"                UUID             UNIQUE NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "transportPartnerId"     UUID             REFERENCES "TransportPartnerProfile"(id),
  "pickupAddress"          TEXT             NOT NULL,
  "deliveryAddress"        TEXT             NOT NULL,
  "estimatedDistanceKm"    NUMERIC(8,2)     NOT NULL,
  "baseFee"                NUMERIC(10,2)    NOT NULL,
  "perKmFee"               NUMERIC(10,2)    NOT NULL,
  "totalFee"               NUMERIC(10,2)    NOT NULL,
  "platformLogisticsMargin" NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
  "driverPayout"           NUMERIC(10,2)    NOT NULL DEFAULT 0.00,
  status                   "DeliveryStatus" NOT NULL DEFAULT 'REQUESTED',
  "proofOfDeliveryNotes"   TEXT,
  "proofOfDeliveryUrl"     TEXT,
  "assignedAt"             TIMESTAMPTZ,
  "pickedUpAt"             TIMESTAMPTZ,
  "deliveredAt"            TIMESTAMPTZ,
  "failedReason"           TEXT,
  "createdAt"              TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_partner ON "Delivery"("transportPartnerId");
CREATE INDEX idx_delivery_status  ON "Delivery"(status);

-- ============================================================
-- PAYMENTS & COMMISSIONS
-- ============================================================

CREATE TABLE "Payment" (
  id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId"               UUID            UNIQUE NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  amount                  NUMERIC(12,2)   NOT NULL,
  currency                VARCHAR(5)      NOT NULL DEFAULT 'INR',
  method                  "PaymentMethod" NOT NULL DEFAULT 'MOCK_UPI',
  status                  "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "providerTransactionRef" TEXT,
  "paidAt"                TIMESTAMPTZ,
  "failureReason"         TEXT,
  "createdAt"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_status ON "Payment"(status);

CREATE TABLE "Refund" (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "paymentId"   UUID          NOT NULL REFERENCES "Payment"(id) ON DELETE CASCADE,
  "orderId"     UUID          NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,
  reason        TEXT          NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'PROCESSED',
  "processedAt" TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refund_payment ON "Refund"("paymentId");

CREATE TABLE "CommissionRecord" (
  id                     UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId"              UUID          UNIQUE NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "farmerId"             UUID          NOT NULL REFERENCES "FarmerProfile"(id),
  "grossSubtotal"        NUMERIC(12,2) NOT NULL,
  "commissionRatePercent" NUMERIC(5,2) NOT NULL,
  "commissionAmount"     NUMERIC(10,2) NOT NULL,
  "netFarmerPayout"      NUMERIC(12,2) NOT NULL,
  status                 VARCHAR(20)   NOT NULL DEFAULT 'ACCRUED',
  "createdAt"            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commission_farmer ON "CommissionRecord"("farmerId");
CREATE INDEX idx_commission_status ON "CommissionRecord"(status);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE "SubscriptionPlan" (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  VARCHAR(255)  NOT NULL,
  slug                  VARCHAR(100)  UNIQUE NOT NULL,
  tier                  VARCHAR(50)   NOT NULL,
  "monthlyPrice"        NUMERIC(10,2) NOT NULL,
  "maxOrdersPerMonth"   INTEGER       NOT NULL DEFAULT 9999,
  "hasPriorityDelivery" BOOLEAN       NOT NULL DEFAULT TRUE,
  "hasDedicatedSupport" BOOLEAN       NOT NULL DEFAULT FALSE,
  "isActive"            BOOLEAN       NOT NULL DEFAULT TRUE,
  "createdAt"           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE "BusinessSubscription" (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "businessId"  UUID          NOT NULL REFERENCES "BusinessProfile"(id) ON DELETE CASCADE,
  "planId"      UUID          NOT NULL REFERENCES "SubscriptionPlan"(id),
  "startDate"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "endDate"     TIMESTAMPTZ   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
  "autoRenew"   BOOLEAN       NOT NULL DEFAULT TRUE,
  "amountPaid"  NUMERIC(10,2) NOT NULL,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_business ON "BusinessSubscription"("businessId");
CREATE INDEX idx_subscription_status   ON "BusinessSubscription"(status);

-- ============================================================
-- FEATURED LISTINGS
-- ============================================================

CREATE TABLE "FeaturedListing" (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  "produceId" UUID          UNIQUE NOT NULL REFERENCES "ProduceListing"(id) ON DELETE CASCADE,
  "farmerId"  UUID          NOT NULL REFERENCES "FarmerProfile"(id) ON DELETE CASCADE,
  "feePaid"   NUMERIC(10,2) NOT NULL,
  "startDate" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "endDate"   TIMESTAMPTZ   NOT NULL,
  "isActive"  BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_featured_active ON "FeaturedListing"("isActive");

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE "Review" (
  id          UUID     PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId"   UUID     UNIQUE NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "farmerId"  UUID     NOT NULL REFERENCES "FarmerProfile"(id) ON DELETE CASCADE,
  "buyerId"   UUID     NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  rating      INTEGER  NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  "isPublic"  BOOLEAN  NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_farmer ON "Review"("farmerId");

-- ============================================================
-- NOTIFICATIONS & SUPPORT
-- ============================================================

CREATE TABLE "Notification" (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"    UUID        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  type        VARCHAR(50) NOT NULL,
  "isRead"    BOOLEAN     NOT NULL DEFAULT FALSE,
  "linkUrl"   TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_user   ON "Notification"("userId");
CREATE INDEX idx_notification_unread ON "Notification"("isRead");

CREATE TABLE "SupportTicket" (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"          UUID        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  subject           TEXT        NOT NULL,
  category          VARCHAR(50) NOT NULL,
  message           TEXT        NOT NULL,
  priority          VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  status            VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  "resolutionNotes" TEXT,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_user   ON "SupportTicket"("userId");
CREATE INDEX idx_ticket_status ON "SupportTicket"(status);

CREATE TABLE "VerificationRequest" (
  id             UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"       UUID                NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  role           "Role"              NOT NULL,
  "documentType" VARCHAR(50)         NOT NULL,
  "documentUrl"  TEXT                NOT NULL,
  status         "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  "adminNotes"   TEXT,
  "reviewedAt"   TIMESTAMPTZ,
  "createdAt"    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_user   ON "VerificationRequest"("userId");
CREATE INDEX idx_verification_status ON "VerificationRequest"(status);

-- ============================================================
-- PLATFORM SETTINGS & AUDIT LOGS
-- ============================================================

CREATE TABLE "PlatformSettings" (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         VARCHAR(100) UNIQUE NOT NULL,
  value       TEXT        NOT NULL,
  description TEXT,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default platform settings
INSERT INTO "PlatformSettings" (key, value, description, "updatedAt") VALUES
  ('commission_rate_percent', '3.0', 'Platform commission % on produce subtotal', NOW()),
  ('logistics_base_fee', '250.0', 'Base logistics charge for K2K transport (INR)', NOW()),
  ('logistics_per_km_fee', '12.0', 'Per-km logistics fee (INR)', NOW()),
  ('default_buyer_subscription_price', '499.0', 'Monthly subscription fee for commercial buyers (INR)', NOW());

CREATE TABLE "AuditLog" (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId"     UUID        REFERENCES "User"(id) ON DELETE SET NULL,
  action       VARCHAR(100) NOT NULL,
  "entityType" VARCHAR(50) NOT NULL,
  "entityId"   TEXT,
  "detailsJson" TEXT,
  "ipAddress"  VARCHAR(45),
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_action  ON "AuditLog"(action);
CREATE INDEX idx_audit_entity  ON "AuditLog"("entityType");
CREATE INDEX idx_audit_created ON "AuditLog"("createdAt");

-- ============================================================
-- UPDATED-AT TRIGGER (auto-update updatedAt columns)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at           BEFORE UPDATE ON "User"                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_farmer_updated_at         BEFORE UPDATE ON "FarmerProfile"           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_updated_at       BEFORE UPDATE ON "BusinessProfile"         FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_updated_at      BEFORE UPDATE ON "TransportPartnerProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produce_updated_at        BEFORE UPDATE ON "ProduceListing"          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at           BEFORE UPDATE ON "Cart"                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_updated_at          BEFORE UPDATE ON "Order"                   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_updated_at       BEFORE UPDATE ON "Delivery"                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_updated_at        BEFORE UPDATE ON "Payment"                 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at       BEFORE UPDATE ON "PlatformSettings"        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_updated_at        BEFORE UPDATE ON "SupportTicket"           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
