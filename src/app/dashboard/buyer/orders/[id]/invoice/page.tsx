import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const session = await getSessionUser();
  if (!session) {
    redirect(`/login?returnUrl=/dashboard/buyer/orders/${params.id}/invoice`);
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      buyer: { include: { businessProfile: true } },
      farmer: { include: { user: true } },
      items: true,
      delivery: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation & Print Action */}
        <div className="flex justify-between items-center mb-6 no-print">
          <Link
            href={`/dashboard/buyer/orders/${order.id}`}
            className="text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            ← Back to Order Tracking
          </Link>

          <PrintButton />
        </div>

        {/* Invoice Paper Canvas */}
        <div
          id="printable-invoice"
          className="bg-white rounded-xl shadow-lg border border-slate-300 p-8 sm:p-12 text-slate-800"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6">
            <div>
              <div className="text-2xl font-black text-emerald-800 tracking-tight">
                Khet<span className="text-amber-500">2</span>Kitchen
              </div>
              <p className="text-xs text-slate-500 mt-1">Direct Farm-to-Business Agricultural Marketplace</p>
              <p className="text-[11px] text-slate-400">
                GSTIN: 27AABCK2938Q1Z4 • PAN: AABCK2938Q • Pune Hub, Maharashtra
              </p>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded">
                TAX INVOICE
              </span>
              <div className="font-mono font-bold text-sm text-slate-900 mt-2">{order.invoiceNumber}</div>
              <div className="text-xs text-slate-500">
                Date: {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </div>
              <div className="text-xs text-slate-500">Order Ref: {order.orderNumber}</div>
            </div>
          </div>

          {/* Supplier & Recipient Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
            {/* Farmer */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Primary Producer / Supplier
              </span>
              <div className="font-bold text-slate-900 text-sm">{order.farmer.farmName}</div>
              <div className="text-slate-600">Farmer: {order.farmer.user.name}</div>
              <div className="text-slate-600">
                Location: {order.farmer.village}, Taluka {order.farmer.taluka}, Dist {order.farmer.district}
              </div>
              <div className="text-slate-600">State: Maharashtra (State Code 27)</div>
              <div className="text-slate-600 font-mono">Mobile: {order.farmer.user.phone}</div>
            </div>

            {/* Buyer */}
            <div className="sm:text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (Commercial Buyer)
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {order.buyer.businessProfile?.businessName || order.buyer.name}
              </div>
              <div className="text-slate-600">Attn: {order.buyer.name}</div>
              <div className="text-slate-600 font-mono">
                GSTIN: {order.buyer.businessProfile?.gstin || "Unregistered Commercial Kitchen"}
              </div>
              <div className="text-slate-600">
                City: {order.buyer.businessProfile?.city || "Pune"}, Maharashtra (27)
              </div>
              <div className="text-slate-600 font-mono">Mobile: {order.buyer.phone}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 text-left font-bold">
                  <th className="py-2">#</th>
                  <th className="py-2">Commodity Description</th>
                  <th className="py-2">HSN / SAC</th>
                  <th className="py-2 text-right">Quantity</th>
                  <th className="py-2 text-right">Rate (₹)</th>
                  <th className="py-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="text-slate-800">
                    <td className="py-3 font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-3">
                      <span className="font-bold">{item.productName}</span>
                      <span className="text-[10px] text-slate-500 block">Grade: {item.qualityGrade}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-500">07020000</td>
                    <td className="py-3 text-right font-medium">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold font-mono">₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}

                {/* Freight */}
                {order.deliveryFee > 0 && (
                  <tr className="text-slate-700 bg-slate-50/50">
                    <td className="py-2 font-medium text-slate-400">#</td>
                    <td className="py-2 font-medium">Farm-Gate Fleet Logistics & Mileage (28km corridor)</td>
                    <td className="py-2 font-mono text-slate-500">996511</td>
                    <td className="py-2 text-right font-mono">1 Trip</td>
                    <td className="py-2 text-right font-mono">₹{order.deliveryFee.toFixed(2)}</td>
                    <td className="py-2 text-right font-bold font-mono">₹{order.deliveryFee.toFixed(2)}</td>
                  </tr>
                )}

                {/* Commission */}
                <tr className="text-slate-700 bg-slate-50/50">
                  <td className="py-2 font-medium text-slate-400">#</td>
                  <td className="py-2 font-medium">Khet2Kitchen Platform & Escrow Service Fee (3%)</td>
                  <td className="py-2 font-mono text-slate-500">998599</td>
                  <td className="py-2 text-right font-mono">1 Order</td>
                  <td className="py-2 text-right font-mono">₹{order.platformCommission.toFixed(2)}</td>
                  <td className="py-2 text-right font-bold font-mono">₹{order.platformCommission.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Subtotal & Totals */}
          <div className="border-t-2 border-slate-900 pt-4 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Produce Taxable Value:</span>
                <span className="font-mono font-semibold">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight Logistics:</span>
                <span className="font-mono font-semibold">₹{order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Commission:</span>
                <span className="font-mono font-semibold">₹{order.platformCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST (0%) + SGST (0%):</span>
                <span className="font-mono font-semibold">₹0.00</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Grand Total (INR):</span>
                <span className="text-emerald-800 text-base font-mono">₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footnotes & Digital Stamp */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Tax Exemption Declaration:</p>
              <p>Fresh vegetables and horticulture produce are exempt from GST under Notification No. 2/2017-Central Tax (Rate).</p>
              <p className="mt-1">Computer generated invoice. No physical signature required.</p>
            </div>

            <div className="text-center sm:text-right">
              <div className="border-2 border-dashed border-emerald-600/40 rounded-lg p-2 text-emerald-800 font-bold inline-block">
                ✓ KHET2KITCHEN VERIFIED
              </div>
              <span className="block text-[10px] text-slate-400 mt-1">Authorized Clearing House</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
