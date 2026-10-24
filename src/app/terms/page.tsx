import React from "react";
import Link from "next/link";
import { FileCheck2, Scale, AlertTriangle, CheckCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Commercial Terms of Service</h1>
              <p className="text-xs text-slate-500">Khet2Kitchen B2B Agricultural Procurement Framework • Pune Jurisdiction</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6">
            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">1. Direct Farm-to-Kitchen Relationship</h3>
              <p>
                Khet2Kitchen serves as an enabling electronic platform connecting primary agricultural producers (“Farmers”) with commercial institutional food establishments (“Buyers”). The ownership of produce transfers directly from the farmer to the buyer upon receipt and verification at the delivery destination.
              </p>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">2. Pricing, Commission & Invoicing</h3>
              <p>
                Listing rates are determined autonomously by the producing farmer. Khet2Kitchen charges an explicit, transparent platform service commission (standard 3.0% of produce subtotal) to facilitate order matching, logistics coordination, and software operation. No hidden deductions or unsolicited mandi brokerage shall be levied.
              </p>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">3. Quality Inspection and Acceptance</h3>
              <p>
                Buyers or their receiving staff must perform visual inspection and crate weighment at the time of delivery. Acceptance of delivery constitutes confirmation that the supplied produce matches the designated quality grade (Grade A / Grade B / Premium).
              </p>
              <p className="mt-1">
                Discrepancies exceeding 5% in moisture loss or spoilage must be registered via the Support ticket module within 4 hours of physical gate receipt to qualify for credit note adjustments.
              </p>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">4. Order Cancellation Policy</h3>
              <p>
                A commercial order may be cancelled without penalty while its state is <code>PENDING_FARMER_CONFIRMATION</code>. Once an order is <code>ACCEPTED</code> or <code>PREPARING</code>, cancellation is restricted to protect the farmer against harvested perishable loss.
              </p>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">5. Transportation & Liability</h3>
              <p>
                Where Khet2Kitchen fleet transportation is selected, logistics partners are contractually required to maintain cargo ventilation and adhere to the scheduled 6:00 AM – 9:00 AM delivery window. Liability for severe transit accidents or unmitigated delay is governed by standard commercial transport carrier guidelines.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Arbitration & Jurisdiction: Pune, Maharashtra</span>
            <Link href="/" className="text-emerald-700 font-bold hover:underline">
              ← Return to Khet2Kitchen Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
