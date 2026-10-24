"use client";

import React, { useState } from "react";
import { Truck, User, CheckCircle2, AlertCircle, MapPin, Package } from "lucide-react";

interface DeliveryItem {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDistanceKm: number;
  totalFee: number;
  transportPartnerId: string | null;
  partnerName: string | null;
  vehicleNumber: string | null;
  farmName: string;
  buyerName: string;
  createdAt: string;
}

interface PartnerItem {
  id: string;
  name: string;
  vehicleType: string;
  vehicleNumber: string;
  maxPayloadKg: number;
  rating: number;
  totalTrips: number;
}

interface Props {
  deliveries: DeliveryItem[];
  partners: PartnerItem[];
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  PICKED_UP: "bg-indigo-100 text-indigo-800",
  IN_TRANSIT: "bg-emerald-100 text-emerald-800",
  DELIVERED: "bg-slate-100 text-slate-700",
};

export default function AdminTransportClient({ deliveries, partners }: Props) {
  const [items, setItems] = useState<DeliveryItem[]>(deliveries);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<Record<string, { type: "success" | "error"; msg: string }>>({});

  const handleAssign = async (deliveryId: string) => {
    const partnerId = selectedPartner[deliveryId];
    if (!partnerId) {
      setStatusMsg((prev) => ({
        ...prev,
        [deliveryId]: { type: "error", msg: "Please select a transport partner first." },
      }));
      return;
    }

    setLoadingId(deliveryId);
    setStatusMsg((prev) => ({ ...prev, [deliveryId]: { type: "success", msg: "" } }));

    try {
      const res = await fetch("/api/admin/transport-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, transportPartnerId: partnerId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assignment failed");

      const partner = partners.find((p) => p.id === partnerId);
      setItems((prev) =>
        prev.map((d) =>
          d.id === deliveryId
            ? {
                ...d,
                status: "ASSIGNED",
                transportPartnerId: partnerId,
                partnerName: partner?.name || null,
                vehicleNumber: partner?.vehicleNumber || null,
              }
            : d
        )
      );
      setAssigningId(null);
      setStatusMsg((prev) => ({
        ...prev,
        [deliveryId]: { type: "success", msg: `Driver ${partner?.name} assigned successfully.` },
      }));
      setTimeout(() => {
        setStatusMsg((prev) => {
          const updated = { ...prev };
          delete updated[deliveryId];
          return updated;
        });
      }, 4000);
    } catch (err: any) {
      setStatusMsg((prev) => ({
        ...prev,
        [deliveryId]: { type: "error", msg: err.message || "Failed to assign transport partner" },
      }));
    } finally {
      setLoadingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No active deliveries</h3>
        <p className="text-sm text-slate-500 mt-1">
          All current deliveries are completed or no orders are pending dispatch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unassigned", count: items.filter((d) => d.status === "REQUESTED").length, color: "bg-amber-50 border-amber-200 text-amber-800" },
          { label: "Assigned", count: items.filter((d) => d.status === "ASSIGNED").length, color: "bg-blue-50 border-blue-200 text-blue-800" },
          { label: "In Transit", count: items.filter((d) => d.status === "IN_TRANSIT").length, color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
          { label: "Available Drivers", count: partners.length, color: "bg-slate-50 border-slate-200 text-slate-800" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border p-4 text-center ${stat.color}`}>
            <div className="text-2xl font-black">{stat.count}</div>
            <div className="text-xs font-semibold mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Delivery Cards */}
      <div className="space-y-4">
        {items.map((delivery) => {
          const msg = statusMsg[delivery.id];
          const isAssigning = assigningId === delivery.id;

          return (
            <div
              key={delivery.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{delivery.orderNumber}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          STATUS_COLORS[delivery.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {delivery.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {delivery.farmName} → {delivery.buyerName}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-400 block">Delivery Fee</span>
                    <span className="font-black text-slate-900 text-sm">₹{delivery.totalFee.toFixed(0)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block font-medium">Pickup</span>
                      <span className="text-slate-800 font-semibold">{delivery.pickupAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                    <Package className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block font-medium">Delivery</span>
                      <span className="text-slate-800 font-semibold">{delivery.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-4">
                  Distance: <strong>{delivery.estimatedDistanceKm} km</strong> •
                  Created: {new Date(delivery.createdAt).toLocaleDateString("en-IN")}
                </div>

                {/* Current Assignment */}
                {delivery.transportPartnerId && !isAssigning && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs mb-3">
                    <Truck className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="text-blue-800 font-semibold">
                      Assigned: {delivery.partnerName} ({delivery.vehicleNumber})
                    </span>
                  </div>
                )}

                {/* Status Message */}
                {msg && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg text-xs mb-3 ${
                      msg.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-700"
                    }`}
                  >
                    {msg.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{msg.msg}</span>
                  </div>
                )}

                {/* Assignment Controls */}
                {(delivery.status === "REQUESTED" || isAssigning) && (
                  <div>
                    {!isAssigning ? (
                      <button
                        onClick={() => setAssigningId(delivery.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="h-4 w-4" /> Assign Transport Partner
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <select
                          value={selectedPartner[delivery.id] || ""}
                          onChange={(e) =>
                            setSelectedPartner((prev) => ({ ...prev, [delivery.id]: e.target.value }))
                          }
                          className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        >
                          <option value="">— Select a driver —</option>
                          {partners.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} | {p.vehicleNumber} | {p.vehicleType.replace("_", " ")} | ★{p.rating} | {p.totalTrips} trips
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssign(delivery.id)}
                          disabled={loadingId === delivery.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                        >
                          {loadingId === delivery.id ? "Assigning..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setAssigningId(null)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Reassign option for already assigned */}
                {delivery.status === "ASSIGNED" && !isAssigning && (
                  <button
                    onClick={() => setAssigningId(delivery.id)}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Reassign different driver →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
