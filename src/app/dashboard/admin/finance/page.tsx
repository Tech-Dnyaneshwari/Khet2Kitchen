import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminFinanceClient from "./AdminFinanceClient";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/finance");
  }

  const settings = await prisma.platformSettings.findMany();
  const getVal = (key: string, def: string) => settings.find((s) => s.key === key)?.value || def;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/dashboard/admin" className="hover:underline">Admin Console</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Monetization & Fee Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Platform Commission & Logistics Fee Rules</h1>
        </div>

        <AdminFinanceClient
          initialCommissionRate={getVal("commission_rate_percent", "3.0")}
          initialBaseDeliveryFee={getVal("logistics_base_fee", "250")}
          initialPerKmFee={getVal("logistics_per_km_fee", "12")}
        />
      </div>
    </div>
  );
}
