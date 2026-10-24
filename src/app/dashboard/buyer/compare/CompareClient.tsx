"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart, ArrowLeftRight, Star, ShieldCheck } from "lucide-react";

interface Listing {
  id: string;
  name: string;
  category: string;
  qualityGrade: string;
  unit: string;
  pricePerUnit: number;
  availableStockKg: number;
  minOrderQuantityKg: number;
  harvestDate: string;
  availabilityDate: string;
  farmName: string;
  farmerLocation: string;
  farmerRating: number;
  imageUrl: string;
}

export default function CompareClient({ listings }: { listings: Listing[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    listings.slice(0, 3).map((l) => l.id)
  );
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 4) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([...selectedIds.slice(1), id]);
      }
    }
  };

  const handleAddToCart = async (item: Listing) => {
    setAddingId(item.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId: item.id,
          quantityKg: item.minOrderQuantityKg,
        }),
      });
      if (res.ok) {
        setSuccessId(item.id);
        setTimeout(() => setSuccessId(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  const comparedItems = listings.filter((l) => selectedIds.includes(l.id));

  return (
    <div className="space-y-6">
      {/* Selector Drawer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-700 block mb-2">
          Select up to 3 produce lots to compare ({selectedIds.length}/3 selected):
        </span>
        <div className="flex flex-wrap gap-2">
          {listings.map((l) => {
            const isSelected = selectedIds.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleSelect(l.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  isSelected
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {l.name} — ₹{l.pricePerUnit} ({l.farmName})
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video bg-slate-100">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-white/90 text-slate-900 font-bold text-[10px] px-2 py-0.5 rounded shadow">
                  {item.qualityGrade.replace("_", " ")}
                </div>
                <div className="absolute bottom-2 right-2 bg-slate-900/90 text-white font-extrabold text-sm px-2.5 py-1 rounded">
                  ₹{item.pricePerUnit} / {item.unit}
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{item.name}</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.category}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Farm / Origin:</span>
                    <span className="font-bold text-slate-800">{item.farmName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-700 font-medium">{item.farmerLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Farmer Rating:</span>
                    <span className="font-bold text-amber-600 flex items-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {item.farmerRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Stock:</span>
                    <span className="font-bold text-slate-800">{item.availableStockKg} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Min Order Qty:</span>
                    <span className="font-bold text-emerald-700">{item.minOrderQuantityKg} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Harvest Date:</span>
                    <span className="text-slate-700 font-medium">{item.harvestDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => handleAddToCart(item)}
                disabled={addingId === item.id}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow ${
                  successId === item.id
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {successId === item.id ? (
                  <>
                    <Check className="h-4 w-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Add Min ({item.minOrderQuantityKg} {item.unit})
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
