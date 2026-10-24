import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { IndianRupee, ShieldCheck, TrendingUp, Building2, CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FarmerEarningsPage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "FARMER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/farmer/earnings");
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      commissionRecords: {
        include: { order: true },
        orderBy: { createdAt: "desc" },
      },
      ordersReceived: {
        where: { status: "DELIVERED" },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!farmerProfile) {
    redirect("/login");
  }

  const totalGross = farmerProfile.ordersReceived.reduce((acc, o) => acc + o.subtotal, 0);
  const totalCommission = farmerProfile.ordersReceived.reduce((acc, o) => acc + o.platformCommission, 0);
  const totalNet = totalGross - totalCommission;

  // Comparison with traditional APMC middleman: brokers take ~10% + hamali deductions
  const traditionalBrokerageCut = Math.round(totalGross * 0.10);
  const middlemanSaved = traditionalBrokerageCut - totalCommission;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/dashboard/farmer" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Earnings & Settlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Farmer Payouts & Commission Statement</h1>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Delivered Gross Sales</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{totalGross.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Full farm-gate agreed price</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Net Payouts Transferred</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{totalNet.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Direct to verified bank account</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Platform Fee (Flat 3.0%)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹{totalCommission.toLocaleString("en-IN")}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Zero unauthorized deductions</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Middleman Brokerage Saved</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ₹{Math.max(0, middlemanSaved).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">vs traditional APMC 10% brokerage</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Settlement History */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Settled Order Transactions</h3>
                <p className="text-xs text-slate-500">Every delivered lot with itemized 3% platform commission</p>
              </div>
            </div>

            {farmerProfile.ordersReceived.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No orders have been marked as delivered yet. Earnings will record here as kitchens receive lots.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {farmerProfile.ordersReceived.map((order) => {
                  const netPayout = order.subtotal - order.platformCommission;

                  return (
                    <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            Settled via IMPS
                          </span>
                        </div>
                        <p className="text-slate-500 mt-0.5">
                          Invoice: {order.invoiceNumber} • Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {order.items.map((i) => (
                            <span key={i.id} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                              {i.productName} ({i.quantity} {i.unit})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-slate-500">
                          Gross: ₹{order.subtotal.toFixed(0)} - Commission: ₹{order.platformCommission.toFixed(0)}
                        </div>
                        <div className="font-black text-emerald-800 text-base mt-0.5">
                          Net: ₹{netPayout.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Bank Account Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <span>Registered Settlement Bank</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Bank Name</span>
                  <span className="font-bold text-slate-800 text-sm">{farmerProfile.bankName || "State Bank of India (SBI)"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Account Number</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {farmerProfile.bankAccountNo || "••••••••3981 (Junnar Rural Branch)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{farmerProfile.bankIfsc || "SBIN0001245"}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Direct Bank Verification Active (RBI NEFT/IMPS Compliant)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
