import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Clock, User, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?returnUrl=/dashboard/admin/audit-logs");
  }

  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href="/dashboard/admin" className="hover:underline">Admin Console</Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">System Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Security & Operational Audit Ledger</h1>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            AUDIT EVENTS (LAST {logs.length})
          </div>

          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 sm:p-6 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      Target: <strong>{log.entityType}</strong> {log.entityId ? `(#${log.entityId.slice(0, 8)})` : ""}
                    </span>
                  </div>

                  {log.detailsJson && (
                    <p className="text-slate-600 mt-1 font-mono text-[11px] max-w-2xl bg-slate-50 p-1.5 rounded border border-slate-200/50">
                      {log.detailsJson}
                    </p>
                  )}
                </div>

                <div className="text-right text-slate-400 text-[11px] shrink-0">
                  <span className="text-slate-700 font-semibold block">
                    {log.user ? `${log.user.name} (${log.user.role})` : "Automated Engine"}
                  </span>
                  <span>{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
