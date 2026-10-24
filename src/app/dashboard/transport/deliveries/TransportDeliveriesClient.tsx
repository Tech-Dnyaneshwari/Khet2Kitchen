"use client";

import React, { useState } from "react";
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Check,
} from "lucide-react";

interface DeliveryItem {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDistanceKm: number;
  totalFee: number;
  driverPayout: number;
  preferredTimeSlot?: string | null;
  qrPasscode: string;
  farmerName: string;
  farmName: string;
  farmerPhone: string;
  buyerName: string;
  buyerBusiness: string;
  buyerPhone: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unit: string;
  }[];
}

export default function TransportDeliveriesClient({ deliveries: initialDeliveries }: { deliveries: DeliveryItem[] }) {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(initialDeliveries);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [verifyingDelivery, setVerifyingDelivery] = useState<DeliveryItem | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState("");

  const handleUpdateStatus = async (deliveryId: string, nextStatus: string, proofNotes?: string) => {
    setLoadingId(deliveryId);
    setError("");

    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          proofNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update delivery status");
      }

      setDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, status: nextStatus } : d))
      );

      if (verifyingDelivery?.id === deliveryId) {
        setVerifyingDelivery(null);
        setOtpInput("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleOtpVerify = () => {
    if (!verifyingDelivery) return;
    const cleanInput = otpInput.trim().toUpperCase();
    const cleanExpected = verifyingDelivery.qrPasscode.trim().toUpperCase();

    // Check OTP
    if (cleanInput !== cleanExpected && cleanInput !== cleanExpected.replace("OTP-", "")) {
      setError(`Invalid Passcode. The kitchen manager must provide the exact passcode (Hint: ${verifyingDelivery.qrPasscode})`);
      return;
    }

    handleUpdateStatus(verifyingDelivery.id, "DELIVERED", `Verified and unloaded at kitchen bay with passcode ${cleanInput}`);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Truck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No deliveries currently assigned.</p>
          </div>
        ) : (
          deliveries.map((delivery) => {
            const isAssigned = ["REQUESTED", "ASSIGNED"].includes(delivery.status);
            const isPickedUp = delivery.status === "PICKED_UP";
            const isInTransit = delivery.status === "IN_TRANSIT";
            const isDelivered = delivery.status === "DELIVERED";

            return (
              <div
                key={delivery.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{delivery.orderNumber}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isDelivered
                            ? "bg-emerald-100 text-emerald-800"
                            : isInTransit
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {delivery.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-500">Distance: {delivery.estimatedDistanceKm} km corridor</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {delivery.items.map((i) => (
                        <span key={i.id} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {i.productName} ({i.quantity} {i.unit})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Your Driver Payout</span>
                    <span className="font-black text-emerald-700 text-lg">₹{delivery.driverPayout.toFixed(0)}</span>
                  </div>
                </div>

                {/* Pickup & Delivery Addresses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">1. Farm Gate Pickup</span>
                    <p className="text-slate-600">{delivery.pickupAddress}</p>
                    <p className="text-slate-500 mt-1">Farmer: {delivery.farmerName} • Tel: {delivery.farmerPhone}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">2. Kitchen Delivery Gate</span>
                    <p className="text-slate-600">{delivery.deliveryAddress}</p>
                    <p className="text-slate-500 mt-1">Buyer: {delivery.buyerBusiness} • Tel: {delivery.buyerPhone}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Slot: {delivery.preferredTimeSlot || "Morning Kitchen Window"}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Action: Picked up */}
                    {isAssigned && (
                      <button
                        type="button"
                        disabled={loadingId === delivery.id}
                        onClick={() => handleUpdateStatus(delivery.id, "PICKED_UP", "Loaded crates at farm gate")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Truck className="h-4 w-4" /> Confirm Farm Pickup
                      </button>
                    )}

                    {/* Action: In transit */}
                    {isPickedUp && (
                      <button
                        type="button"
                        disabled={loadingId === delivery.id}
                        onClick={() => handleUpdateStatus(delivery.id, "IN_TRANSIT", "Vehicle in transit on highway corridor")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <Truck className="h-4 w-4" /> Start Highway Transit
                      </button>
                    )}

                    {/* Action: Deliver with OTP */}
                    {isInTransit && (
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyingDelivery(delivery);
                          setOtpInput("");
                          setError("");
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <KeyRound className="h-4 w-4" /> Enter Gate Passcode to Complete Delivery
                      </button>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        ✓ Delivery Verified & Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Gate Passcode Verification Modal */}
      {verifyingDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-2">
              <KeyRound className="h-5 w-5 text-emerald-600" />
              <span>Gate Handover Passcode</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ask the kitchen receiving in-charge at <strong>{verifyingDelivery.buyerBusiness}</strong> for their 4-digit order passcode:
            </p>

            {error && <div className="mb-3 text-xs text-rose-600 font-medium">{error}</div>}

            <input
              type="text"
              autoFocus
              placeholder="e.g. OTP-1234 or 1234"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              className="w-full p-3 font-mono text-center text-lg font-bold border border-slate-300 rounded-xl tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => setVerifyingDelivery(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!otpInput.trim()}
                onClick={handleOtpVerify}
                className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Verify & Complete Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
