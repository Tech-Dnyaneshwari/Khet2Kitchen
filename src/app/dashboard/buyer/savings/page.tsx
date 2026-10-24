import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import SavingsCalculator from "@/components/buyer/SavingsCalculator";
import { TrendingUp, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuyerSavingsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "BUYER") {
    redirect("/login?returnUrl=/dashboard/buyer/savings");
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: session.userId, status: "DELIVERED" },
    select: { subtotal: true, totalAmount: true },
  });

  const totalProcured = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const realizedSavings = Math.round(totalProcured * 0.16);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/dashboard/buyer" className="hover:underline">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">Cost Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Direct Sourcing Calculator</h1>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Your Realized Savings</span>
            <span className="text-emerald-700 font-black text-lg">₹{realizedSavings.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <SavingsCalculator />
      </div>
    </div>
  );
}
