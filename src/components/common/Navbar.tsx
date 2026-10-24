'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tractor,
  Store,
  Truck,
  ShieldCheck,
  ShoppingCart,
  Menu,
  X,
  Languages,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentUser?: {
    userId: string;
    name: string;
    email: string;
    role: 'FARMER' | 'BUYER' | 'TRANSPORT_PARTNER' | 'ADMIN';
  } | null;
  cartCount?: number;
}

export default function Navbar({ currentUser, cartCount = 0 }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleDemoLogin = async (role: 'farmer' | 'buyer' | 'transport' | 'admin') => {
    setIsSwitching(true);
    try {
      const emailMap = {
        farmer: 'farmer@k2k.in',
        buyer: 'buyer@k2k.in',
        transport: 'transport@k2k.in',
        admin: 'admin@k2k.in',
      };
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailMap[role] }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(data.redirectUrl || '/');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const roleBadgeConfig = {
    FARMER: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Tractor, label: 'Farmer' },
    BUYER: { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: Store, label: 'Buyer' },
    TRANSPORT_PARTNER: { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Truck, label: 'Fleet' },
    ADMIN: { bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: ShieldCheck, label: 'Admin' },
  };

  const activeBadge = currentUser ? roleBadgeConfig[currentUser.role] : null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Demo Bar */}
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Testing:
            </span>
            <span className="text-slate-400 hidden sm:inline">Switch between roles instantly:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleDemoLogin('farmer')}
              disabled={isSwitching}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                currentUser?.role === 'FARMER'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Tractor className="w-3 h-3 text-emerald-400" />
              Farmer
            </button>
            <button
              onClick={() => handleDemoLogin('buyer')}
              disabled={isSwitching}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                currentUser?.role === 'BUYER'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Store className="w-3 h-3 text-blue-400" />
              Buyer
            </button>
            <button
              onClick={() => handleDemoLogin('transport')}
              disabled={isSwitching}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                currentUser?.role === 'TRANSPORT_PARTNER'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Truck className="w-3 h-3 text-amber-400" />
              Fleet
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={isSwitching}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 p-2 text-white flex items-center justify-center font-extrabold shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🌾</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    Khet<span className="text-emerald-600">2</span>Kitchen
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
                    B2B
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">
                  Farm Direct to Kitchens
                </span>
              </div>
            </Link>

            {/* Current Role Badge */}
            {activeBadge && (
              <span
                className={`hidden md:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${activeBadge.bg}`}
              >
                <activeBadge.icon className="w-3 h-3" />
                {activeBadge.label} Mode
              </span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <Link href="/explore" className="hover:text-emerald-600 transition-colors">
              Explore Produce
            </Link>
            <Link href="/how-it-works" className="hover:text-emerald-600 transition-colors">
              How It Works
            </Link>
            <Link href="/for-farmers" className="hover:text-emerald-600 transition-colors">
              For Farmers
            </Link>
            <Link href="/for-restaurants" className="hover:text-emerald-600 transition-colors">
              For Kitchens
            </Link>
            <Link href="/transportation" className="hover:text-emerald-600 transition-colors">
              Logistics
            </Link>
            <Link href="/about" className="hover:text-emerald-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-emerald-600 transition-colors">
              Support
            </Link>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Select Language"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
                  {['English', 'हिन्दी (Hindi)', 'मराठी (Marathi)'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setCurrentLang(lang.split(' ')[0]);
                        setLangMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Button for Buyer */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-emerald-800 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Dashboard Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline font-bold text-slate-900 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href={
                          currentUser.role === 'FARMER'
                            ? '/dashboard/farmer'
                            : currentUser.role === 'BUYER'
                            ? '/dashboard/buyer'
                            : currentUser.role === 'TRANSPORT_PARTNER'
                            ? '/dashboard/transport'
                            : '/dashboard/admin'
                        }
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                      >
                        Go to Dashboard
                      </Link>
                      <Link
                        href="/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                      >
                        🔔 Notifications
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 p-4 space-y-3">
          <nav className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              Explore Produce
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              How It Works
            </Link>
            <Link
              href="/for-farmers"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              For Farmers
            </Link>
            <Link
              href="/for-restaurants"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              For Kitchens
            </Link>
            <Link
              href="/transportation"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              Logistics
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              About K2K
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50"
            >
              Contact Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
