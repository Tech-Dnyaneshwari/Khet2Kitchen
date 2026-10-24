import React from "react";
import prisma from "@/lib/prisma";
import ExploreProduceClient from "./ExploreProduceClient";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; grade?: string; sort?: string };
}) {
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const listings = await prisma.produceListing.findMany({
    where: {
      status: "ACTIVE",
      availableStockKg: { gt: 0 },
    },
    include: {
      category: true,
      images: true,
      farmer: {
        include: {
          user: {
            select: { name: true, phone: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full w-fit mb-3 border border-emerald-200">
            <span>● Live Khet2Kitchen Mandi Catalog</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-normal">Real-time harvested stock from verified farms</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Fresh Produce</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Directly procure from regional farmers in Junnar, Nashik, Khed, and Manchar with 100% price transparency.
          </p>
        </div>

        <ExploreProduceClient
          initialListings={listings.map((l) => ({
            id: l.id,
            name: l.name,
            categoryName: l.category.name,
            categorySlug: l.category.slug,
            description: l.description,
            qualityGrade: l.qualityGrade,
            unit: l.unit,
            pricePerUnit: l.pricePerUnit,
            availableStockKg: l.availableStockKg,
            minOrderQuantityKg: l.minOrderQuantityKg,
            harvestDate: l.harvestDate,
            availabilityDate: l.availabilityDate,
            imageUrl: l.images[0]?.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
            farmerName: l.farmer.user.name,
            farmName: l.farmer.farmName,
            farmerLocation: `${l.farmer.village}, ${l.farmer.taluka}, ${l.farmer.district}`,
            isFarmerVerified: l.farmer.isVerified,
            farmerRating: l.farmer.rating,
          }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          initialCategory={searchParams.category || "ALL"}
          initialSearch={searchParams.q || ""}
        />
      </div>
    </div>
  );
}
