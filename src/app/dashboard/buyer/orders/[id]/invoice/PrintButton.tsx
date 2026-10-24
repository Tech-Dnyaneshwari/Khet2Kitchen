"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs sm:text-sm flex items-center gap-1.5 shadow transition-colors"
    >
      <Printer className="h-4 w-4" /> Print / Save PDF
    </button>
  );
}
