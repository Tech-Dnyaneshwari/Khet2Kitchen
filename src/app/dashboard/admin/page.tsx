import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Package,
  ShoppingBag,
  IndianRupee,
  Sliders,
  HelpCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  Truck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin");
  }

  // Aggregate platform stats
  const [
    totalUsersCount,
    farmersCount,
    buyersCount,
    transportCount,
    orders,
    deliveries,
    pendingVerifications,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.farmerProfile.count(),
    prisma.businessProfile.count(),
    prisma.transportPartnerProfile.count(),
    prisma.order.findMany({ select: { subtotal: true, platformCommission: true, totalAmount: true, status: true } }),
    prisma.delivery.findMany({ select: { platformLogisticsMargin: true, totalFee: true } }),
    prisma.user.count({ where: { isVerified: false, role: { in: ["FARMER", "BUYER", "TRANSPORT_PARTNER"] } } }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true } } },
    }),
  ]);

  const gmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const platformCommissionRevenue = orders.reduce((sum, o) => sum + o.platformCommission, 0);
  const logisticsMarginRevenue = deliveries.reduce((sum, d) => sum + d.platformLogisticsMargin, 0);
  const totalPlatformGrossRevenue = platformCommissionRevenue + logisticsMarginRevenue;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Platform Operations Console
                </span>
                <span className="text-xs text-slate-400">Master Administrator Authority</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Khet2Kitchen Governance Center</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Active corridors: Pune, Junnar, Khed, Otur, Nashik • Real-time marketplace clearing house
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/admin/verifications"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow flex items-center gap-1.5"
              >
                <span>{pendingVerifications} Pending KYC Accreditations</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Primary Financial & Volume Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">GMV (Gross Merchandise Value)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{gmv.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Total transacted order volume</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Platform Net Revenue</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              ₹{totalPlatformGrossRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
              ₹{platformCommissionRevenue.toFixed(0)} comm + ₹{logisticsMarginRevenue.toFixed(0)} logistics
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Platform Registered Users</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalUsersCount}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {farmersCount} Farmers • {buyersCount} Kitchens • {transportCount} Drivers
            </span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Orders Processed</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Across farm corridors</span>
          </div>
        </div>

        {/* Admin Navigation Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8 text-xs font-bold">
          <Link
            href="/dashboard/admin/verifications"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <span>KYC Approvals ({pendingVerifications})</span>
          </Link>

          <Link
            href="/dashboard/admin/users"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <Users className="h-5 w-5 text-emerald-600" />
            <span>User Accounts</span>
          </Link>

          <Link
            href="/dashboard/admin/products"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <Package className="h-5 w-5 text-blue-600" />
            <span>Catalog Moderation</span>
          </Link>

          <Link
            href="/dashboard/admin/orders"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            <span>Orders Control</span>
          </Link>

          <Link
            href="/dashboard/admin/finance"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <Sliders className="h-5 w-5 text-emerald-700" />
            <span>Fee Settings</span>
          </Link>

          <Link
            href="/dashboard/admin/support"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <HelpCircle className="h-5 w-5 text-purple-600" />
            <span>Support Desk</span>
          </Link>

          <Link
            href="/dashboard/admin/transport"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <Truck className="h-5 w-5 text-blue-600" />
            <span>Transport Assignment</span>
          </Link>

          <Link
            href="/dashboard/admin/audit-logs"
            className="p-4 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-2 text-slate-800 transition-colors"
          >
            <FileText className="h-5 w-5 text-slate-600" />
            <span>Audit Trail</span>
          </Link>
        </div>

        {/* Recent Audit Events */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & Operational Audit Log</h3>
              <p className="text-xs text-slate-500">Immutable ledger of platform verification, order states, and settings</p>
            </div>
            <Link
              href="/dashboard/admin/audit-logs"
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              View Full Logs →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-slate-500">Target: {log.entityType} ({log.entityId?.slice(0, 8) || "N/A"})</span>
                  </div>
                  {log.detailsJson && (
                    <p className="text-slate-600 mt-1 font-mono text-[11px] truncate max-w-xl">
                      {log.detailsJson}
                    </p>
                  )}
                </div>

                <div className="text-right text-slate-400 text-[11px]">
                  <span>{log.user ? `${log.user.name} (${log.user.role})` : "System Engine"}</span>
                  <span className="block mt-0.5">{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
