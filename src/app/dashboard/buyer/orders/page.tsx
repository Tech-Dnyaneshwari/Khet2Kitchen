import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowRight, ShieldCheck, ChevronRight, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuyerOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "BUYER") {
    redirect("/login?returnUrl=/dashboard/buyer/orders");
  }

  const statusFilter = searchParams.status;
  const whereClause: any = { buyerId: session.userId };
  if (statusFilter && statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      farmer: { include: { user: true } },
      items: true,
      delivery: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/dashboard/buyer" className="hover:underline">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">Commercial Orders</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Procurement Orders History</h1>
          </div>

          <Link
            href="/explore"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs sm:text-sm self-start sm:self-auto shadow"
          >
            + New Bulk Order
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs font-semibold">
          <Link
            href="/dashboard/buyer/orders"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              !statusFilter || statusFilter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Orders ({orders.length})
          </Link>
          <Link
            href="/dashboard/buyer/orders?status=PENDING_FARMER_CONFIRMATION"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === "PENDING_FARMER_CONFIRMATION"
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Awaiting Confirmation
          </Link>
          <Link
            href="/dashboard/buyer/orders?status=IN_TRANSIT"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === "IN_TRANSIT"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            In Transit
          </Link>
          <Link
            href="/dashboard/buyer/orders?status=DELIVERED"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              statusFilter === "DELIVERED"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Delivered
          </Link>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <PackageCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">No orders found in this category.</p>
              <Link href="/explore" className="text-emerald-700 text-xs font-bold hover:underline mt-2 inline-block">
                Start a direct farm procurement →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((order) => {
                const isDelivered = order.status === "DELIVERED";
                const isPending = order.status === "PENDING_FARMER_CONFIRMATION";
                const isCancelled = ["CANCELLED", "REJECTED_BY_FARMER"].includes(order.status);

                return (
                  <div key={order.id} className="p-4 sm:p-6 hover:bg-slate-50/60 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              isDelivered
                                ? "bg-emerald-100 text-emerald-800"
                                : isCancelled
                                ? "bg-rose-100 text-rose-800"
                                : isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-600">
                          Farm: <strong className="text-slate-800">{order.farmer.farmName}</strong> ({order.farmer.village}, {order.farmer.district})
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {order.items.map((i) => (
                            <span key={i.id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {i.productName} ({i.quantity} {i.unit})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">Total Amount</span>
                          <span className="font-black text-slate-900 text-sm">₹{order.totalAmount.toFixed(0)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/buyer/orders/${order.id}`}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            Track & Details
                          </Link>
                          <Link
                            href={`/dashboard/buyer/orders/${order.id}/invoice`}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            title="View GST Invoice"
                          >
                            <FileText className="h-3.5 w-3.5" /> Invoice
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
