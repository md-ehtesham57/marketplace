"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  createdAt: string;
  product: { name: string; images: string[] };
  order: {
    id: string;
    status: string;
    deliveryAddress: string;
    user: { firstName: string; lastName: string; email: string };
  };
}

const statusColors: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-700",
  CONFIRMED:  "bg-blue-100 text-blue-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-indigo-100 text-indigo-700",
  DELIVERED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
  REFUNDED:   "bg-slate-100 text-slate-700",
};

export default function SellerOrdersPage() {
  const { token } = useAuth();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/seller/orders", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setOrderItems(data.orderItems || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("FetchOrders error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
        <p className="text-slate-500 text-sm mt-1">{total} order items total</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading orders...</div>
        ) : orderItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Address</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg opacity-40">📦</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{item.order.user.firstName} {item.order.user.lastName}</p>
                      <p className="text-xs text-slate-400">{item.order.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      RS {(item.price * item.quantity).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " + (statusColors[item.order.status] || "bg-slate-100 text-slate-700")}>
                        {item.order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-32 truncate">{item.order.deliveryAddress}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}