import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminVerificationsClient from "./AdminVerificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/verifications");
  }

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["FARMER", "BUYER", "TRANSPORT_PARTNER"] },
    },
    include: {
      farmerProfile: true,
      businessProfile: true,
      transportPartnerProfile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Stakeholder KYC & Land Accreditation Queue</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Validate Maharashtra 7/12 land registry extracts for farmers and GSTIN certificates for commercial kitchens.
          </p>
        </div>

        <AdminVerificationsClient
          initialUsers={users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            isVerified: u.isVerified,
            createdAt: u.createdAt.toISOString(),
            details:
              u.role === "FARMER" && u.farmerProfile
                ? {
                    farmName: u.farmerProfile.farmName,
                    location: `${u.farmerProfile.village}, ${u.farmerProfile.taluka}, ${u.farmerProfile.district}`,
                    verificationStatus: u.farmerProfile.verificationStatus,
                    notes: u.farmerProfile.verificationNotes,
                  }
                : u.role === "BUYER" && u.businessProfile
                ? {
                    businessName: u.businessProfile.businessName,
                    businessType: u.businessProfile.businessType,
                    gstin: u.businessProfile.gstin,
                    city: u.businessProfile.city,
                    verificationStatus: u.businessProfile.verificationStatus,
                  }
                : u.role === "TRANSPORT_PARTNER" && u.transportPartnerProfile
                ? {
                    vehicleNumber: u.transportPartnerProfile.vehicleNumber,
                    vehicleType: u.transportPartnerProfile.vehicleType,
                    licenseNo: u.transportPartnerProfile.drivingLicenseNo,
                    verificationStatus: u.transportPartnerProfile.verificationStatus,
                  }
                : null,
          }))}
        />
      </div>
    </div>
  );
}
