import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  Tractor,
  Store,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingDown,
  Scale,
  Award,
  MapPin,
  ChevronRight,
  Layers,
} from 'lucide-react';
import SavingsCalculator from '@/components/buyer/SavingsCalculator';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch real featured listings from database
  const featuredProduce = await prisma.produceListing.findMany({
    where: { status: 'ACTIVE' },
    include: {
      farmer: true,
      category: true,
      images: true,
    },
    take: 6,
    orderBy: { isFeatured: 'desc' },
  });

  // Fetch verified demonstration farmers
  const farmers = await prisma.farmerProfile.findMany({
    take: 4,
    include: { user: true },
    orderBy: { rating: 'desc' },
  });

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.2),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Direct Farm-to-Business Agricultural Marketplace
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            “Fresh from Farms. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-200">Direct to Kitchens.</span>”
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-5 leading-relaxed">
            Eliminate 8–12% APMC broker commissions. Connect verified agricultural growers directly with Restaurants, Hotels, Messes, Hostels, and Canteens across Pune, Nashik, and Satara.
          </p>

          {/* Demonstration Notice */}
          <div className="inline-block mt-4 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-[11px] text-slate-300">
            ℹ️ <span className="font-semibold text-emerald-400">Notice:</span> All profiles and savings figures on this installation are verified demonstration records.
          </div>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/explore"
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Store className="w-4 h-4" />
              Explore Direct Produce Lots
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Tractor className="w-4 h-4 text-emerald-400" />
              Register as Farmer or Kitchen
            </Link>
          </div>
        </div>

        {/* Live Mandi vs K2K Rate Benchmark Ticker */}
        <div className="mt-14 max-w-6xl mx-auto bg-slate-900/90 rounded-2xl border border-emerald-500/30 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Transparent Price Benchmark (APMC Mandi vs. Khet2Kitchen Direct)
            </span>
            <span className="text-[11px] text-slate-400">[Illustrative Market Comparison]</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { crop: 'Tomato (Grade A)', mandi: '₹32/kg', k2k: '₹25/kg', save: '22% Lower' },
              { crop: 'Nashik Red Onion', mandi: '₹35/kg', k2k: '₹28/kg', save: '20% Lower' },
              { crop: 'Jyoti Potato', mandi: '₹28/kg', k2k: '₹22/kg', save: '21% Lower' },
              { crop: 'Lokwan Wheat', mandi: '₹38/kg', k2k: '₹32/kg', save: '16% Lower' },
              { crop: 'Satara Ginger', mandi: '₹110/kg', k2k: '₹85/kg', save: '23% Lower' },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[11px] font-bold text-white block truncate">{item.crop}</span>
                <div className="flex items-baseline justify-between mt-1 text-xs">
                  <span className="text-slate-400 line-through text-[11px]">{item.mandi}</span>
                  <span className="font-bold text-emerald-400">{item.k2k}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded mt-1.5 inline-block">
                  {item.save}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRANSPARENT SOURCING SAVINGS CALCULATOR (Requirement 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SavingsCalculator />
      </section>

      {/* 3. FEATURED VEGETABLES & PRODUCE (Requirement 3, 6) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Live Sourcing Lots
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">Available Harvests from Regional Farm Gates</h2>
            <p className="text-xs text-slate-500">
              Directly listed by verified farmers with active stock and transparent wholesale pricing.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
          >
            Explore All Harvests ({featuredProduce.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredProduce.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={p.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {p.qualityGrade}
                  </span>
                  <span className="absolute bottom-2 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                    {p.farmer.village}, {p.farmer.district}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-slate-600 font-semibold">{p.farmer.farmName}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block font-semibold">Wholesale Price</span>
                      <span className="font-extrabold text-emerald-700 text-base">₹{Number(p.pricePerUnit).toFixed(0)}/{p.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block font-semibold">Available Stock</span>
                      <span className="font-extrabold text-slate-900 text-base">{Number(p.availableStockKg).toLocaleString('en-IN')} kg</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    Min Order: <strong>{Number(p.minOrderQuantityKg)} kg</strong> • {p.harvestDate}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  href="/explore"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors block text-center"
                >
                  View Details & Sourcing Terms
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THE 4-STEP DIRECT ORDERING PROCESS (Requirement 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              Transparent Operations
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">How Farm Direct Sourcing Operates</h2>
            <p className="text-xs text-slate-400 mt-1">Direct from field gate to commercial kitchen loading bay without multiple middlemen hops.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">1</span>
              <h4 className="font-bold text-sm text-white">Harvest & Grade</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Farmer inputs available harvest lot, quality grading, and minimum order threshold at zero listing fee.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">2</span>
              <h4 className="font-bold text-sm text-white">Commercial Order</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Restaurant or mess reviews farm provenance, checks transparent breakdown, and locks order with delivery slot.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">3</span>
              <h4 className="font-bold text-sm text-white">Weighbridge & Dispatch</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lot weighed on certified electronic scale at farm gate. Transport partner verifies QR and loads vehicle.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">4</span>
              <h4 className="font-bold text-sm text-white">Kitchen Gate Receipt</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Produce unloaded at kitchen gate. Transparent automated escrow settlement executed to farmer bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL-TRACK VALUE PROPOSITION (For Farmers vs Kitchens) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Farmers */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase">शेतकऱ्यांसाठी</span>
                <h3 className="text-xl font-bold text-slate-900">For Farmers & Grower FPOs</h3>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>0% Middleman Deduction:</strong> Keep 100% of price without paying traditional 8–12% adatiya cuts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Certified Weighbridge:</strong> Guaranteed weight slip printed on-site at your farm gate loading bay.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Direct Bank Payouts:</strong> Automated escrow transfers directly into your bank account upon delivery.</span>
              </li>
            </ul>

            <Link
              href="/for-farmers"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
            >
              Explore Farmer Benefits & Terms →
            </Link>
          </div>

          {/* Card 2: Food Businesses */}
          <div className="bg-white rounded-3xl border-2 border-blue-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase">हॉटेल्स व मेससाठी</span>
                <h3 className="text-xl font-bold text-slate-900">For Restaurants, Hotels & Messes</h3>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Same-Day Freshness:</strong> Zero cold-storage stagnation. Harvested 5 AM, delivered to kitchen 9 AM.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>Flexible Delivery:</strong> Farm gate direct pickup (₹0) or K2K mini-truck GPS delivery.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span><strong>GST Invoices & Credit Net-30:</strong> Verified tax invoices and institutional credit lines for mess canteens.</span>
              </li>
            </ul>

            <Link
              href="/for-restaurants"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 pt-2"
            >
              Explore Kitchen Sourcing Program →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
