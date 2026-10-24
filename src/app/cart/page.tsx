import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import CartClient from "./CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?returnUrl=/cart");
  }

  // Get buyer's cart
  const cart = await prisma.cart.findUnique({
    where: { buyerId: session.userId },
    include: {
      items: {
        include: {
          produce: {
            include: {
              farmer: {
                include: {
                  user: { select: { name: true, phone: true } },
                },
              },
              images: true,
            },
          },
        },
      },
    },
  });

  // Get buyer's saved addresses
  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Commercial Procurement Cart</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Review your direct farm orders, select delivery windows, and inspect transparent pricing.
          </p>
        </div>

        <CartClient
          initialItems={
            cart?.items.map((item) => ({
              id: item.id,
              produceId: item.produceId,
              productName: item.produce.name,
              qualityGrade: item.produce.qualityGrade,
              unit: item.produce.unit,
              unitPrice: item.produce.pricePerUnit,
              quantityKg: item.quantityKg,
              availableStockKg: item.produce.availableStockKg,
              minOrderQuantityKg: item.produce.minOrderQuantityKg,
              imageUrl: item.produce.images[0]?.imageUrl || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80",
              farmName: item.produce.farmer.farmName,
              farmerName: item.produce.farmer.user.name,
              farmerLocation: `${item.produce.farmer.village}, ${item.produce.farmer.district}`,
            })) || []
          }
          savedAddresses={addresses.map((a) => ({
            id: a.id,
            label: a.label,
            street: a.street,
            city: a.city,
            district: a.district,
            pinCode: a.pinCode,
            isDefault: a.isDefault,
          }))}
        />
      </div>
    </div>
  );
}
