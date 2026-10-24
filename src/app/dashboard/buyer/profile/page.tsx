import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import BuyerProfileClient from "./BuyerProfileClient";

export const dynamic = "force-dynamic";

export default async function BuyerProfilePage() {
  const session = await getSessionUser();
  if (!session || session.role !== "BUYER") {
    redirect("/login?returnUrl=/dashboard/buyer/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      businessProfile: true,
      addresses: true,
    },
  });

  if (!user || !user.businessProfile) {
    redirect("/dashboard/buyer");
  }

  const profile = user.businessProfile;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/dashboard/buyer" className="hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Profile & Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Commercial Kitchen Accreditation
          </h1>
        </div>

        <BuyerProfileClient
          initialProfile={{
            name: user.name,
            email: user.email,
            phone: user.phone,
            businessName: profile.businessName,
            businessType: profile.businessType,
            contactPerson: profile.contactPerson,
            gstin: profile.gstin || "",
            city: profile.city,
            district: profile.district,
            state: profile.state,
            pinCode: profile.pinCode,
            isVerified: profile.isVerified,
            verificationStatus: profile.verificationStatus,
            monthlyProcurementSpent: profile.monthlyProcurementSpent,
          }}
          addresses={user.addresses.map((a) => ({
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
