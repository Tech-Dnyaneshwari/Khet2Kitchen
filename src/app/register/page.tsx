"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCheck, ShieldAlert, CheckCircle2, Sprout, UtensilsCrossed, Truck } from "lucide-react";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role") || "BUYER";

  const [role, setRole] = useState<"BUYER" | "FARMER" | "TRANSPORT_PARTNER">(
    requestedRole === "FARMER" ? "FARMER" : requestedRole === "TRANSPORT_PARTNER" ? "TRANSPORT_PARTNER" : "BUYER"
  );

  useEffect(() => {
    if (requestedRole === "FARMER" || requestedRole === "TRANSPORT_PARTNER" || requestedRole === "BUYER") {
      setRole(requestedRole as any);
    }
  }, [requestedRole]);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Farmer specific
  const [farmName, setFarmName] = useState("");
  const [village, setVillage] = useState("");
  const [taluka, setTaluka] = useState("");
  const [district, setDistrict] = useState("Pune");
  const [primaryCrops, setPrimaryCrops] = useState("Tomato, Onion, Cauliflower");

  // Buyer specific
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("RESTAURANT");
  const [city, setCity] = useState("Pune");
  const [gstin, setGstin] = useState("");

  // Transport specific
  const [vehicleType, setVehicleType] = useState("MINI_TRUCK");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [maxPayloadKg, setMaxPayloadKg] = useState("1200");
  const [drivingLicenseNo, setDrivingLicenseNo] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: any = {
      name,
      email,
      phone,
      password,
      role,
    };

    if (role === "FARMER") {
      payload.farmName = farmName || `${name}'s Farm`;
      payload.village = village || "Otur";
      payload.taluka = taluka || "Junnar";
      payload.district = district || "Pune";
      payload.primaryCrops = primaryCrops;
    } else if (role === "BUYER") {
      payload.businessName = businessName || `${name}'s Kitchen`;
      payload.businessType = businessType;
      payload.city = city || "Pune";
      if (gstin) payload.gstin = gstin;
    } else if (role === "TRANSPORT_PARTNER") {
      payload.vehicleType = vehicleType;
      payload.vehicleNumber = vehicleNumber || "MH-12-TR-9999";
      payload.maxPayloadKg = parseFloat(maxPayloadKg) || 1200;
      payload.drivingLicenseNo = drivingLicenseNo || "MH1220200012345";
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (role === "FARMER") router.push("/dashboard/farmer");
      else if (role === "TRANSPORT_PARTNER") router.push("/dashboard/transport");
      else router.push("/dashboard/buyer");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-extrabold text-emerald-800 tracking-tight">
            Khet<span className="text-amber-500">2</span>Kitchen
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Create your direct B2B account</h2>
          <p className="text-xs text-slate-500 mt-1">Select your stakeholder profile to customize your experience</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1.5 rounded-xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole("BUYER")}
            className={`py-2.5 px-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
              role === "BUYER" ? "bg-white text-emerald-800 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Commercial Buyer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("FARMER")}
            className={`py-2.5 px-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
              role === "FARMER" ? "bg-white text-emerald-800 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sprout className="h-4 w-4" />
            <span>Farmer / Kisan</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("TRANSPORT_PARTNER")}
            className={`py-2.5 px-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
              role === "TRANSPORT_PARTNER" ? "bg-white text-emerald-800 shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Transport Partner</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {role === "FARMER" ? "Farmer Full Name *" : "Representative Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Patil"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9822100000"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password (Min 6 chars) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === "BUYER" && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Commercial Kitchen Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Establishment / Business Name *</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Spice Garden Restaurant"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Establishment Type *</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="RESTAURANT">Restaurant / Fine Dine</option>
                      <option value="HOTEL">Hotel & Resort</option>
                      <option value="HOSTEL">College / University Hostel</option>
                      <option value="MESS">Student / Workers Mess</option>
                      <option value="CANTEEN">Corporate / Factory Canteen</option>
                      <option value="CATERER">Outdoor Catering Business</option>
                      <option value="HOSPITAL">Hospital Dietary Kitchen</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune / PCMC"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN (Optional for small mess)</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AAAAA0000A1Z5"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === "FARMER" && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Farm Location & Crops</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Farm / Shet Name *</label>
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Patil Krishi Farm"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Gaon *</label>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Narayangaon / Otur"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Taluka *</label>
                    <input
                      type="text"
                      required
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      placeholder="e.g. Junnar, Khed, Ambegaon"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Pune, Nashik, Ahmednagar"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Major Crops Harvested</label>
                  <input
                    type="text"
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    placeholder="Tomato, Onion, Cabbage, Cauliflower"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {role === "TRANSPORT_PARTNER" && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Vehicle & Driver Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type *</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="MINI_TRUCK">Tata Ace / Dost (Up to 1.5T)</option>
                      <option value="PICKUP">Bolero Maxi Truck (Up to 2.5T)</option>
                      <option value="TRUCK_MEDIUM">Eicher 14ft (Up to 5T)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Registration Number *</label>
                    <input
                      type="text"
                      required
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="MH-12-QE-4521"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Payload Capacity (kg) *</label>
                    <input
                      type="number"
                      required
                      value={maxPayloadKg}
                      onChange={(e) => setMaxPayloadKg(e.target.value)}
                      placeholder="1200"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Commercial Driving License No *</label>
                    <input
                      type="text"
                      required
                      value={drivingLicenseNo}
                      onChange={(e) => setDrivingLicenseNo(e.target.value.toUpperCase())}
                      placeholder="MH1420180004921"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow"
            >
              {loading ? <span>Creating verified profile...</span> : <span>Complete Registration</span>}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="text-emerald-700 font-bold hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-xs text-slate-500">Loading registration portal...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
