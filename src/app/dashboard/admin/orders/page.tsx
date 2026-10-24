import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, FileText, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/orders");
  }

  const orders = await prisma.order.findMany({
    include: {
      buyer: { include: { businessProfile: true } },
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
              <Link href="/dashboard/admin" className="hover:underline">Admin Console</Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">Orders Monitoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Platform Orders Control & Clearing</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            ALL TRANSACTED ORDERS ({orders.length})
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                    <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="text-slate-600 mt-1 space-y-0.5">
                    <p>
                      <strong>Buyer:</strong> {order.buyer.businessProfile?.businessName || order.buyer.name} (Tel: {order.buyer.phone})
                    </p>
                    <p>
                      <strong>Producer Farm:</strong> {order.farmer.farmName} ({order.farmer.village}, {order.farmer.district})
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.items.map((i) => (
                        <span key={i.id} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                          {i.productName} ({i.quantity} {i.unit})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-3 lg:pt-0">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Gate OTP</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {order.qrPasscode}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Gross Total</span>
                    <span className="font-black text-slate-900 text-sm">₹{order.totalAmount.toFixed(0)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/buyer/orders/${order.id}`}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                    >
                      Track
                    </Link>
                    <Link
                      href={`/dashboard/buyer/orders/${order.id}/invoice`}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5" /> Invoice
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
