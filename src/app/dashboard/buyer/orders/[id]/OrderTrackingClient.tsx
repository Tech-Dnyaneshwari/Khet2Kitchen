"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  XCircle,
  PackageCheck,
  Phone,
  MapPin,
  Calendar,
  KeyRound,
  Star,
} from "lucide-react";

interface Props {
  order: {
    id: string;
    orderNumber: string;
    invoiceNumber: string;
    status: string;
    createdAt: string;
    subtotal: number;
    deliveryFee: number;
    platformCommission: number;
    taxAmount: number;
    totalAmount: number;
    fulfillmentType: string;
    preferredDeliveryDate?: string | null;
    preferredTimeSlot?: string | null;
    qrPasscode: string;
    cancellationReason?: string | null;
    rejectionReason?: string | null;
    farmerName: string;
    farmName: string;
    farmerPhone: string;
    farmerLocation: string;
    existingReview?: { rating: number; comment: string | null } | null;
    items: {
      id: string;
      productName: string;
      qualityGrade: string;
      unit: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
    delivery?: {
      id: string;
      status: string;
      pickupAddress: string;
      deliveryAddress: string;
      driverName?: string;
      vehicleNumber?: string;
      driverPhone?: string;
    } | null;
    statusHistory: {
      id: string;
      fromStatus: string;
      toStatus: string;
      changedByName: string;
      changedByRole: string;
      note?: string | null;
      createdAt: string;
    }[];
  };
  userRole: string;
}

const STEPS = [
  { key: "PENDING_FARMER_CONFIRMATION", label: "Order Placed" },
  { key: "ACCEPTED", label: "Farmer Accepted" },
  { key: "PREPARING", label: "Crated & Packed" },
  { key: "READY_FOR_PICKUP", label: "Ready at Gate" },
  { key: "IN_TRANSIT", label: "In Transit" },
  { key: "DELIVERED", label: "Delivered & Verified" },
];

export default function OrderTrackingClient({ order: initialOrder, userRole }: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState("");

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"idle" | "success" | "error">("idle");
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(!!initialOrder.existingReview);

  const isCancelled = order.status === "CANCELLED";
  const isRejected = order.status === "REJECTED_BY_FARMER";

  const getStepIndex = (status: string) => {
    if (status === "PICKED_UP") return 4;
    return STEPS.findIndex((s) => s.key === status);
  };

  const currentStepIdx = getStepIndex(order.status);

  const handleSubmitReview = async () => {
    setReviewSubmitting(true);
    setReviewStatus("idle");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      setReviewSubmitted(true);
      setReviewStatus("success");
      setReviewMsg("Thank you! Your review has been submitted.");
    } catch (err: any) {
      setReviewStatus("error");
      setReviewMsg(err.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setError("Please provide a reason for cancelling this order.");
      return;
    }
    setCancelling(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          reason: cancelReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }

      setOrder((prev) => ({
        ...prev,
        status: "CANCELLED",
        cancellationReason: cancelReason,
      }));
      setShowCancelModal(false);
    } catch (err: any) {
      setError(err.message || "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual State Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-medium">Status</span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {isCancelled ? (
                <span className="text-rose-600 flex items-center gap-1.5">
                  <XCircle className="h-5 w-5" /> Cancelled by Buyer
                </span>
              ) : isRejected ? (
                <span className="text-rose-600 flex items-center gap-1.5">
                  <XCircle className="h-5 w-5" /> Declined by Farmer
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5" /> {order.status.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>

          {/* Gate Verification OTP Passcode */}
          {!isCancelled && !isRejected && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-right">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Driver Handover Passcode
              </span>
              <span className="font-mono font-black text-amber-950 text-base tracking-widest">
                {order.qrPasscode}
              </span>
            </div>
          )}
        </div>

        {/* Linear Stepper */}
        {!isCancelled && !isRejected ? (
          <div className="relative">
            <div className="overflow-x-auto pb-4 scrollbar-none">
              <div className="min-w-[540px] flex items-center justify-between relative">
                {STEPS.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors z-10 ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-300"
                        } ${isCurrent ? "ring-4 ring-emerald-100 scale-110" : ""}`}
                      >
                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] mt-2 font-semibold ${
                          isDone ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-800">
            <strong>Order Terminated:</strong> {order.cancellationReason || order.rejectionReason || "No explanation provided."}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Items & Logistics */}
        <div className="lg:col-span-8 space-y-6">
          {/* Itemized Produce */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
              COMMERCIAL PRODUCE LOTS
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.productName}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[10px]">
                        {item.qualityGrade.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-slate-500 block mt-0.5">
                      {item.quantity} {item.unit} @ ₹{item.unitPrice}/{item.unit}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">₹{item.subtotal.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Farmer & Transport Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                Origin Farm
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{order.farmName}</h4>
              <p className="text-slate-600 mt-1 flex items-start gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{order.farmerLocation}</span>
              </p>
              <p className="text-slate-600 mt-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{order.farmerPhone} (Grower: {order.farmerName})</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                Fleet Logistics
              </span>
              {order.delivery ? (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {order.delivery.driverName ? `Assigned: ${order.delivery.driverName}` : "Fleet Vehicle Dispatched"}
                  </h4>
                  <p className="text-slate-600 mt-1">Vehicle: {order.delivery.vehicleNumber || "Khet2Kitchen Tempo"}</p>
                  <p className="text-slate-600 mt-1">Delivery Slot: {order.preferredTimeSlot || "06:00 AM – 07:30 AM"}</p>
                </div>
              ) : (
                <p className="text-slate-500">Farm-Gate Self Pickup selected by buyer.</p>
              )}
            </div>
          </div>

          {/* Status Change Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Order Event Timeline
            </h4>
            <div className="space-y-4">
              {order.statusHistory.map((item) => (
                <div key={item.id} className="flex items-start gap-3 text-xs border-l-2 border-emerald-500 pl-3">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {item.toStatus.replace(/_/g, " ")}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      By {item.changedByName} ({item.changedByRole}) • {new Date(item.createdAt).toLocaleString("en-IN")}
                    </span>
                    {item.note && <p className="text-slate-600 mt-1 italic">“{item.note}”</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cost Breakdown & Cancellation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Invoice Breakdown
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Produce Net Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Freight Logistics:</span>
                <span className="font-semibold text-slate-900">₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Commission (3%):</span>
                <span className="font-semibold">₹{order.platformCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (0% Exempt Raw):</span>
                <span className="font-semibold text-slate-900">₹0.00</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700 text-base">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Buyer Cancellation allowed only while PENDING_FARMER_CONFIRMATION */}
            {order.status === "PENDING_FARMER_CONFIRMATION" && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors border border-rose-200"
                >
                  Cancel Order
                </button>
              </div>
            )}
          </div>

          {/* Review Section — only for delivered orders */}
          {order.status === "DELIVERED" && userRole === "BUYER" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" /> Rate this Farmer
              </h4>

              {reviewSubmitted || initialOrder.existingReview ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  {reviewStatus === "success" ? (
                    <p>✅ {reviewMsg}</p>
                  ) : (
                    <div>
                      <p className="font-bold">Your Review:</p>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: initialOrder.existingReview?.rating || reviewRating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      {initialOrder.existingReview?.comment && (
                        <p className="text-emerald-700 italic mt-1">"{initialOrder.existingReview.comment}"</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-2">Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= reviewRating
                                ? "fill-amber-500 text-amber-500"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-slate-500 ml-2">{reviewRating} / 5</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-600 font-medium block mb-1">Comment (optional)</span>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe produce quality, freshness, packaging..."
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  {reviewStatus === "error" && (
                    <p className="text-xs text-rose-600">{reviewMsg}</p>
                  )}

                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Cancel Procurement Order</h3>
            <p className="text-xs text-slate-500 mb-4">
              Since the farmer has not yet accepted or begun harvesting, this order can be cancelled with immediate inventory release.
            </p>

            {error && <div className="mb-3 text-xs text-rose-600 font-medium">{error}</div>}

            <textarea
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="State reason for cancellation (e.g. Menu schedule change, over-supplied)..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
