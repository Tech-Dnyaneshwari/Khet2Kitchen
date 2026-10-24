import React from 'react';
import Link from 'next/link';
import { Tractor, Store, ShieldCheck, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 print:hidden mt-auto">
      {/* Demonstration Banner */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/60 py-2.5 px-4 text-center text-[11px] text-emerald-300">
        <span className="font-bold">⚠️ Demonstration Mode Notice:</span> All farmer profiles, ratings, and market savings claims on this deployment are illustrative demonstration data designed for comprehensive platform testing.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Value Prop */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl">🌾</span>
              <span className="font-extrabold text-lg tracking-tight">
                Khet<span className="text-emerald-500">2</span>Kitchen
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Direct B2B Farm-to-Business Agricultural Marketplace. Connecting verified Indian agricultural growers with commercial kitchens with 0% broker deductions.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                FARMER → LOGISTICS → KITCHEN
              </span>
            </div>
          </div>

          {/* For Growers */}
          <div>
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider mb-3">For Farmers & FPOs</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/for-farmers" className="hover:text-emerald-400 transition-colors">
                  0% APMC Broker Deductions
                </Link>
              </li>
              <li>
                <Link href="/for-farmers" className="hover:text-emerald-400 transition-colors">
                  Electronic Weighbridge Certification
                </Link>
              </li>
              <li>
                <Link href="/for-farmers" className="hover:text-emerald-400 transition-colors">
                  Direct Escrow Bank Payouts
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors">
                  Free Farm Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* For Commercial Kitchens */}
          <div>
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider mb-3">For Commercial Buyers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/for-restaurants" className="hover:text-emerald-400 transition-colors">
                  Restaurants & Hotel Sourcing
                </Link>
              </li>
              <li>
                <Link href="/for-restaurants" className="hover:text-emerald-400 transition-colors">
                  Hostel & College Mess Procurement
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-emerald-400 transition-colors">
                  Grade A Uniform Quality Sourcing
                </Link>
              </li>
              <li>
                <Link href="/transportation" className="hover:text-emerald-400 transition-colors">
                  K2K Fleet GPS Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Hubs & Contact */}
          <div>
            <h4 className="text-white font-bold uppercase text-[11px] tracking-wider mb-3">Regional Hubs</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Direct farm gate dispatches active across Junnar, Otur, Narayangaon, Niphad, Nashik, and Satara agricultural corridors.
            </p>
            <div className="mt-3 space-y-1 text-slate-300">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> +91 20 2554 8890
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" /> contact@khet2kitchen.in
              </p>
            </div>
          </div>
        </div>

        {/* Legal & Links */}
        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Khet2Kitchen Agro Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
