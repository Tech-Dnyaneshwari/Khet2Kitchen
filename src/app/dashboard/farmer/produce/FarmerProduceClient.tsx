"use client";

import React, { useState } from "react";
import { PlusCircle, Edit3, Trash2, Check, X, AlertCircle, PackagePlus, Eye, EyeOff } from "lucide-react";

interface ListingItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  qualityGrade: string;
  unit: string;
  pricePerUnit: number;
  availableStockKg: number;
  minOrderQuantityKg: number;
  harvestDate: string;
  availabilityDate: string;
  status: string;
  imageUrl: string;
}

interface Props {
  farmerId: string;
  initialListings: ListingItem[];
  categories: { id: string; name: string; slug: string }[];
}

export default function FarmerProduceClient({ farmerId, initialListings, categories }: Props) {
  const [listings, setListings] = useState<ListingItem[]>(initialListings);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ListingItem | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [qualityGrade, setQualityGrade] = useState("GRADE_A");
  const [unit, setUnit] = useState("kg");
  const [pricePerUnit, setPricePerUnit] = useState("25");
  const [availableStockKg, setAvailableStockKg] = useState("500");
  const [minOrderQuantityKg, setMinOrderQuantityKg] = useState("50");
  const [harvestDate, setHarvestDate] = useState("Today morning");
  const [availabilityDate, setAvailabilityDate] = useState("Immediate");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setCategoryId(categories[0]?.id || "");
    setQualityGrade("GRADE_A");
    setPricePerUnit("25");
    setAvailableStockKg("500");
    setMinOrderQuantityKg("50");
    setHarvestDate("Today morning");
    setAvailabilityDate("Immediate");
    setDescription("");
    setImageUrl("https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80");
    setEditingItem(null);
    setError("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: ListingItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setQualityGrade(item.qualityGrade);
    setUnit(item.unit);
    setPricePerUnit(item.pricePerUnit.toString());
    setAvailableStockKg(item.availableStockKg.toString());
    setMinOrderQuantityKg(item.minOrderQuantityKg.toString());
    setHarvestDate(item.harvestDate);
    setAvailabilityDate(item.availabilityDate);
    setDescription(item.description);
    setImageUrl(item.imageUrl);
    setShowAddModal(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name,
      categoryId,
      qualityGrade,
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
      availableStockKg: parseFloat(availableStockKg),
      minOrderQuantityKg: parseFloat(minOrderQuantityKg),
      harvestDate,
      availabilityDate,
      description: description || `Freshly harvested ${name} sorted directly at our farm.`,
      imageUrl,
      ...(editingItem ? { id: editingItem.id } : { farmerId }),
    };

    try {
      const url = "/api/produce";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save listing");
      }

      if (editingItem) {
        setListings((prev) =>
          prev.map((l) => (l.id === editingItem.id ? { ...l, ...payload, categoryName: categories.find((c) => c.id === categoryId)?.name || l.categoryName } : l))
        );
      } else {
        setListings((prev) => [
          {
            ...payload,
            id: (data.produce || data.listing)?.id,
            status: "ACTIVE",
            categoryName: categories.find((c) => c.id === categoryId)?.name || "Vegetables",
          },
          ...prev,
        ]);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save produce listing");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item: ListingItem) => {
    const newStatus = item.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch("/api/produce", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === item.id ? { ...l, status: newStatus } : l))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this produce listing?")) return;
    try {
      const res = await fetch(`/api/produce?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <span className="text-xs font-bold text-slate-700">
          Total Farm Listings: {listings.length}
        </span>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
        >
          <PlusCircle className="h-4 w-4" /> Add Produce Listing
        </button>
      </div>

      {/* Produce Listings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {listings.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <PackagePlus className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">You haven't listed any farm produce yet.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Add your current crop so commercial kitchens can order in bulk.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Add First Listing
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {listings.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{item.name}</span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {item.qualityGrade.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Category: {item.categoryName} • Harvest: {item.harvestDate}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Available Stock</span>
                    <span className="font-bold text-slate-800 text-sm">{item.availableStockKg} {item.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Min Order</span>
                    <span className="font-bold text-slate-800 text-sm">{item.minOrderQuantityKg} {item.unit}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Price / Unit</span>
                    <span className="font-black text-emerald-700 text-sm">₹{item.pricePerUnit}/{item.unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      title={item.status === "ACTIVE" ? "Pause listing" : "Activate listing"}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                    >
                      {item.status === "ACTIVE" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit details & price"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="Delete produce"
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Produce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? "Edit Produce Listing" : "Add Produce to Farm Gate"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveListing} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Produce Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tomato, Red Onion, Cabbage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quality Grade *</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PREMIUM">Premium Export Quality</option>
                    <option value="GRADE_A">Grade A (Kitchen Fresh)</option>
                    <option value="GRADE_B">Grade B (Bulk / Gravy Prep)</option>
                    <option value="ORGANIC">Certified Organic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹/kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock (kg) *</label>
                  <input
                    type="number"
                    required
                    value={availableStockKg}
                    onChange={(e) => setAvailableStockKg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order (kg) *</label>
                  <input
                    type="number"
                    required
                    value={minOrderQuantityKg}
                    onChange={(e) => setMinOrderQuantityKg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harvest Timing</label>
                  <input
                    type="text"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    placeholder="e.g. Harvested Today"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Availability Window</label>
                  <input
                    type="text"
                    value={availabilityDate}
                    onChange={(e) => setAvailabilityDate(e.target.value)}
                    placeholder="e.g. Ready for pickup"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Photo URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Harvest Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on size, variety, freshness..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5"
                >
                  {loading ? <span>Saving...</span> : <><Check className="h-4 w-4" /> Save Listing</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
