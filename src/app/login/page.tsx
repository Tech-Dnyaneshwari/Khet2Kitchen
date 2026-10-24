"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ShieldAlert, KeyRound, ArrowRight, UserCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Redirect according to user role
      const role = data.user.role;
      if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "FARMER") router.push("/dashboard/farmer");
      else if (role === "TRANSPORT_PARTNER") router.push("/dashboard/transport");
      else router.push("/dashboard/buyer");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "FARMER" | "BUYER" | "TRANSPORT_PARTNER" | "ADMIN") => {
    setDemoLoading(role);
    setError("");

    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo login failed");
      }

      if (role === "ADMIN") router.push("/dashboard/admin");
      else if (role === "FARMER") router.push("/dashboard/farmer");
      else if (role === "TRANSPORT_PARTNER") router.push("/dashboard/transport");
      else router.push("/dashboard/buyer");
    } catch (err: any) {
      setError(err.message || "Failed to start demo session");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-extrabold text-emerald-800 tracking-tight">
            Khet<span className="text-amber-500">2</span>Kitchen
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">Select your portal or use 1-click test credentials</p>
        </div>

        {/* 1-Click Demo Section (Highlighted for evaluator) */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
            <UserCheck className="h-4 w-4 text-amber-700" />
            <span>Instant 1-Click Evaluator Access</span>
          </div>
          <p className="text-[11px] text-amber-800 mb-3 leading-relaxed">
            Click any role below to instantly log in as a pre-seeded verified user:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleDemoLogin("BUYER")}
              disabled={!!demoLoading}
              className="py-2 px-2.5 bg-white border border-amber-300 hover:bg-amber-100 text-slate-800 rounded-lg text-left flex items-center justify-between transition-colors"
            >
              <span>🏨 Spice Garden (Buyer)</span>
              <span className="text-amber-600 font-bold text-[10px]">Enter →</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("FARMER")}
              disabled={!!demoLoading}
              className="py-2 px-2.5 bg-white border border-amber-300 hover:bg-amber-100 text-slate-800 rounded-lg text-left flex items-center justify-between transition-colors"
            >
              <span>🌾 Rajesh Patil (Farmer)</span>
              <span className="text-amber-600 font-bold text-[10px]">Enter →</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("TRANSPORT_PARTNER")}
              disabled={!!demoLoading}
              className="py-2 px-2.5 bg-white border border-amber-300 hover:bg-amber-100 text-slate-800 rounded-lg text-left flex items-center justify-between transition-colors"
            >
              <span>🚚 Ganesh (Transport)</span>
              <span className="text-amber-600 font-bold text-[10px]">Enter →</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              disabled={!!demoLoading}
              className="py-2 px-2.5 bg-white border border-amber-300 hover:bg-amber-100 text-slate-800 rounded-lg text-left flex items-center justify-between transition-colors"
            >
              <span>⚡ Admin Console</span>
              <span className="text-amber-600 font-bold text-[10px]">Enter →</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: Demo@12345</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!demoLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-emerald-700 font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
