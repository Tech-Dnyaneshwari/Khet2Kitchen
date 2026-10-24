import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransportDeliveriesClient from "./TransportDeliveriesClient";

export const dynamic = "force-dynamic";

export default async function TransportDeliveriesPage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "TRANSPORT_PARTNER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/transport/deliveries");
  }

  const profile = await prisma.transportPartnerProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile) {
    redirect("/login");
  }

  const deliveries = await prisma.delivery.findMany({
    where: { transportPartnerId: profile.id },
    include: {
      order: {
        include: {
          farmer: { include: { user: true } },
          buyer: { include: { businessProfile: true } },
          items: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Agri Logistics & Gate Dispatch</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track farm pickups, update transit telemetry, and execute kitchen gate OTP handovers.
          </p>
        </div>

        <TransportDeliveriesClient
          deliveries={deliveries.map((d) => ({
            id: d.id,
            orderId: d.orderId,
            orderNumber: d.order.orderNumber,
            status: d.status,
            pickupAddress: d.pickupAddress,
            deliveryAddress: d.deliveryAddress,
            estimatedDistanceKm: d.estimatedDistanceKm,
            totalFee: d.totalFee,
            driverPayout: d.driverPayout,
            preferredTimeSlot: d.order.preferredTimeSlot,
            qrPasscode: d.order.qrPasscode,
            farmerName: d.order.farmer.user.name,
            farmName: d.order.farmer.farmName,
            farmerPhone: d.order.farmer.user.phone,
            buyerName: d.order.buyer.name,
            buyerBusiness: d.order.buyer.businessProfile?.businessName || d.order.buyer.name,
            buyerPhone: d.order.buyer.phone,
            items: d.order.items.map((i) => ({
              id: i.id,
              productName: i.productName,
              quantity: i.quantity,
              unit: i.unit,
            })),
          }))}
        />
      </div>
    </div>
  );
}
