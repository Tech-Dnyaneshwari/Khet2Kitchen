import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingDown,
  Clock,
  ShieldCheck,
  ArrowRight,
  Truck,
  FileText,
  Calculator,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuyerDashboardPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "BUYER") {
    redirect("/login?returnUrl=/dashboard/buyer");
  }

  // Fetch business profile
  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.userId },
  });

  // Fetch orders
  const orders = await prisma.order.findMany({
    where: { buyerId: session.userId },
    include: {
      farmer: { include: { user: true } },
      items: true,
      delivery: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSpent = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED", "REJECTED_BY_FARMER"].includes(o.status)
  );

  // Middleman saved: approx 15% estimated savings vs conventional APMC markup
  const estimatedSavings = Math.round(totalSpent * 0.16);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Commercial Kitchen Portal
                </span>
                {profile?.isVerified ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    <ShieldCheck className="h-3.5 w-3.5" /> GST Verified
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Accreditation Pending
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {profile?.businessName || session.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {profile?.businessType || "RESTAURANT"} • {profile?.city || "Pune"}, Maharashtra • Sourcing direct from verified regional farms
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/explore"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow"
              >
                Procure Produce <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Procurement Spent</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{totalSpent.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Across {orders.length} farm orders</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Broker Commission Saved</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹{estimatedSavings.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">~16% vs APMC Mandi Retail</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Active In-Flight Orders</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{activeOrders.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Scheduled for kitchen delivery</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Verified Farm Partners</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {new Set(orders.map((o) => o.farmerId)).size}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Direct grower relationships</span>
          </div>
        </div>

        {/* Quick Hub Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link
            href="/dashboard/buyer/orders"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span>All Orders ({orders.length})</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/buyer/savings"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-600" />
              <span>Savings Calculator</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/buyer/compare"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
              <span>Compare Farm Lots</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>

          <Link
            href="/dashboard/buyer/profile"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Business Profile & KYC</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Link>
        </div>

        {/* Active Orders Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active & Scheduled Dispatches</h3>
              <p className="text-xs text-slate-500">Live order status progression from farm harvest to kitchen gate</p>
            </div>
            <Link
              href="/dashboard/buyer/orders"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              View Order History →
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No orders are currently in transit. Explore the farm catalog to place tomorrow's procurement order.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeOrders.map((order) => (
                <div key={order.id} className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Farm: <strong>{order.farmer.farmName}</strong> ({order.farmer.village}, {order.farmer.district})
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {order.items.map((i) => (
                        <span key={i.id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {i.productName} ({i.quantity} {i.unit})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Gate Passcode</span>
                      <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {order.qrPasscode}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total</span>
                      <span className="font-black text-slate-900 text-sm">₹{order.totalAmount.toFixed(0)}</span>
                    </div>

                    <Link
                      href={`/dashboard/buyer/orders/${order.id}`}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Track Order
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
