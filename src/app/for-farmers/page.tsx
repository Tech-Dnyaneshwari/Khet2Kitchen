import React from "react";
import Link from "next/link";
import { CheckCircle2, TrendingUp, ShieldCheck, Truck, Banknote, Users, ArrowRight, HelpCircle } from "lucide-react";

export default function ForFarmersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-emerald-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800 text-emerald-200 border border-emerald-700 mb-4">
              Farmer Direct Empowerment
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Sell Directly to Commercial Kitchens. <br />
              <span className="text-emerald-400">Zero Middlemen, Full Price Control.</span>
            </h1>
            <p className="mt-4 text-lg text-emerald-100 leading-relaxed">
              Khet2Kitchen connects progressive farmers directly with restaurants, hotel chains, college messes, and caterers. Stop bearing unfair cuts, delay in mandi receipts, and arbitrary broker rejections.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register?role=FARMER"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-lg transition-all flex items-center gap-2"
              >
                Register Your Farm Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-lg border border-emerald-600 transition-all"
              >
                Sign In to Farmer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Mandi vs Khet2Kitchen */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Why Farmers Switch to Khet2Kitchen</h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            See the structural difference between traditional broker channels and Khet2Kitchen direct procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Mandi */}
          <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
              Traditional Mandi Channel
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">The Broker Trap</h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>6% to 12% broker commission</strong> deducted directly from your gross earnings.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>No price guarantees:</strong> You transport produce at your own cost without knowing today's closing auction price.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Distress distress sales:</strong> Forced to accept throwaway prices when mandi is overflooded.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Delayed payments:</strong> Kacha bill slips with 15–45 day payment delays and unexplained deductions.</span>
              </li>
            </ul>
          </div>

          {/* Khet2Kitchen */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500 p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
              Khet2Kitchen Platform
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-4">Direct Farm-Gate Business</h3>
            <ul className="space-y-4 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Transparent 3% flat fee:</strong> No hidden deductions, no hamali charges, no unauthorized cutbacks.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>You set your price:</strong> List your produce at the exact price you want. Buyers order based on your listed price.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Confirmed orders before harvest:</strong> Harvest only when you receive an accepted order with committed quantity.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Direct Bank Payouts:</strong> Automated NEFT/IMPS payout transfer directly to your bank account within 24 hours of delivery.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Step Process for Farmer */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">How It Works for Farmers</h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Start selling your upcoming or harvested lot in 4 easy steps from your smartphone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Create Free Profile</h4>
              <p className="text-xs text-slate-600">Register with your farm name, village, taluka, and 7/12 land extract details.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-1">List Available Crop</h4>
              <p className="text-xs text-slate-600">Enter quantity (kg), your desired price, quality grade (Grade A/B), and harvest date.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Accept Incoming Orders</h4>
              <p className="text-xs text-slate-600">Review restaurant orders, accept the demand, pack the crates, and mark ready for pickup.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Farm-Gate Dispatch & Cash</h4>
              <p className="text-xs text-slate-600">Our transport partner picks up from your farm gate. Receive payment in your bank account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-10 shadow-xl">
          <h2 className="text-3xl font-extrabold mb-3">Join 1,200+ Maharashtra Farmers on Khet2Kitchen</h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base mb-6">
            Empower your khet with committed commercial demand from Pune, Mumbai, PCMC, and Nashik food businesses.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register?role=FARMER"
              className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg shadow transition-all"
            >
              Sign Up As Farmer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
