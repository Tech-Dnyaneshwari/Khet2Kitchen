import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck, Package, Truck, Star, AlertCircle, Info } from "lucide-react";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?returnUrl=/notifications");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const backUrl =
    session.role === "ADMIN"
      ? "/dashboard/admin"
      : session.role === "FARMER"
      ? "/dashboard/farmer"
      : session.role === "TRANSPORT_PARTNER"
      ? "/dashboard/transport"
      : "/dashboard/buyer";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Link href={backUrl} className="hover:underline">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">Notifications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="h-7 w-7 text-emerald-600" />
              Activity & Alerts
            </h1>
          </div>
        </div>

        <NotificationsClient
          initialNotifications={notifications.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            linkUrl: n.linkUrl || null,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
