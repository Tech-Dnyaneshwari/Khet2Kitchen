import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Truck, ShieldCheck, TrendingUp, MapPin, Clock, ArrowRight, Gauge, IndianRupee } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransportDashboardPage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "TRANSPORT_PARTNER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/transport");
  }

  const profile = await prisma.transportPartnerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      deliveries: {
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
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  const deliveries = profile.deliveries;
  const completedDeliveries = deliveries.filter((d) => d.status === "DELIVERED");
  const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.driverPayout, 0);
  const activeDeliveries = deliveries.filter((d) => !["DELIVERED", "FAILED"].includes(d.status));

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Fleet Transport Driver
                </span>
                {profile.isVerified ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Commercial Permit Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                    License In Review
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold">{profile.user.name}</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Vehicle: <strong className="text-white font-mono">{profile.vehicleNumber}</strong> ({profile.vehicleType.replace(/_/g, " ")}) • Max Payload: {profile.maxPayloadKg} kg
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/transport/deliveries"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow"
              >
                <Truck className="h-4 w-4" /> View Assigned Runs
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Completed Runs</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{completedDeliveries.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Gate OTP verified</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Driver Payout Earnings</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalEarnings.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">85% logistics revenue share</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Active In-Transit Trips</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{activeDeliveries.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Requiring gate delivery</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Driver Quality Rating</span>
            <div className="text-2xl font-black text-amber-600 mt-1">★ {profile.rating.toFixed(1)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Based on on-time delivery</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard/transport/deliveries"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>All Corridor Deliveries ({deliveries.length})</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/transport/earnings"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              <span>Mileage Statements & Bank Payouts</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>

        {/* Active Runs Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Current Assigned Shipments</h3>
              <p className="text-xs text-slate-500">Scheduled morning corridors from Junnar/Khed to Pune kitchens</p>
            </div>
            <Link
              href="/dashboard/transport/deliveries"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Manage Status →
            </Link>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No shipments are currently pending. New delivery runs will appear as commercial kitchens place orders.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{delivery.order.orderNumber}</span>
                      <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {delivery.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="mt-2 text-slate-600 space-y-1">
                      <p>
                        <strong>Pickup:</strong> {delivery.pickupAddress} (Farmer: {delivery.order.farmer.user.name})
                      </p>
                      <p>
                        <strong>Destination:</strong> {delivery.deliveryAddress} (Buyer: {delivery.order.buyer.name})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Distance</span>
                      <span className="font-bold text-slate-800">{delivery.estimatedDistanceKm} km</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Driver Payout</span>
                      <span className="font-black text-emerald-800 text-sm">₹{delivery.driverPayout.toFixed(0)}</span>
                    </div>

                    <Link
                      href="/dashboard/transport/deliveries"
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                    >
                      Update Status
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
