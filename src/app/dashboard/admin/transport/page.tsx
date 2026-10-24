import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminTransportClient from "./AdminTransportClient";

export const dynamic = "force-dynamic";

export default async function AdminTransportPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/transport");
  }

  // Fetch deliveries that need assignment or are active
  const deliveries = await prisma.delivery.findMany({
    where: {
      status: { in: ["REQUESTED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT"] },
    },
    include: {
      order: {
        include: {
          farmer: true,
          buyer: { include: { businessProfile: true } },
          items: true,
        },
      },
      transportPartner: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Available transport partners
  const partners = await prisma.transportPartnerProfile.findMany({
    where: { isVerified: true, isAvailable: true },
    include: { user: true },
    orderBy: { rating: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/dashboard/admin" className="hover:underline">Admin Console</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Transport Assignment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Logistics & Transport Assignment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manually assign transport partners to unassigned deliveries.
          </p>
        </div>

        <AdminTransportClient
          deliveries={deliveries.map((d) => ({
            id: d.id,
            orderId: d.orderId,
            orderNumber: d.order.orderNumber,
            status: d.status,
            pickupAddress: d.pickupAddress,
            deliveryAddress: d.deliveryAddress,
            estimatedDistanceKm: d.estimatedDistanceKm,
            totalFee: d.totalFee,
            transportPartnerId: d.transportPartnerId || null,
            partnerName: d.transportPartner?.user?.name || null,
            vehicleNumber: d.transportPartner?.vehicleNumber || null,
            farmName: d.order.farmer.farmName,
            buyerName: d.order.buyer.businessProfile?.businessName || d.order.buyer.name,
            createdAt: d.createdAt.toISOString(),
          }))}
          partners={partners.map((p) => ({
            id: p.id,
            name: p.user.name,
            vehicleType: p.vehicleType,
            vehicleNumber: p.vehicleNumber,
            maxPayloadKg: p.maxPayloadKg,
            rating: p.rating,
            totalTrips: p.totalTrips,
          }))}
        />
      </div>
    </div>
  );
}
