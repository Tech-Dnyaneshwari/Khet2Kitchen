"use client";

import React, { useState } from "react";
import { Sprout, ShieldCheck, Star, Edit3, Save, X, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pinCode: string;
  landSizeAcres: number;
  primaryCrops: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankName: string;
  isVerified: boolean;
  verificationStatus: string;
  rating: number;
  reviewsCount: number;
}

interface Review {
  id: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Props {
  initialProfile: ProfileData;
  reviews: Review[];
}

export default function FarmerProfileClient({ initialProfile, reviews }: Props) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Edit form state
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [farmName, setFarmName] = useState(profile.farmName);
  const [village, setVillage] = useState(profile.village);
  const [taluka, setTaluka] = useState(profile.taluka);
  const [district, setDistrict] = useState(profile.district);
  const [pinCode, setPinCode] = useState(profile.pinCode);
  const [primaryCrops, setPrimaryCrops] = useState(profile.primaryCrops);
  const [landSizeAcres, setLandSizeAcres] = useState(profile.landSizeAcres.toString());
  const [bankAccountNo, setBankAccountNo] = useState(profile.bankAccountNo);
  const [bankIfsc, setBankIfsc] = useState(profile.bankIfsc);
  const [bankName, setBankName] = useState(profile.bankName);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          farmName,
          village,
          taluka,
          district,
          pinCode,
          primaryCrops,
          landSizeAcres: parseFloat(landSizeAcres) || 0,
          bankAccountNo,
          bankIfsc,
          bankName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setProfile((prev) => ({
        ...prev,
        name,
        phone,
        farmName,
        village,
        taluka,
        district,
        pinCode,
        primaryCrops,
        landSizeAcres: parseFloat(landSizeAcres) || 0,
        bankAccountNo,
        bankIfsc,
        bankName,
      }));
      setEditing(false);
      setStatus("success");
      setMessage("Profile updated successfully.");
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile.name);
    setPhone(profile.phone);
    setFarmName(profile.farmName);
    setVillage(profile.village);
    setTaluka(profile.taluka);
    setDistrict(profile.district);
    setPinCode(profile.pinCode);
    setPrimaryCrops(profile.primaryCrops);
    setLandSizeAcres(profile.landSizeAcres.toString());
    setBankAccountNo(profile.bankAccountNo);
    setBankIfsc(profile.bankIfsc);
    setBankName(profile.bankName);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {status === "success" && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}
      {status === "error" && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Farm Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              {editing ? (
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="text-xl font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold text-slate-900">{profile.farmName}</h2>
              )}
              <p className="text-xs text-slate-500 mt-0.5">
                Kisan: <strong>{profile.name}</strong> • Registered Agricultural Producer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile.isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> 7/12 Land Extract Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
                Verification: {profile.verificationStatus}
              </span>
            )}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
                >
                  <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-xs">
          {/* Name */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Farmer Full Name</span>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-bold text-slate-900 text-sm">{profile.name}</span>
            )}
          </div>

          {/* Phone */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Mobile Number</span>
            {editing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-bold text-slate-900 text-sm">{profile.phone}</span>
            )}
          </div>

          {/* Village */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Village / Gaon</span>
            {editing ? (
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-bold text-slate-900 text-sm">{profile.village}</span>
            )}
          </div>

          {/* Taluka & District */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Taluka & District</span>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder="Taluka"
                  className="w-1/2 font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                />
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="w-1/2 font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                />
              </div>
            ) : (
              <span className="font-bold text-slate-900 text-sm">
                Taluka {profile.taluka}, {profile.district}
              </span>
            )}
          </div>

          {/* Primary Crops */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Primary Harvest Crops</span>
            {editing ? (
              <input
                type="text"
                value={primaryCrops}
                onChange={(e) => setPrimaryCrops(e.target.value)}
                placeholder="Tomato, Onion, Potato"
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-medium text-slate-900 text-sm">{profile.primaryCrops}</span>
            )}
          </div>

          {/* Land Size */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Cultivable Land (Acres)</span>
            {editing ? (
              <input
                type="number"
                value={landSizeAcres}
                onChange={(e) => setLandSizeAcres(e.target.value)}
                min="0"
                step="0.5"
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-bold text-emerald-700 text-sm">
                {profile.landSizeAcres > 0 ? `${profile.landSizeAcres} Acres` : "Not specified"}
              </span>
            )}
          </div>

          {/* Rating */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Marketplace Rating</span>
            <span className="font-bold text-amber-600 text-sm flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              {profile.rating.toFixed(1)} / 5.0 ({profile.reviewsCount} reviews)
            </span>
          </div>

          {/* Email (read-only) */}
          <div>
            <span className="text-slate-400 block font-medium mb-1">Email Address</span>
            <span className="font-medium text-slate-700 text-sm">{profile.email}</span>
            <span className="text-[10px] text-slate-400 block">Cannot be changed</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Bank Settlement Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-slate-400 block font-medium mb-1">Bank Name</span>
            {editing ? (
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="State Bank of India"
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-bold text-slate-900 text-sm">{profile.bankName || "Not set"}</span>
            )}
          </div>
          <div>
            <span className="text-slate-400 block font-medium mb-1">Account Number</span>
            {editing ? (
              <input
                type="text"
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
                placeholder="Account number"
                className="w-full font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-mono font-bold text-slate-900 text-sm">
                {profile.bankAccountNo ? `••••${profile.bankAccountNo.slice(-4)}` : "Not set"}
              </span>
            )}
          </div>
          <div>
            <span className="text-slate-400 block font-medium mb-1">IFSC Code</span>
            {editing ? (
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                placeholder="SBIN0001245"
                className="w-full font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-mono font-bold text-slate-900 text-sm">{profile.bankIfsc || "Not set"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Reviews from Commercial Kitchens */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Reviews from Commercial Kitchens</h3>
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500">
            Eligible commercial buyers leave ratings after completed dispatches. Ratings will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">{r.buyerName}</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                    <span className="ml-1">{r.rating} / 5</span>
                  </span>
                </div>
                {r.comment && (
                  <p className="text-slate-600 italic mt-1">"{r.comment}"</p>
                )}
                <p className="text-slate-400 text-[11px] mt-1.5">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
