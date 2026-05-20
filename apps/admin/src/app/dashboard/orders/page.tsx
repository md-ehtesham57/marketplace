"use client";

import { apiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  items: { product: { name: string }; quantity: number }[];
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

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(apiUrl("/api/orders/admin/all?limit=20"), {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("FetchOrders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await fetch(apiUrl("/api/orders/") + orderId + "/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (error) {
      console.error("UpdateStatus error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{total} orders total</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No orders yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {order.user.firstName} {order.user.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{order.user.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      RS {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " + (statusColors[order.status] || "bg-slate-100 text-slate-700")}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white disabled:opacity-50"
                      >
                        {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}