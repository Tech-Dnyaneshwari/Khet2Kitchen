import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/users");
  }

  const roleFilter = searchParams.role;
  const where: any = {};
  if (roleFilter && roleFilter !== "ALL") {
    where.role = roleFilter;
  }

  const users = await prisma.user.findMany({
    where,
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/dashboard/admin" className="hover:underline">Admin Console</Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">User Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Platform User Accounts</h1>
          </div>
        </div>

        {/* Role Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs font-semibold">
          <Link
            href="/dashboard/admin/users"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              !roleFilter || roleFilter === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Stakeholders ({users.length})
          </Link>
          <Link
            href="/dashboard/admin/users?role=FARMER"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              roleFilter === "FARMER"
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Farmers
          </Link>
          <Link
            href="/dashboard/admin/users?role=BUYER"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              roleFilter === "BUYER"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Commercial Kitchens
          </Link>
          <Link
            href="/dashboard/admin/users?role=TRANSPORT_PARTNER"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              roleFilter === "TRANSPORT_PARTNER"
                ? "bg-amber-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Transport Partners
          </Link>
          <Link
            href="/dashboard/admin/users?role=ADMIN"
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              roleFilter === "ADMIN"
                ? "bg-purple-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Administrators
          </Link>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{u.name}</span>
                    <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                    {u.isVerified ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">
                        Unverified
                      </span>
                    )}
                  </div>

                  <div className="text-slate-600 mt-1 flex flex-wrap gap-4">
                    <span>Email: <strong>{u.email}</strong></span>
                    <span>Phone: <strong>{u.phone}</strong></span>
                    <span>Joined: {new Date(u.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>

                  {u.farmerProfile && (
                    <p className="text-slate-500 text-[11px] mt-1">
                      Farm: {u.farmerProfile.farmName} ({u.farmerProfile.village}, {u.farmerProfile.district})
                    </p>
                  )}
                  {u.businessProfile && (
                    <p className="text-slate-500 text-[11px] mt-1">
                      Business: {u.businessProfile.businessName} ({u.businessProfile.city}) • GSTIN: {u.businessProfile.gstin || "N/A"}
                    </p>
                  )}
                  {u.transportPartnerProfile && (
                    <p className="text-slate-500 text-[11px] mt-1">
                      Vehicle: {u.transportPartnerProfile.vehicleNumber} ({u.transportPartnerProfile.vehicleType})
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">Status: Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
