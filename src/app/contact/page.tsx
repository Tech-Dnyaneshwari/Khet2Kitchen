"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "GENERAL",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setStatusMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setStatus("success");
      setStatusMsg("Thank you! Your inquiry has been received. Ticket reference logged.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "GENERAL",
        message: "",
      });
    } catch (err: any) {
      setStatus("error");
      setStatusMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            We are here to assist
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">Contact & Field Support</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Reach out to our field operations team, mandi support liaisons, or commercial kitchen customer managers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Contact Details & Corridors */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Direct Helpdesk</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Toll-Free Kisan & Buyer Helpline</span>
                    <a href="tel:18002008899" className="text-emerald-700 hover:underline font-mono">
                      1800-200-8899
                    </a>
                    <span className="text-xs text-slate-400 block">Daily 5:00 AM – 9:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Operational Inquiries</span>
                    <a href="mailto:support@k2k.in" className="text-emerald-700 hover:underline">
                      support@k2k.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Kitchen Dispatch Window</span>
                    <span className="text-xs text-slate-600">06:00 AM to 09:30 AM (All 7 days)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Regional Transit Yards</h3>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="border-l-2 border-emerald-500 pl-3">
                  <span className="font-bold text-slate-800 block text-sm">Narayangaon Primary Yard</span>
                  <span>Pune-Nashik Highway, Narayangaon, Taluka Junnar, Pune 410504</span>
                </div>
                <div className="border-l-2 border-emerald-500 pl-3">
                  <span className="font-bold text-slate-800 block text-sm">Pune City Kitchen Depot</span>
                  <span>Market Yard Corridor, Gultekdi Industrial Area, Pune 411037</span>
                </div>
                <div className="border-l-2 border-emerald-500 pl-3">
                  <span className="font-bold text-slate-800 block text-sm">Nashik Agri Cross</span>
                  <span>Dindori Road Logistics Terminal, Nashik 422004</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Send an Official Message</h3>
              <p className="text-xs text-slate-500 mb-6">
                Our regional field officers respond within 4 business hours.
              </p>

              {status === "success" && (
                <div className="p-4 mb-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 mb-6 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Kulkarni"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9822012345"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ramesh@hotelspice.in"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="GENERAL">General Platform Inquiry</option>
                      <option value="FARMER">Farmer Onboarding & 7/12</option>
                      <option value="BUYER">Commercial Kitchen Sourcing</option>
                      <option value="TRANSPORT">Fleet Logistics & Rates</option>
                      <option value="BILLING">Billing / Invoicing / GST</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of your question"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message Details *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your daily requirement or harvest lot..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
                >
                  {loading ? (
                    <span>Submitting ticket...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
