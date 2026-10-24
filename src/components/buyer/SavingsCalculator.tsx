'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Store, TrendingDown, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

interface CropPreset {
  name: string;
  defaultReferencePrice: number; // what commercial kitchens typically pay at Mandi / Middlemen
  k2kWholesalePrice: number;    // Direct farm gate price on K2K
  unit: string;
}

const CROP_PRESETS: Record<string, CropPreset> = {
  tomato: { name: 'Fresh Red Tomato (Grade A)', defaultReferencePrice: 32, k2kWholesalePrice: 25, unit: 'kg' },
  onion: { name: 'Nashik Red Onion', defaultReferencePrice: 35, k2kWholesalePrice: 28, unit: 'kg' },
  potato: { name: 'Jyoti Table Potato', defaultReferencePrice: 28, k2kWholesalePrice: 22, unit: 'kg' },
  wheat: { name: 'Lokwan Sharbati Wheat', defaultReferencePrice: 38, k2kWholesalePrice: 32, unit: 'kg' },
  ginger: { name: 'Satara Fresh Ginger', defaultReferencePrice: 110, k2kWholesalePrice: 85, unit: 'kg' },
};

export default function SavingsCalculator() {
  const [selectedCropKey, setSelectedCropKey] = useState<string>('tomato');
  const [weeklyVolumeKg, setWeeklyVolumeKg] = useState<number>(600);
  const [customReferencePrice, setCustomReferencePrice] = useState<number>(
    CROP_PRESETS['tomato'].defaultReferencePrice
  );

  const crop = CROP_PRESETS[selectedCropKey];

  // Update reference price default when crop changes
  const handleCropChange = (key: string) => {
    setSelectedCropKey(key);
    setCustomReferencePrice(CROP_PRESETS[key].defaultReferencePrice);
  };

  const monthlyVolume = weeklyVolumeKg * 4;
  const referencePurchaseCost = monthlyVolume * customReferencePrice;
  const k2kOrderCost = monthlyVolume * crop.k2kWholesalePrice;
  const difference = referencePurchaseCost - k2kOrderCost;
  const isSavings = difference >= 0;
  const diffPercent = referencePurchaseCost > 0 ? Math.round((Math.abs(difference) / referencePurchaseCost) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider bg-emerald-700/80 text-emerald-200 px-3 py-1 rounded-full">
            Transparent Sourcing Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
            Calculate Your Kitchen's True Monthly Sourcing Impact
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            Compare what your kitchen currently pays against direct Khet2Kitchen farm gate pricing. No hidden formulas.
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Agricultural Produce:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(CROP_PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCropChange(key)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    selectedCropKey === key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.name.split(' ')[0]} {item.name.split(' ')[1] || ''}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Price input */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Your Current Purchase Rate (₹/kg):
              </label>
              <span className="text-xs text-slate-500 font-semibold">
                K2K Farm Price: <strong className="text-emerald-700 font-bold">₹{crop.k2kWholesalePrice}/kg</strong>
              </span>
            </div>
            <input
              type="number"
              min={1}
              value={customReferencePrice}
              onChange={(e) => setCustomReferencePrice(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Input what your current middleman, vendor, or local APMC mandi charges you per kg.
            </p>
          </div>

          {/* Volume Slider */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Estimated Weekly Kitchen Volume:
              </label>
              <span className="text-base font-extrabold text-emerald-700">
                {weeklyVolumeKg.toLocaleString('en-IN')} kg / week
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={3000}
              step={50}
              value={weeklyVolumeKg}
              onChange={(e) => setWeeklyVolumeKg(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-semibold">
              <span>100 kg</span>
              <span>1,000 kg</span>
              <span>2,000 kg</span>
              <span>3,000 kg</span>
            </div>
          </div>
        </div>

        {/* Right Output Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-6 rounded-2xl flex flex-col justify-between space-y-6 border border-slate-800 shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full">
              Transparent Calculation
            </span>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                <span>Monthly Procurement:</span>
                <span className="font-bold text-white">{monthlyVolume.toLocaleString('en-IN')} kg</span>
              </div>

              <div className="flex justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                <span>Reference Purchase Cost:</span>
                <span className="font-bold text-slate-200">₹{referencePurchaseCost.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                <span>Direct Khet2Kitchen Cost:</span>
                <span className="font-bold text-emerald-400">₹{k2kOrderCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Result Display: strictly adhering to "If the result is negative, display the additional cost instead of claiming savings" */}
            <div
              className={`mt-5 p-4 rounded-xl border ${
                isSavings
                  ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-100'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
                {isSavings ? (
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                <span>{isSavings ? 'Estimated Monthly Savings:' : 'Estimated Additional Cost:'}</span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white">
                  ₹{Math.abs(difference).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  ({diffPercent}% {isSavings ? 'lower' : 'higher'})
                </span>
              </div>

              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {isSavings
                  ? 'Direct procurement eliminates middleman markup, commission cuts, and secondary market loading fees.'
                  : 'Your entered reference rate is lower than direct farm gate wholesale price. K2K guarantees Grade A sorting and provenance.'}
              </p>
            </div>
          </div>

          <Link
            href="/explore"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <Store className="w-4 h-4" />
            Source {crop.name.split(' ')[0]} at ₹{crop.k2kWholesalePrice}/kg
          </Link>
        </div>
      </div>
    </div>
  );
}
