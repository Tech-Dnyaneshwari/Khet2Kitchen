import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Tractor, Store, TrendingDown, Users, Award, Scale } from 'lucide-react';

export const metadata = {
  title: 'About Us | Khet2Kitchen Agricultural Marketplace',
  description: 'Our mission to eliminate agricultural middlemen and connect farmers directly with bulk buyers.',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Our Vision & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Transforming Indian Farm Supply Chains
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Khet2Kitchen was founded on a simple principle: farmers deserve fair, direct realizations without broker exploitation, and commercial kitchens deserve fresh, traceable produce without unnecessary markups.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Middlemen Markups</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Conventional agricultural supply chains pass through 4 to 6 intermediaries between village farms and city kitchens. We connect growers directly with culinary buyers.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Electronic Weighbridge Truth</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every batch is weighed on certified electronic scales on-site at the farm gate. Both farmer and buyer receive an unalterable printed and digital weigh slip.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Automated Direct Escrow</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Funds are held in secure escrow and released directly to the farmer bank account upon kitchen verification. No deferred cheques or arbitrary adatiya deductions.
          </p>
        </div>
      </div>

      {/* Origin Corridors */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold">Active Agricultural Corridors</h2>
          <p className="text-xs text-slate-300 mt-1">
            Currently facilitating direct daily dispatches between key Maharashtra agricultural clusters and commercial kitchens in Pune and Pimpri-Chinchwad.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-emerald-400 block text-sm">Otur & Junnar Belt (Pune)</span>
            <p className="text-slate-300 mt-1">Direct source of tomatoes, capsicum, green chillies, and brassicas.</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-emerald-400 block text-sm">Niphad & Nashik Belt</span>
            <p className="text-slate-300 mt-1">World-famous Nashik red onions, table potatoes, and seasonal fruits.</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-emerald-400 block text-sm">Wai & Satara Valley</span>
            <p className="text-slate-300 mt-1">Cleaned ginger rhizomes, turmeric root, and seasonal leafy greens.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
