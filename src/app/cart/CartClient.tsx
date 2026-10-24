"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Truck, Store, Calendar, Clock, CreditCard, ShieldCheck, ArrowRight, AlertCircle, Check } from "lucide-react";

interface CartItem {
  id: string;
  produceId: string;
  productName: string;
  qualityGrade: string;
  unit: string;
  unitPrice: number;
  quantityKg: number;
  availableStockKg: number;
  minOrderQuantityKg: number;
  imageUrl: string;
  farmName: string;
  farmerName: string;
  farmerLocation: string;
}

interface AddressItem {
  id: string;
  label: string;
  street: string;
  city: string;
  district: string;
  pinCode: string;
  isDefault: boolean;
}

interface Props {
  initialItems: CartItem[];
  savedAddresses: AddressItem[];
}

export default function CartClient({ initialItems, savedAddresses }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [fulfillmentType, setFulfillmentType] = useState<"KHET2KITCHEN_DELIVERY" | "FARM_PICKUP">("KHET2KITCHEN_DELIVERY");
  const [selectedAddressId, setSelectedAddressId] = useState<string>(savedAddresses[0]?.id || "");
  const [preferredDate, setPreferredDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>("06:00 AM - 07:30 AM");
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI_DIRECT");
  const [farmerNotes, setFarmerNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Remove item
  const handleRemove = async (produceId: string) => {
    try {
      const res = await fetch(`/api/cart?produceId=${produceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.produceId !== produceId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update item quantity
  const handleQuantityUpdate = async (produceId: string, newQty: number, minQty: number, maxQty: number) => {
    if (newQty < minQty || newQty > maxQty) return;
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produceId, quantityKg: newQty }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.produceId === produceId ? { ...i, quantityKg: newQty } : i))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantityKg, 0);
  const totalWeightKg = items.reduce((acc, curr) => acc + curr.quantityKg, 0);

  // Delivery formula: ₹350 base + 28km * ₹14/km + weight fee
  const distanceKm = 28;
  const deliveryFee =
    fulfillmentType === "FARM_PICKUP"
      ? 0
      : Math.round(350 + distanceKm * 14 + Math.max(0, totalWeightKg - 500) * 0.4);

  const platformCommission = Math.round(subtotal * 0.03); // 3%
  const taxAmount = 0; // 0% on raw vegetables
  const totalAmount = subtotal + deliveryFee + platformCommission;

  // Reference comparison: standard APMC mandi retail markup ~ ₹12/kg higher
  const benchmarkCost = subtotal + totalWeightKg * 12;
  const netSavings = benchmarkCost - totalAmount;

  // Checkout submission
  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentType,
          preferredDeliveryDate: preferredDate,
          preferredTimeSlot,
          farmerNotes,
          paymentMethod,
          deliveryAddress: {
            street: selectedAddr?.street || "Commercial Loading Dock 1",
            city: selectedAddr?.city || "Pune",
            district: selectedAddr?.district || "Pune",
            pinCode: selectedAddr?.pinCode || "411001",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      router.push(`/dashboard/buyer/orders/${data.order.id}`);
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8">
        <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-800">Your Procurement Cart is Empty</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          Explore fresh produce harvested today across Maharashtra farm corridors.
        </p>
        <Link
          href="/explore"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm inline-flex items-center gap-2"
        >
          Browse Farm Catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left side: Items & Delivery preferences */}
      <div className="lg:col-span-8 space-y-6">
        {/* Items List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
            <span>DIRECT FARM ITEMS ({items.length})</span>
            <span>TOTAL WEIGHT: {totalWeightKg} KG</span>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{item.productName}</h4>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {item.qualityGrade.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      From: <span className="font-semibold text-slate-700">{item.farmName}</span> ({item.farmerLocation})
                    </p>
                    <p className="text-xs font-bold text-emerald-700 mt-1">
                      ₹{item.unitPrice} / {item.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityUpdate(
                          item.produceId,
                          item.quantityKg - (item.minOrderQuantityKg >= 10 ? 10 : 5),
                          item.minOrderQuantityKg,
                          item.availableStockKg
                        )
                      }
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 font-bold text-slate-800">
                      {item.quantityKg} {item.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityUpdate(
                          item.produceId,
                          item.quantityKg + (item.minOrderQuantityKg >= 10 ? 10 : 5),
                          item.minOrderQuantityKg,
                          item.availableStockKg
                        )
                      }
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="block font-extrabold text-slate-900 text-sm">
                      ₹{(item.unitPrice * item.quantityKg).toFixed(0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.produceId)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 mt-0.5"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Options */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Select Logistics & Fulfillment
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                fulfillmentType === "KHET2KITCHEN_DELIVERY"
                  ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-700" />
                  <span className="font-bold text-sm text-slate-900">Khet2Kitchen Fleet</span>
                </div>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === "KHET2KITCHEN_DELIVERY"}
                  onChange={() => setFulfillmentType("KHET2KITCHEN_DELIVERY")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Temperature ventilated morning delivery straight to your kitchen gate.
              </p>
              <span className="text-xs font-bold text-emerald-800 mt-2 block">
                ₹{deliveryFee} (Calculated by route distance)
              </span>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                fulfillmentType === "FARM_PICKUP"
                  ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-slate-700" />
                  <span className="font-bold text-sm text-slate-900">Farm-Gate Self Pickup</span>
                </div>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentType === "FARM_PICKUP"}
                  onChange={() => setFulfillmentType("FARM_PICKUP")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Send your own tempo or buyer representative to the farm gate loading dock.
              </p>
              <span className="text-xs font-bold text-emerald-600 mt-2 block">₹0.00 FREE</span>
            </label>
          </div>

          {/* Schedule Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Delivery Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Morning Time Window</label>
              <select
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="06:00 AM - 07:30 AM">06:00 AM – 07:30 AM (Pre-Prep Early Window)</option>
                <option value="07:30 AM - 09:00 AM">07:30 AM – 09:00 AM (Morning Kitchen Slot)</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM – 04:00 PM (Afternoon Refresh)</option>
              </select>
            </div>
          </div>

          {/* Delivery Address */}
          {fulfillmentType === "KHET2KITCHEN_DELIVERY" && savedAddresses.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Receiving Kitchen Address</label>
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {savedAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} — {a.street}, {a.city} ({a.pinCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes for farmer */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Packaging / Harvest Notes</label>
            <input
              type="text"
              placeholder="e.g. Please use ventilated plastic crates, slightly ripe tomatoes preferred."
              value={farmerNotes}
              onChange={(e) => setFarmerNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Right side: Transparent Cost Breakdown & Confirm */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Transparent Pricing Summary
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Produce Subtotal ({totalWeightKg} kg):</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Logistics & Fleet Transport:</span>
              <span className="font-semibold text-slate-800">₹{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
              <div>
                <span className="font-bold block">Platform Fee (3.0%):</span>
                <span className="text-[10px] text-emerald-600">Transparent tech & escrow commission</span>
              </div>
              <span className="font-bold">₹{platformCommission.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Agricultural GST (HSN Exempt 0%):</span>
              <span className="font-semibold text-slate-800">₹0.00</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="font-extrabold text-slate-900">Total Payable Amount:</span>
              <span className="font-black text-emerald-700 text-lg">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Benchmark comparison */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Estimated APMC Mandi Retail:</span>
              <span>₹{benchmarkCost.toFixed(0)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-700 mt-1">
              <span>Your Estimated Savings:</span>
              <span>₹{netSavings.toFixed(0)} ({( (netSavings / benchmarkCost) * 100 ).toFixed(1)}%)</span>
            </div>
          </div>

          {/* Payment selection */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">B2B Payment Method</label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "UPI_DIRECT"}
                  onChange={() => setPaymentMethod("UPI_DIRECT")}
                />
                <span className="font-medium text-slate-800">Instant UPI Direct (Zero Fee)</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "NET_BANKING"}
                  onChange={() => setPaymentMethod("NET_BANKING")}
                />
                <span className="font-medium text-slate-800">NEFT / RTGS Commercial Transfer</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <span>Reserving inventory & placing order...</span>
            ) : (
              <>
                <Check className="h-4 w-4" /> Confirm & Place Order
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            Inventory is reserved immediately upon placement. Farmer confirms within 2 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
