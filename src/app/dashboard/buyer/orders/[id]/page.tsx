import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import OrderTrackingClient from "./OrderTrackingClient";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) {
    redirect(`/login?returnUrl=/dashboard/buyer/orders/${params.id}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      buyer: true,
      farmer: { include: { user: true } },
      items: true,
      delivery: { include: { transportPartner: { include: { user: true } } } },
      statusHistory: {
        include: { changedBy: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
      payment: true,
      review: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Security: only the buyer who placed it, the assigned farmer, or an admin can view
  if (session.role === "BUYER" && order.buyerId !== session.userId) {
    redirect("/dashboard/buyer/orders");
  }
  if (session.role === "FARMER") {
    const fp = await prisma.farmerProfile.findUnique({ where: { userId: session.userId } });
    if (!fp || fp.id !== order.farmerId) redirect("/dashboard/farmer/orders");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              {session.role === "BUYER" ? (
                <Link href="/dashboard/buyer/orders" className="hover:underline">
                  Orders
                </Link>
              ) : session.role === "FARMER" ? (
                <Link href="/dashboard/farmer/orders" className="hover:underline">
                  Orders
                </Link>
              ) : (
                <Link href="/dashboard/admin/orders" className="hover:underline">
                  Orders
                </Link>
              )}
              <span>/</span>
              <span className="text-slate-900 font-bold">{order.orderNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Order Tracking &amp; Verification
            </h1>
          </div>

          <Link
            href={`/dashboard/buyer/orders/${order.id}/invoice`}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs sm:text-sm self-start sm:self-auto shadow flex items-center gap-1.5"
          >
            Download GST Tax Invoice
          </Link>
        </div>

        <OrderTrackingClient
          order={{
            id: order.id,
            orderNumber: order.orderNumber,
            invoiceNumber: order.invoiceNumber,
            status: order.status,
            createdAt: order.createdAt.toISOString(),
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            platformCommission: order.platformCommission,
            taxAmount: order.taxAmount,
            totalAmount: order.totalAmount,
            fulfillmentType: order.fulfillmentType,
            preferredDeliveryDate: order.preferredDeliveryDate,
            preferredTimeSlot: order.preferredTimeSlot,
            qrPasscode: order.qrPasscode,
            cancellationReason: order.cancellationReason,
            rejectionReason: order.rejectionReason,
            farmerName: order.farmer.user.name,
            farmName: order.farmer.farmName,
            farmerPhone: order.farmer.user.phone,
            farmerLocation: `${order.farmer.village}, ${order.farmer.taluka}, ${order.farmer.district}`,
            existingReview: order.review
              ? { rating: order.review.rating, comment: order.review.comment }
              : null,
            items: order.items.map((i) => ({
              id: i.id,
              productName: i.productName,
              qualityGrade: i.qualityGrade,
              unit: i.unit,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.subtotal,
            })),
            delivery: order.delivery
              ? {
                  id: order.delivery.id,
                  status: order.delivery.status,
                  pickupAddress: order.delivery.pickupAddress,
                  deliveryAddress: order.delivery.deliveryAddress,
                  driverName: order.delivery.transportPartner?.user.name,
                  vehicleNumber: order.delivery.transportPartner?.vehicleNumber,
                  driverPhone: order.delivery.transportPartner?.user.phone,
                }
              : null,
            statusHistory: order.statusHistory.map((h) => ({
              id: h.id,
              fromStatus: h.fromStatus,
              toStatus: h.toStatus,
              changedByName: h.changedBy.name,
              changedByRole: h.changedBy.role,
              note: h.note,
              createdAt: h.createdAt.toISOString(),
            })),
          }}
          userRole={session.role}
        />
      </div>
    </div>
  );
}
