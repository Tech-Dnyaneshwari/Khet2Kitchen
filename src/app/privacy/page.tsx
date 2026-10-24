import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Privacy & Data Governance Policy</h1>
              <p className="text-xs text-slate-500">Effective Date: October 2026 • Version 2.4 (B2B Commercial Standard)</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6">
            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">1. Scope and Applicability</h3>
              <p>
                Khet2Kitchen (“Platform”, “we”, “our”) operates a B2B agricultural sourcing exchange linking verified farmers with commercial food businesses (restaurants, hotels, messes, catering organizations). This Privacy Policy explains how we collect, process, and secure user information across all web interfaces and API endpoints.
              </p>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">2. Information We Collect</h3>
              <p>Depending on your role, we collect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Farmer Partners:</strong> Full name, telephone number, 7/12 land registry extract or survey number, farm geographical coordinates, crop harvest schedules, and bank account IFSC details for NEFT/IMPS payout settlements.</li>
                <li><strong>Commercial Kitchen Buyers:</strong> Establishment trade name, FSSAI / GSTIN registration certificates, kitchen receiving dock addresses, procurement manager contact details, and order history.</li>
                <li><strong>Transport Fleet Partners:</strong> Driver commercial license number, vehicle registration number, permit documents, and transit location telemetry.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">3. Utilization of Data</h3>
              <p>
                Data is strictly processed to execute agricultural sales transactions, calculate transparent freight distances, issue GST tax invoices, and prevent duplicate or fraudulent farm listings. We do not sell your personal, operational, or pricing data to third-party marketing brokers.
              </p>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">4. Payment & Banking Security</h3>
              <p>
                All bank account credentials and settlement records are transmitted through encrypted SSL/TLS channels and stored in accordance with RBI merchant settlement directives. We do not retain buyer credit card or UPI MPIN credentials.
              </p>
            </section>

            <section>
              <h3 className="text-base font-bold text-slate-900 mb-2">5. Data Retention & Deletion Rights</h3>
              <p>
                Commercial users may request profile deactivation at any time. Financial transaction records and tax invoices are retained for 7 years to comply with Indian Goods and Services Tax (GST) and accounting statutory requirements.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Inquiries: legal@k2k.in</span>
            <Link href="/" className="text-emerald-700 font-bold hover:underline">
              ← Return to Khet2Kitchen Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
