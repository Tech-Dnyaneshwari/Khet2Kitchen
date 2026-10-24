import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CompareClient from "./CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const session = await getSessionUser();
  if (!session || session.role !== "BUYER") {
    redirect("/login?returnUrl=/dashboard/buyer/compare");
  }

  const listings = await prisma.produceListing.findMany({
    where: { status: "ACTIVE" },
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
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Compare Farm Lots Side-by-Side</h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Evaluate quality grade, pricing per kg, minimum order quantity, and farm origin across multiple grower listings.
          </p>
        </div>

        <CompareClient
          listings={listings.map((l) => ({
            id: l.id,
            name: l.name,
            category: l.category.name,
            qualityGrade: l.qualityGrade,
            unit: l.unit,
            pricePerUnit: l.pricePerUnit,
            availableStockKg: l.availableStockKg,
            minOrderQuantityKg: l.minOrderQuantityKg,
            harvestDate: l.harvestDate,
            availabilityDate: l.availabilityDate,
            farmName: l.farmer.farmName,
            farmerLocation: `${l.farmer.village}, ${l.farmer.district}`,
            farmerRating: l.farmer.rating,
            imageUrl: l.images[0]?.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
          }))}
        />
      </div>
    </div>
  );
}
