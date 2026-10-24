"use client";

import React, { useState } from "react";
import { Building2, ShieldCheck, MapPin, Edit3, Save, X, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  contactPerson: string;
  gstin: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  isVerified: boolean;
  verificationStatus: string;
  monthlyProcurementSpent: number;
}

interface AddressItem {
  id: string;
  label: string;
  street: string;
  city: string;
  district: string;
  pinCode: string;
  isDefault: boolean;
}

interface Props {
  initialProfile: ProfileData;
  addresses: AddressItem[];
}

const BUSINESS_TYPES: Record<string, string> = {
  RESTAURANT: "Restaurant / Fine Dine",
  HOTEL: "Hotel & Resort",
  MESS: "Student / Workers Mess",
  HOSTEL: "College / University Hostel",
  CANTEEN: "Corporate / Factory Canteen",
  CATERER: "Outdoor Catering Business",
  OTHER: "Other",
};

export default function BuyerProfileClient({ initialProfile, addresses }: Props) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Edit form state
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [businessType, setBusinessType] = useState(profile.businessType);
  const [contactPerson, setContactPerson] = useState(profile.contactPerson);
  const [gstin, setGstin] = useState(profile.gstin);
  const [city, setCity] = useState(profile.city);
  const [district, setDistrict] = useState(profile.district);
  const [pinCode, setPinCode] = useState(profile.pinCode);

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
          businessName,
          businessType,
          contactPerson,
          gstin,
          city,
          district,
          pinCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setProfile((prev) => ({
        ...prev,
        name,
        phone,
        businessName,
        businessType,
        contactPerson,
        gstin,
        city,
        district,
        pinCode,
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
    setBusinessName(profile.businessName);
    setBusinessType(profile.businessType);
    setContactPerson(profile.contactPerson);
    setGstin(profile.gstin);
    setCity(profile.city);
    setDistrict(profile.district);
    setPinCode(profile.pinCode);
    setEditing(false);
  };

  return (
    <div className="space-y-6">
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

      {/* Main Business Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              {editing ? (
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="text-xl font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold text-slate-900">{profile.businessName}</h2>
              )}
              <p className="text-xs text-slate-500">
                {BUSINESS_TYPES[profile.businessType] || profile.businessType} • Registered B2B Buyer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile.isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> GST Verified Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
                {profile.verificationStatus === "PENDING" ? "Verification Pending" : profile.verificationStatus}
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
                  <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
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
          <div>
            <span className="text-slate-400 block font-medium mb-1">Representative Name</span>
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
              <span className="font-mono font-bold text-slate-900 text-sm">{profile.phone}</span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Contact Person</span>
            {editing ? (
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-bold text-slate-900 text-sm">{profile.contactPerson}</span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">GSTIN</span>
            {editing ? (
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="27AAAAA0000A1Z5"
                className="w-full font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            ) : (
              <span className="font-mono font-bold text-slate-900 text-sm">
                {profile.gstin || "Not provided"}
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Establishment Type</span>
            {editing ? (
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              >
                {Object.entries(BUSINESS_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            ) : (
              <span className="font-bold text-slate-900 text-sm">
                {BUSINESS_TYPES[profile.businessType] || profile.businessType}
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">City & District</span>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
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
                {profile.city}, {profile.district}, {profile.state}
              </span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Email Address</span>
            <span className="font-medium text-slate-700 text-sm">{profile.email}</span>
            <span className="text-[10px] text-slate-400 block">Cannot be changed</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium mb-1">Total Procurement Volume</span>
            <span className="font-bold text-emerald-700 text-sm">
              ₹{profile.monthlyProcurementSpent.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Addresses */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">Designated Kitchen Receiving Docks</h3>
        {addresses.length === 0 ? (
          <p className="text-xs text-slate-500">No delivery addresses found. Contact support to add delivery locations.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between text-xs"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{address.label}</span>
                      {address.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          Primary Loading Dock
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mt-1">
                      {address.street}, {address.city}, {address.district} — {address.pinCode}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
