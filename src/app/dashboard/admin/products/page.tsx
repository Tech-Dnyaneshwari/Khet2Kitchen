import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShieldCheck, MapPin, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/products");
  }

  const listings = await prisma.produceListing.findMany({
    include: {
      category: true,
      images: true,
      farmer: { include: { user: true } },
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
              <span className="text-slate-900 font-bold">Catalog Moderation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Marketplace Produce Moderation</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 flex justify-between">
            <span>ALL ACTIVE & PAUSED FARM LOTS ({listings.length})</span>
          </div>

          <div className="divide-y divide-slate-100">
            {listings.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0]?.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{item.name}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {item.qualityGrade.replace("_", " ")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          item.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-slate-500 mt-1">
                      Grower: <strong>{item.farmer.user.name}</strong> ({item.farmer.farmName}) • {item.farmer.village}, {item.farmer.district}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Harvest: {item.harvestDate} • Min Order: {item.minOrderQuantityKg} {item.unit}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Available Stock</span>
                    <span className="font-bold text-slate-800 text-sm">{item.availableStockKg} {item.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Farm Gate Price</span>
                    <span className="font-black text-emerald-700 text-sm">₹{item.pricePerUnit}/{item.unit}</span>
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
