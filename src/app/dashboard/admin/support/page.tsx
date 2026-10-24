import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Mail, Phone, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/support");
  }

  const tickets = await prisma.supportTicket.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/dashboard/admin" className="hover:underline">Admin Console</Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">Support Queue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Platform Support Tickets</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            INQUIRIES & DISPUTES ({tickets.length})
          </div>

          {tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No support tickets logged. Clean operational queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 sm:p-6 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{t.subject}</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {t.category}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                        {t.status}
                      </span>
                    </div>

                    <span className="text-slate-400 text-[11px]">
                      {new Date(t.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                    {t.message}
                  </p>

                  <div className="text-slate-500 text-[11px] flex gap-4">
                    <span>Sender: <strong>{t.user.name}</strong></span>
                    <span>Email: {t.user.email}</span>
                    <span>Role: {t.user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
