import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sprout, ShieldCheck, Star } from "lucide-react";
import FarmerProfileClient from "./FarmerProfileClient";

export const dynamic = "force-dynamic";

export default async function FarmerProfilePage() {
  const session = await getSessionUser();
  if (!session || (session.role !== "FARMER" && session.role !== "ADMIN")) {
    redirect("/login?returnUrl=/dashboard/farmer/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      farmerProfile: {
        include: {
          reviewsReceived: {
            include: { buyer: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
  });

  if (!user || !user.farmerProfile) {
    redirect("/dashboard/farmer");
  }

  const profile = user.farmerProfile;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/dashboard/farmer" className="hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Farm Profile & 7/12 Accreditation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Farm Registry & Accreditation
          </h1>
        </div>

        <FarmerProfileClient
          initialProfile={{
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            farmName: profile.farmName,
            village: profile.village,
            taluka: profile.taluka,
            district: profile.district,
            state: profile.state,
            pinCode: profile.pinCode,
            landSizeAcres: profile.landSizeAcres || 0,
            primaryCrops: profile.primaryCrops,
            bankAccountNo: profile.bankAccountNo || "",
            bankIfsc: profile.bankIfsc || "",
            bankName: profile.bankName || "",
            isVerified: profile.isVerified,
            verificationStatus: profile.verificationStatus,
            rating: profile.rating,
            reviewsCount: profile.reviewsCount,
          }}
          reviews={profile.reviewsReceived.map((r) => ({
            id: r.id,
            buyerName: r.buyer.name,
            rating: r.rating,
            comment: r.comment || "",
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
