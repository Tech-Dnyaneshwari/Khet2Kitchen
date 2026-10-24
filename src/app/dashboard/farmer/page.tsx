import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sprout,
  ShieldCheck,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FarmerDashboardPage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "FARMER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/farmer");
  }

  // Get farmer profile
  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      user: true,
      listings: {
        include: { category: true, images: true },
        orderBy: { createdAt: "desc" },
      },
      ordersReceived: {
        include: { buyer: true, items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!farmerProfile) {
    redirect("/login");
  }

  const listings = farmerProfile.listings;
  const orders = farmerProfile.ordersReceived;

  const totalSales = orders
    .filter((o) => !["CANCELLED", "REJECTED_BY_FARMER"].includes(o.status))
    .reduce((acc, o) => acc + o.subtotal, 0);

  // Mandi commission saved: traditional brokers take 8% to 12% + hamali. K2K is 3%
  const commissionSaved = Math.round(totalSales * 0.07);

  const pendingOrders = orders.filter((o) => o.status === "PENDING_FARMER_CONFIRMATION");
  const activeOrders = orders.filter((o) => ["ACCEPTED", "PREPARING", "READY_FOR_PICKUP"].includes(o.status));

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Farm Header Banner */}
        <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-300 bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                  Kisan Producer Portal
                </span>
                {farmerProfile.isVerified ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-700/60 px-2 py-0.5 rounded border border-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> 7/12 Land Extract Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-200 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700">
                    Verification In Review
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {farmerProfile.farmName}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                Farmer: <strong>{farmerProfile.user.name}</strong> • {farmerProfile.village}, Taluka {farmerProfile.taluka}, District {farmerProfile.district}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/farmer/produce"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow"
              >
                <PlusCircle className="h-4 w-4" /> Add Produce Listing
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Gross Farm Sales</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{totalSales.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">From {orders.length} direct kitchen orders</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Mandi Middleman Saved</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹{commissionSaved.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">~7% saved vs traditional APMC cut</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Pending Kitchen Orders</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingOrders.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Awaiting your acceptance</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Active Produce Listed</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {listings.filter((l) => l.status === "ACTIVE").length}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Visible in marketplace</span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link
            href="/dashboard/farmer/orders"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span>Incoming Orders ({orders.length})</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/farmer/produce"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <span>Produce Inventory ({listings.length})</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/farmer/earnings"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              <span>Payouts & Bank Settlement</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/farmer/profile"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-emerald-600" />
              <span>Farm Profile & 7/12</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>

        {/* Incoming Orders Alert Section */}
        {pendingOrders.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-700" />
                  <span>Immediate Action: {pendingOrders.length} Pending Order{pendingOrders.length > 1 ? "s" : ""}</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Restaurants are waiting for your acceptance before scheduled evening harvesting.
                </p>
              </div>

              <Link
                href="/dashboard/farmer/orders"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Review & Accept Orders →
              </Link>
            </div>

            <div className="divide-y divide-amber-200/60 bg-white rounded-xl border border-amber-200 overflow-hidden">
              {pendingOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                    <span className="text-slate-500 ml-2">Buyer: {order.buyer.name}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.items.map((i) => (
                        <span key={i.id} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                          {i.productName} ({i.quantity} {i.unit})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="font-black text-slate-900 text-sm">₹{order.subtotal.toFixed(0)}</span>
                    <Link
                      href="/dashboard/farmer/orders"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                    >
                      Respond
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Active Produce Listed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Harvested & Available Crops</h3>
              <p className="text-xs text-slate-500">Live prices and available stock visible to commercial buyers</p>
            </div>
            <Link
              href="/dashboard/farmer/produce"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              Manage All Listings ({listings.length}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {listings.slice(0, 4).map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0]?.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                        {item.qualityGrade.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span className="text-slate-500 block mt-0.5">
                      Category: {item.category.name} • Harvested: {item.harvestDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Stock Available</span>
                    <span className="font-bold text-slate-800 text-sm">{item.availableStockKg} {item.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Farm Gate Price</span>
                    <span className="font-black text-emerald-700 text-sm">₹{item.pricePerUnit}/{item.unit}</span>
                  </div>

                  <Link
                    href="/dashboard/farmer/produce"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
