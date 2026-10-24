"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Truck,
  Phone,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  platformCommission: number;
  netFarmerPayout: number;
  fulfillmentType: string;
  preferredDeliveryDate?: string | null;
  preferredTimeSlot?: string | null;
  qrPasscode: string;
  cancellationReason?: string | null;
  rejectionReason?: string | null;
  buyerName: string;
  businessName: string;
  buyerPhone: string;
  buyerCity: string;
  items: {
    id: string;
    productName: string;
    qualityGrade: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }[];
  delivery?: {
    id: string;
    status: string;
    driverName?: string;
    vehicleNumber?: string;
    driverPhone?: string;
  } | null;
}

export default function FarmerOrdersClient({ orders: initialOrders }: { orders: OrderItem[] }) {
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<OrderItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  const handleUpdateStatus = async (orderId: string, nextStatus: string, reason?: string) => {
    setLoadingId(orderId);
    setError("");

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: nextStatus,
                ...(reason ? { rejectionReason: reason } : {}),
              }
            : o
        )
      );

      if (rejectingOrder?.id === orderId) {
        setRejectingOrder(null);
        setRejectReason("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update order");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "PENDING") return o.status === "PENDING_FARMER_CONFIRMATION";
    if (statusFilter === "IN_PREP") return ["ACCEPTED", "PREPARING", "READY_FOR_PICKUP"].includes(o.status);
    if (statusFilter === "DELIVERED") return o.status === "DELIVERED";
    if (statusFilter === "CANCELLED") return ["CANCELLED", "REJECTED_BY_FARMER"].includes(o.status);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            statusFilter === "ALL"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            statusFilter === "PENDING"
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending Acceptance ({orders.filter((o) => o.status === "PENDING_FARMER_CONFIRMATION").length})
        </button>
        <button
          onClick={() => setStatusFilter("IN_PREP")}
          className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            statusFilter === "IN_PREP"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          In Harvest & Crating
        </button>
        <button
          onClick={() => setStatusFilter("DELIVERED")}
          className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors ${
            statusFilter === "DELIVERED"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Delivered & Settled
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No orders found in this filter.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPending = order.status === "PENDING_FARMER_CONFIRMATION";
            const isAccepted = order.status === "ACCEPTED";
            const isPreparing = order.status === "PREPARING";
            const isReadyForPickup = order.status === "READY_FOR_PICKUP";
            const isTerminated = ["CANCELLED", "REJECTED_BY_FARMER"].includes(order.status);
            const isDelivered = order.status === "DELIVERED";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{order.orderNumber}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isDelivered
                            ? "bg-emerald-100 text-emerald-800"
                            : isPending
                            ? "bg-amber-100 text-amber-800"
                            : isTerminated
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      Buyer: <strong className="text-slate-900">{order.businessName}</strong> ({order.buyerCity}) • Mobile: {order.buyerPhone}
                    </p>
                  </div>

                  {/* Financial Payout Summary */}
                  <div className="flex items-center gap-6 justify-between lg:justify-end text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Gross Produce</span>
                      <span className="font-bold text-slate-800">₹{order.subtotal.toFixed(0)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-700 block text-[11px]">3% Commission</span>
                      <span className="font-medium text-emerald-800">-₹{order.platformCommission.toFixed(0)}</span>
                    </div>

                    <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Net Payout to Bank</span>
                      <span className="font-black text-emerald-800 text-sm">₹{order.netFarmerPayout.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{item.productName}</span>
                          <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-700">
                            {item.qualityGrade.replace("_", " ")}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between text-slate-600">
                          <span>{item.quantity} {item.unit} @ ₹{item.unitPrice}/{item.unit}</span>
                          <span className="font-bold text-slate-800">₹{item.subtotal.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status-dependent Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {order.delivery?.driverName ? (
                      <span>Fleet Driver: <strong>{order.delivery.driverName}</strong> ({order.delivery.vehicleNumber})</span>
                    ) : (
                      <span>Logistics: {order.fulfillmentType.replace(/_/g, " ")}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action 1: Pending Acceptance */}
                    {isPending && (
                      <>
                        <button
                          type="button"
                          disabled={loadingId === order.id}
                          onClick={() => setRejectingOrder(order)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors border border-rose-200"
                        >
                          Decline Order
                        </button>
                        <button
                          type="button"
                          disabled={loadingId === order.id}
                          onClick={() => handleUpdateStatus(order.id, "ACCEPTED")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Accept & Schedule Harvest
                        </button>
                      </>
                    )}

                    {/* Action 2: Accepted -> Preparing */}
                    {isAccepted && (
                      <button
                        type="button"
                        disabled={loadingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5"
                      >
                        <Package className="h-4 w-4" /> Mark Harvested & Crating (Preparing)
                      </button>
                    )}

                    {/* Action 3: Preparing -> Ready for Pickup */}
                    {isPreparing && (
                      <button
                        type="button"
                        disabled={loadingId === order.id}
                        onClick={() => handleUpdateStatus(order.id, "READY_FOR_PICKUP")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5"
                      >
                        <Truck className="h-4 w-4" /> Ready for Gate Pickup (Notify Driver)
                      </button>
                    )}

                    {/* Action 4: Ready for Pickup */}
                    {isReadyForPickup && (
                      <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        ✓ Staged at farm gate. Awaiting transport partner arrival.
                      </div>
                    )}

                    {isTerminated && (
                      <span className="text-xs text-rose-600 font-semibold">
                        Order Terminated: {order.rejectionReason || order.cancellationReason}
                      </span>
                    )}

                    {isDelivered && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        ✓ Order Delivered & Verified via Gate Passcode
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Decline Commercial Order</h3>
            <p className="text-xs text-slate-500 mb-4">
              Please specify why you cannot fulfill this order (e.g. crop already committed, unexpected weather damage, insufficient quantity):
            </p>

            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State reason for declining..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || loadingId === rejectingOrder.id}
                onClick={() => handleUpdateStatus(rejectingOrder.id, "REJECTED_BY_FARMER", rejectReason)}
                className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
