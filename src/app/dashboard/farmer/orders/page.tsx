import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import FarmerOrdersClient from "./FarmerOrdersClient";

export const dynamic = "force-dynamic";

export default async function FarmerOrdersPage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "FARMER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/farmer/orders");
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!farmerProfile) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { farmerId: farmerProfile.id },
    include: {
      buyer: { include: { businessProfile: true } },
      items: true,
      delivery: { include: { transportPartner: { include: { user: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Commercial Kitchen Orders</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Accept bulk demand from restaurants, update harvest crating status, and coordinate farm-gate fleet dispatch.
          </p>
        </div>

        <FarmerOrdersClient
          orders={orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            invoiceNumber: o.invoiceNumber,
            status: o.status,
            createdAt: o.createdAt.toISOString(),
            subtotal: o.subtotal,
            platformCommission: o.platformCommission,
            netFarmerPayout: o.subtotal - o.platformCommission,
            fulfillmentType: o.fulfillmentType,
            preferredDeliveryDate: o.preferredDeliveryDate,
            preferredTimeSlot: o.preferredTimeSlot,
            qrPasscode: o.qrPasscode,
            cancellationReason: o.cancellationReason,
            rejectionReason: o.rejectionReason,
            buyerName: o.buyer.name,
            businessName: o.buyer.businessProfile?.businessName || o.buyer.name,
            buyerPhone: o.buyer.phone,
            buyerCity: o.buyer.businessProfile?.city || "Pune",
            items: o.items.map((i) => ({
              id: i.id,
              productName: i.productName,
              qualityGrade: i.qualityGrade,
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.unitPrice,
              subtotal: i.subtotal,
            })),
            delivery: o.delivery
              ? {
                  id: o.delivery.id,
                  status: o.delivery.status,
                  driverName: o.delivery.transportPartner?.user.name,
                  vehicleNumber: o.delivery.transportPartner?.vehicleNumber,
                  driverPhone: o.delivery.transportPartner?.user.phone,
                }
              : null,
          }))}
        />
      </div>
    </div>
  );
}
