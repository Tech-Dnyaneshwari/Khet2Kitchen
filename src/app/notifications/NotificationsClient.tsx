"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Package, Truck, Star, AlertCircle, Info, BellOff } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string;
}

interface Props {
  initialNotifications: Notification[];
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "ORDER_UPDATE":
      return <Package className="h-4 w-4 text-emerald-600" />;
    case "DELIVERY_UPDATE":
      return <Truck className="h-4 w-4 text-blue-600" />;
    case "REVIEW":
      return <Star className="h-4 w-4 text-amber-500" />;
    case "SYSTEM":
      return <Info className="h-4 w-4 text-slate-500" />;
    default:
      return <Bell className="h-4 w-4 text-slate-500" />;
  }
}

export default function NotificationsClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadIds.length === 0) return;
    setLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <BellOff className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No notifications yet</h3>
        <p className="text-sm text-slate-500 mt-1">
          When orders are placed or updated, you'll see alerts here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <span className="text-xs font-semibold text-slate-600">
          {unreadIds.length} unread of {notifications.length} total
        </span>
        {unreadIds.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.map((notification) => {
          const content = (
            <div
              key={notification.id}
              className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors ${
                !notification.isRead ? "bg-emerald-50/30" : ""
              }`}
              onClick={() => !notification.isRead && handleMarkRead(notification.id)}
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  !notification.isRead
                    ? "bg-emerald-100"
                    : "bg-slate-100"
                }`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm leading-tight ${
                      !notification.isRead
                        ? "font-bold text-slate-900"
                        : "font-semibold text-slate-700"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {new Date(notification.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );

          if (notification.linkUrl) {
            return (
              <Link
                key={notification.id}
                href={notification.linkUrl}
                className="block"
                onClick={() => !notification.isRead && handleMarkRead(notification.id)}
              >
                {content}
              </Link>
            );
          }

          return <div key={notification.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
