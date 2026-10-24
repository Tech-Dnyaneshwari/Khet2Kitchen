import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IndianRupee, Truck, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TransportEarningsPage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "TRANSPORT_PARTNER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/transport/earnings");
  }

  const profile = await prisma.transportPartnerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      deliveries: {
        where: { status: "DELIVERED" },
        include: { order: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  const completed = profile.deliveries;
  const totalPayout = completed.reduce((sum, d) => sum + d.driverPayout, 0);
  const totalKm = completed.reduce((sum, d) => sum + d.estimatedDistanceKm, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/dashboard/transport" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Earnings & Mileage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Fleet Logistics Payouts</h1>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Driver Payouts Earned</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalPayout.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">85% direct revenue share</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Corridor Distance Traveled</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalKm} km</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Across {completed.length} completed deliveries</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Average Trip Earnings</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{completed.length > 0 ? (totalPayout / completed.length).toFixed(0) : "0"}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Per farm-to-kitchen trip</span>
          </div>
        </div>

        {/* Table of completed deliveries */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Trip Settlement Ledger</h3>
            <p className="text-xs text-slate-500">Every delivery validated by the kitchen's gate OTP</p>
          </div>

          {completed.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No completed runs yet. Payouts update immediately after OTP verification.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completed.map((delivery) => (
                <div key={delivery.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{delivery.order.orderNumber}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        Settled
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Distance: <strong>{delivery.estimatedDistanceKm} km</strong> • Route: {delivery.pickupAddress} → {delivery.deliveryAddress}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Freight: ₹{delivery.totalFee.toFixed(0)}</span>
                    <span className="font-black text-emerald-800 text-base">Payout: ₹{delivery.driverPayout.toFixed(0)}</span>
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
