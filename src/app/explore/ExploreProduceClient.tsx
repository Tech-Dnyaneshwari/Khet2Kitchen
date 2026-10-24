"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ShieldCheck, MapPin, Calendar, ShoppingCart, Check, Info, ArrowUpDown } from "lucide-react";

interface ListingItem {
  id: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  qualityGrade: string;
  unit: string;
  pricePerUnit: number;
  availableStockKg: number;
  minOrderQuantityKg: number;
  harvestDate: string;
  availabilityDate: string;
  imageUrl: string;
  farmerName: string;
  farmName: string;
  farmerLocation: string;
  isFarmerVerified: boolean;
  farmerRating: number;
}

interface Props {
  initialListings: ListingItem[];
  categories: { id: string; name: string; slug: string }[];
  initialCategory?: string;
  initialSearch?: string;
}

export default function ExploreProduceClient({
  initialListings,
  categories,
  initialCategory = "ALL",
  initialSearch = "",
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedGrade, setSelectedGrade] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("default");
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [addingStatus, setAddingStatus] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [statusMessage, setStatusMessage] = useState<Record<string, string>>({});

  // Filter listings
  const filteredListings = useMemo(() => {
    return initialListings
      .filter((item) => {
        const matchesCategory =
          selectedCategory === "ALL" ||
          item.categorySlug.toLowerCase() === selectedCategory.toLowerCase() ||
          item.categoryName.toLowerCase() === selectedCategory.toLowerCase();

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.farmerName.toLowerCase().includes(query) ||
          item.farmName.toLowerCase().includes(query) ||
          item.farmerLocation.toLowerCase().includes(query);

        const matchesGrade =
          selectedGrade === "ALL" || item.qualityGrade.toUpperCase() === selectedGrade.toUpperCase();

        return matchesCategory && matchesSearch && matchesGrade;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.pricePerUnit - b.pricePerUnit;
        if (sortBy === "price_desc") return b.pricePerUnit - a.pricePerUnit;
        if (sortBy === "stock_desc") return b.availableStockKg - a.availableStockKg;
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [initialListings, selectedCategory, searchQuery, selectedGrade, sortBy]);

  const handleQuantityChange = (id: string, value: number, minQty: number, maxQty: number) => {
    const safeVal = Math.max(0, Math.min(maxQty, value));
    setCartQuantities((prev) => ({ ...prev, [id]: safeVal }));
  };

  const handleAddToCart = async (item: ListingItem) => {
    const qty = cartQuantities[item.id] || item.minOrderQuantityKg;
    if (qty < item.minOrderQuantityKg) {
      setAddingStatus((prev) => ({ ...prev, [item.id]: "error" }));
      setStatusMessage((prev) => ({
        ...prev,
        [item.id]: `Minimum order quantity is ${item.minOrderQuantityKg} ${item.unit}`,
      }));
      return;
    }
    if (qty > item.availableStockKg) {
      setAddingStatus((prev) => ({ ...prev, [item.id]: "error" }));
      setStatusMessage((prev) => ({
        ...prev,
        [item.id]: `Only ${item.availableStockKg} ${item.unit} available in stock`,
      }));
      return;
    }

    setAddingStatus((prev) => ({ ...prev, [item.id]: "loading" }));
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produceId: item.id,
          quantityKg: qty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAddingStatus((prev) => ({ ...prev, [item.id]: "error" }));
          setStatusMessage((prev) => ({
            ...prev,
            [item.id]: "Please sign in as a Business Buyer to add items to cart",
          }));
          return;
        }
        throw new Error(data.error || "Failed to add to cart");
      }

      setAddingStatus((prev) => ({ ...prev, [item.id]: "success" }));
      setStatusMessage((prev) => ({
        ...prev,
        [item.id]: `Added ${qty} ${item.unit} of ${item.name} to cart!`,
      }));

      // Reset success status after 3 seconds
      setTimeout(() => {
        setAddingStatus((prev) => ({ ...prev, [item.id]: "idle" }));
        setStatusMessage((prev) => ({ ...prev, [item.id]: "" }));
      }, 3500);
    } catch (err: any) {
      setAddingStatus((prev) => ({ ...prev, [item.id]: "error" }));
      setStatusMessage((prev) => ({ ...prev, [item.id]: err.message || "Failed to add item" }));
    }
  };

  return (
    <div>
      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by vegetable, farmer name, village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Grade filter */}
          <div className="md:col-span-3">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Quality Grades</option>
              <option value="PREMIUM">Premium Grade</option>
              <option value="GRADE_A">Grade A (Export / Kitchen Best)</option>
              <option value="GRADE_B">Grade B (Processing / Bulk)</option>
              <option value="ORGANIC">Certified Organic</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="default">Sort: Default Featured</option>
                <option value="price_asc">Price: Low to High (₹)</option>
                <option value="price_desc">Price: High to Low (₹)</option>
                <option value="stock_desc">Available Stock: High to Low</option>
                <option value="name_asc">Produce Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Categories ({initialListings.length})
          </button>
          {categories.map((cat) => {
            const count = initialListings.filter(
              (l) => l.categorySlug === cat.slug || l.categoryName === cat.name
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory.toLowerCase() === cat.slug.toLowerCase()
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Produce Grid */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Filter className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">No produce matches your criteria</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Try adjusting your search keywords, clear category selections, or choose "All Quality Grades".
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedGrade("ALL");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((item) => {
            const currentQty = cartQuantities[item.id] !== undefined ? cartQuantities[item.id] : item.minOrderQuantityKg;
            const status = addingStatus[item.id] || "idle";
            const message = statusMessage[item.id];

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {/* Image and badges */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm border border-slate-200">
                      {item.qualityGrade.replace("_", " ")}
                    </span>
                    <span className="bg-emerald-700/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                      {item.categoryName}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-bold">
                    ₹{item.pricePerUnit}/{item.unit}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{item.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>

                    {/* Farmer snippet */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate flex items-center gap-1">
                          {item.farmName}
                          {item.isFarmerVerified && (
                            <span title="Verified Farm">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 inline" />
                            </span>
                          )}
                        </span>
                        <span className="text-amber-600 font-bold shrink-0">★ {item.farmerRating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{item.farmerLocation}</span>
                      </div>
                    </div>

                    {/* Stock and Harvest */}
                    <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-2 rounded-lg text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Available:</span>
                        <span className="font-bold text-slate-700">{item.availableStockKg} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Min Order:</span>
                        <span className="font-bold text-slate-700">{item.minOrderQuantityKg} {item.unit}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1 text-slate-600 pt-1 border-t border-slate-200/60">
                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>Harvested: {item.harvestDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Procurement Action Box */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-600 font-medium">Qty ({item.unit}):</span>
                      <div className="flex-1 flex items-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              currentQty - (item.minOrderQuantityKg >= 10 ? 10 : 5),
                              item.minOrderQuantityKg,
                              item.availableStockKg
                            )
                          }
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-l border border-slate-300 text-xs font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={item.minOrderQuantityKg}
                          max={item.availableStockKg}
                          value={currentQty}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseFloat(e.target.value) || 0,
                              item.minOrderQuantityKg,
                              item.availableStockKg
                            )
                          }
                          className="w-full text-center py-1 border-y border-slate-300 text-xs font-semibold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              item.id,
                              currentQty + (item.minOrderQuantityKg >= 10 ? 10 : 5),
                              item.minOrderQuantityKg,
                              item.availableStockKg
                            )
                          }
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-r border border-slate-300 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={status === "loading"}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        status === "success"
                          ? "bg-emerald-600 text-white"
                          : status === "error"
                          ? "bg-rose-600 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {status === "loading" ? (
                        <span>Adding to cart...</span>
                      ) : status === "success" ? (
                        <>
                          <Check className="h-4 w-4" /> Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Add ₹{(currentQty * item.pricePerUnit).toFixed(0)} to Cart
                        </>
                      )}
                    </button>

                    {message && (
                      <p
                        className={`text-[11px] mt-1.5 text-center font-medium ${
                          status === "error" ? "text-rose-600" : "text-emerald-700"
                        }`}
                      >
                        {message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
