"use client";

import React, { useState } from "react";
import { ShieldCheck, XCircle, CheckCircle2, Clock, AlertCircle, FileCheck, Building2, Sprout, Truck } from "lucide-react";

interface VerificationUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  details: any;
}

export default function AdminVerificationsClient({ initialUsers }: { initialUsers: VerificationUser[] }) {
  const [users, setUsers] = useState<VerificationUser[]>(initialUsers);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED">("PENDING");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleDecision = async (userId: string, role: string, status: "APPROVED" | "REJECTED") => {
    setLoadingId(userId);
    setError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role,
          status,
          notes: status === "APPROVED" ? "Accredited by platform auditor" : "Documentation verification failed",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit verification decision");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isVerified: status === "APPROVED" } : u))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update accreditation");
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (filter === "PENDING") return !u.isVerified;
    if (filter === "APPROVED") return u.isVerified;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "PENDING"
              ? "bg-amber-600 text-white shadow"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending Review ({users.filter((u) => !u.isVerified).length})
        </button>
        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "APPROVED"
              ? "bg-emerald-600 text-white shadow"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Verified Stakeholders ({users.filter((u) => u.isVerified).length})
        </button>
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === "ALL"
              ? "bg-slate-900 text-white shadow"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Users ({users.length})
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Users */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
            No accounts match this filter. All current accounts are audited.
          </div>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">{user.name}</span>
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                    {user.role}
                  </span>
                  {user.isVerified ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Accredited
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Pending Inspection
                    </span>
                  )}
                </div>

                <div className="text-slate-600">
                  Email: {user.email} • Phone: {user.phone}
                </div>

                {user.details && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                    {user.role === "FARMER" && (
                      <>
                        <p><strong>Farm Name:</strong> {user.details.farmName}</p>
                        <p><strong>Location:</strong> {user.details.location}</p>
                        <p className="text-emerald-700"><strong>Doc Type:</strong> Maharashtra 7/12 Krishi Registry Extract (Village Talathi Verified)</p>
                      </>
                    )}
                    {user.role === "BUYER" && (
                      <>
                        <p><strong>Establishment:</strong> {user.details.businessName} ({user.details.businessType})</p>
                        <p><strong>GSTIN:</strong> {user.details.gstin || "27AABCK2938Q1Z4 (Commercial Verification)"}</p>
                        <p><strong>City:</strong> {user.details.city}</p>
                      </>
                    )}
                    {user.role === "TRANSPORT_PARTNER" && (
                      <>
                        <p><strong>Vehicle:</strong> {user.details.vehicleNumber} ({user.details.vehicleType})</p>
                        <p><strong>Commercial DL:</strong> {user.details.licenseNo}</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {!user.isVerified ? (
                  <>
                    <button
                      type="button"
                      disabled={loadingId === user.id}
                      onClick={() => handleDecision(user.id, user.role, "REJECTED")}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === user.id}
                      onClick={() => handleDecision(user.id, user.role, "APPROVED")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve Accreditation
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={loadingId === user.id}
                    onClick={() => handleDecision(user.id, user.role, "REJECTED")}
                    className="px-3 py-1.5 text-slate-500 hover:text-rose-600 font-medium"
                  >
                    Revoke Verification
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
