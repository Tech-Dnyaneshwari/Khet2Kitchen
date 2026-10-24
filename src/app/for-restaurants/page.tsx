import React from "react";
import Link from "next/link";
import { Utensils, ShieldCheck, Clock, FileText, CheckCircle2, ArrowRight, Award, DollarSign } from "lucide-react";

export default function ForRestaurantsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 mb-4">
              Commercial Kitchen Sourcing Solution
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Farm-Fresh Produce Delivered to Your Kitchen Door. <br />
              <span className="text-emerald-400">Cut Sourcing Cost by 15% to 25%.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 leading-relaxed">
              Designed specifically for Restaurants, Hotels, Caterers, College Hostels, and Corporate Canteens. Procure fresh vegetables sorted, weighed, and graded at the farm, delivered right before your morning prep begins.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register?role=BUYER"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-lg transition-all flex items-center gap-2"
              >
                Register Your Kitchen <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/explore"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 transition-all"
              >
                Browse Live Farm Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Built for High-Volume Commercial Kitchens</h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Eliminate 4:00 AM mandi visits, unverified sub-vendors, and unpredictable vegetable quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Guaranteed 6 AM – 9 AM Delivery</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Vegetables are harvested afternoon, grouped into farm-to-city transport corridors overnight, and delivered to your kitchen gate before your head chef begins morning mise-en-place.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Standardized Quality Grading</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Zero surprises. No Rotten vegetables hidden under top layers. All produce is classified as Grade A (Crisp, Table-Grade), Grade B (Bulk Prep/Gravy), or Premium Organic with verifiable source photos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">GST Compliant Digital Billing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Say goodbye to messy handwritten kaccha slips. Download clean monthly GST tax invoices with itemized quantities, SAC/HSN codes, and transparent logistics fee breakdowns for input tax credit.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audiences */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-10">
            Tailored for Every Bulk Food Operation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Fine Dine & Cafes</h4>
              <p className="text-xs text-slate-600">Access exotic vegetables, fresh iceberg lettuce, bell peppers, and cherry tomatoes harvested same morning.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Hostels & Messes</h4>
              <p className="text-xs text-slate-600">High-volume procurement of potatoes, onions, tomatoes, and cabbage with bulk discounts and consistent 500+ kg lots.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Corporate Cafeterias</h4>
              <p className="text-xs text-slate-600">Scheduled standing recurring orders, monthly statement reconciliations, and vendor hygiene compliance certificates.</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">Outdoor Caterers</h4>
              <p className="text-xs text-slate-600">Event-specific delivery straight to banquet hall or marriage lawn kitchen with flexible delivery slots.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-5xl mx-auto px-4 text-center">
        <div className="bg-emerald-900 text-white rounded-3xl p-10 shadow-xl">
          <h2 className="text-3xl font-extrabold mb-3">Upgrade Your Kitchen's Supply Chain</h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base mb-6">
            Join hundreds of food operators enjoying lower costs, zero broker volatility, and farm-fresh taste.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register?role=BUYER"
              className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg shadow transition-all"
            >
              Start Procuring Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
