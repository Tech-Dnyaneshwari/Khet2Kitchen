"use client";

import React, { useState } from "react";
import { Sliders, CheckCircle2, AlertCircle, Save } from "lucide-react";

interface Props {
  initialCommissionRate: string;
  initialBaseDeliveryFee: string;
  initialPerKmFee: string;
}

export default function AdminFinanceClient({
  initialCommissionRate,
  initialBaseDeliveryFee,
  initialPerKmFee,
}: Props) {
  const [commissionRate, setCommissionRate] = useState(initialCommissionRate);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(initialBaseDeliveryFee);
  const [perKmFee, setPerKmFee] = useState(initialPerKmFee);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commission_rate_percent: parseFloat(commissionRate),
          logistics_base_fee: parseFloat(baseDeliveryFee),
          logistics_per_km_fee: parseFloat(perKmFee),
          default_buyer_subscription_price: 499.0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update platform settings");
      }

      setStatus("success");
      setMessage("Platform financial parameters updated successfully!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
          <Sliders className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Configurable Fee Engine</h3>
          <p className="text-xs text-slate-500">Real-time parameters applied to all new farm-to-kitchen checkouts</p>
        </div>
      </div>

      {status === "success" && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 pt-6 text-xs">
        <div>
          <label className="block font-bold text-slate-800 mb-1">
            Platform Service Commission (%) *
          </label>
          <p className="text-slate-500 text-[11px] mb-2">
            Standard B2B facilitation commission charged on the produce subtotal (Transparently itemized on tax invoice).
          </p>
          <div className="flex items-center gap-2 max-w-xs">
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="15.0"
              required
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-sm font-bold text-slate-600">%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block font-bold text-slate-800 mb-1">
            Fleet Dispatch Base Logistics Fee (₹) *
          </label>
          <p className="text-slate-500 text-[11px] mb-2">
            Fixed handling & crate loading fee for Khet2Kitchen transport partner vehicles.
          </p>
          <div className="flex items-center gap-2 max-w-xs">
            <span className="text-sm font-bold text-slate-600">₹</span>
            <input
              type="number"
              min="0"
              required
              value={baseDeliveryFee}
              onChange={(e) => setBaseDeliveryFee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block font-bold text-slate-800 mb-1">
            Distance Mileage Rate (₹ / km) *
          </label>
          <p className="text-slate-500 text-[11px] mb-2">
            Per-kilometer route freight calculated from farm village gate to kitchen bay.
          </p>
          <div className="flex items-center gap-2 max-w-xs">
            <span className="text-sm font-bold text-slate-600">₹</span>
            <input
              type="number"
              step="0.5"
              min="1"
              required
              value={perKmFee}
              onChange={(e) => setPerKmFee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500">/ km</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow transition-all"
          >
            {loading ? <span>Updating...</span> : <><Save className="h-4 w-4" /> Save Fee Rules</>}
          </button>
        </div>
      </form>
    </div>
  );
}
