import React from "react";
import Link from "next/link";
import { Truck, MapPin, ShieldCheck, Calculator, ArrowRight, Gauge, CheckCircle2 } from "lucide-react";

export default function TransportationPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 mb-4">
              Agri-Corridor Logistics Network
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Farm-to-Door Agri Transport. <br />
              <span className="text-emerald-400">Zero Spoilage, Transparent Mileage.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 leading-relaxed">
              We bridge rural farms in Junnar, Otur, Nashik, and Shirur with metropolitan commercial kitchens in Pune, PCMC, and Mumbai through dedicated agricultural transport partners.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register?role=TRANSPORT_PARTNER"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-lg transition-all flex items-center gap-2"
              >
                Join as Fleet Transport Partner <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-all"
              >
                Explore Sourcing Corridors
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Fulfillment Modes */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Flexible Fulfillment Options</h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Whether you operate your own fleet or need door-to-door delivery, Khet2Kitchen accommodates your logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mode 1: Khet2Kitchen Delivery */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500 p-8 shadow-sm">
            <div className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
              Most Popular for Kitchens
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Option A: Khet2Kitchen Fleet Delivery</h3>
            <p className="text-sm text-slate-600 mb-4">
              We coordinate pickup from the farmer's gate and deliver directly to your kitchen gate between 6:00 AM and 9:00 AM.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Transparent Delivery Fee Formula:</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Base Dispatch Fee</span>
                <span className="font-bold">₹350.00</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span>Distance Rate (Farm to Kitchen)</span>
                <span className="font-bold">₹14.00 / km</span>
              </div>
              <div className="flex justify-between">
                <span>Bulk Weight Adjustment (&gt;500 kg)</span>
                <span className="font-bold">₹0.40 / kg</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full transit damage insurance and gate OTP handover verification included.</span>
            </div>
          </div>

          {/* Mode 2: Self Pickup */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="inline-block bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
              Zero Logistics Fee
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Option B: Farm-Gate Direct Self Pickup</h3>
            <p className="text-sm text-slate-600 mb-4">
              Have your own vehicle or tempo? Collect directly from the farmer's designated village loading point.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span>Logistics Platform Charge:</span>
                <span className="font-bold text-emerald-600">₹0.00 (FREE)</span>
              </div>
              <p className="text-slate-500 pt-2 border-t border-slate-200">
                You receive the farmer's verified geo-coordinates, contact details, and scheduled loading time slot once the order is accepted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Partner Highlights */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight">Own a Mini-Truck or Pickup Tempo?</h2>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">
              Earn steady daily income by connecting agricultural belts to city consumption centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h4 className="font-bold text-white mb-2">Guaranteed Daily Return Trips</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Eliminate empty return runs. Our corridor engine matches outgoing crates from Junnar/Khed with packaging return loads.
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h4 className="font-bold text-white mb-2">85% Revenue Share</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transport partners receive 85% of the total delivery fee charged to the buyer. No unreasonable broker clawbacks.
              </p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h4 className="font-bold text-white mb-2">Weekly Direct Bank Settlement</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                All completed deliveries verified via buyer gate OTP are settled directly into your savings account every Tuesday.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center sm:text-left">
            <Link
              href="/register?role=TRANSPORT_PARTNER"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all"
            >
              Register Your Vehicle (Tata Ace, Bolero, Dost) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
