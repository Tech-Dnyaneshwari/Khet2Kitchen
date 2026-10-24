import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import FarmerProduceClient from "./FarmerProduceClient";

export const dynamic = "force-dynamic";

export default async function FarmerProducePage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "FARMER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/farmer/produce");
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!farmerProfile) {
    redirect("/login");
  }

  const listings = await prisma.produceListing.findMany({
    where: { farmerId: farmerProfile.id },
    include: {
      category: true,
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Manage Farm Produce & Inventory</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            List newly harvested crops, adjust wholesale pricing, and update available kg in real-time.
          </p>
        </div>

        <FarmerProduceClient
          farmerId={farmerProfile.id}
          initialListings={listings.map((l) => ({
            id: l.id,
            name: l.name,
            categoryId: l.categoryId,
            categoryName: l.category.name,
            description: l.description,
            qualityGrade: l.qualityGrade,
            unit: l.unit,
            pricePerUnit: l.pricePerUnit,
            availableStockKg: l.availableStockKg,
            minOrderQuantityKg: l.minOrderQuantityKg,
            harvestDate: l.harvestDate,
            availabilityDate: l.availabilityDate,
            status: l.status,
            imageUrl: l.images[0]?.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
          }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        />
      </div>
    </div>
  );
}
