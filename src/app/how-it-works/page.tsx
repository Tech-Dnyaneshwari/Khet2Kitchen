import React from 'react';
import Link from 'next/link';
import {
  Tractor,
  Store,
  Truck,
  Scale,
  QrCode,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export const metadata = {
  title: 'How It Works | Khet2Kitchen Transparent Sourcing',
  description: 'Detailed farm gate to commercial kitchen operational workflow.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Farmer Harvests & Lists Live Stock',
      desc: 'Farmers list available produce early morning directly from their mobile. They specify quantity in kg, grade (Grade A, Premium, Organic), minimum order quantity, and unit price.',
      actor: 'Farmer Gate',
      color: 'bg-emerald-600',
    },
    {
      num: '02',
      title: 'Commercial Kitchen Locks Requirements',
      desc: 'Restaurants, hotels, or mess canteens select verified produce, choose delivery or self-pickup, enter preferred delivery time slot, and place the direct order.',
      actor: 'Kitchen Procurement',
      color: 'bg-blue-600',
    },
    {
      num: '03',
      title: 'Farm Gate Electronic Weighbridge',
      desc: 'When the delivery partner arrives at the farm, the produce is weighed on a certified electronic scale. Both parties sign the electronic weighing manifest.',
      actor: 'Verified Handover',
      color: 'bg-amber-600',
    },
    {
      num: '04',
      title: 'GPS Monitored Direct Transit',
      desc: 'The dedicated mini-truck transports the freshly harvested produce directly to the buyer kitchen. Real-time telemetry is accessible in the tracking portal.',
      actor: 'Logistics Fleet',
      color: 'bg-purple-600',
    },
    {
      num: '05',
      title: 'Kitchen Gate Delivery & Escrow Release',
      desc: 'The receiving chef or kitchen manager verifies crates and provides the 4-digit gate verification passcode. Funds in escrow are released immediately to the farmer bank account.',
      actor: 'Instant Settlement',
      color: 'bg-emerald-700',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Step-by-Step Operations
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          How Direct Farm Sourcing Works
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          From the moment a tomato is harvested in Junnar to its delivery at an FC Road restaurant kitchen.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-md`}
              >
                {s.num}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Stage {s.num} • {s.actor}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{s.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
        <h3 className="text-2xl font-bold">Ready to Simplify Your Produce Supply Chain?</h3>
        <p className="text-xs text-emerald-200 max-w-xl mx-auto leading-relaxed">
          Join hundreds of commercial kitchens and grower FPOs across Maharashtra on the direct marketplace.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Register Now
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Browse Farm Lots
          </Link>
        </div>
      </div>
    </div>
  );
}
