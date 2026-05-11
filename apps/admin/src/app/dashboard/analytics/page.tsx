"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  topProducts: any[];
  revenueByMonth: { month: string; revenue: number }[];
}

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("http://localhost:4000/api/orders/admin/all?limit=100", {
          headers: { Authorization: "Bearer " + token },
        }),
        fetch("http://localhost:4000/api/products?limit=100", {
          headers: { Authorization: "Bearer " + token },
        }),
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      const orders = ordersData.orders || [];
      const products = productsData.products || [];

      const totalRevenue = orders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
      const totalOrders = ordersData.pagination?.total || 0;
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      const ordersByStatus: Record<string, number> = {};
      orders.forEach((o: any) => {
        ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      });

      const revenueByMonth: { month: string; revenue: number }[] = [];
      const monthMap: Record<string, number> = {};
      orders.forEach((o: any) => {
        const month = new Date(o.createdAt).toLocaleString("en-IN", { month: "short", year: "numeric" });
        monthMap[month] = (monthMap[month] || 0) + o.totalAmount;
      });
      Object.entries(monthMap).forEach(([month, revenue]) => {
        revenueByMonth.push({ month, revenue });
      });

      setData({
        totalRevenue,
        totalOrders,
        totalProducts: productsData.pagination?.total || 0,
        averageOrderValue,
        ordersByStatus,
        topProducts: products.slice(0, 5),
        revenueByMonth,
      });
    } catch (error) {
      console.error("FetchAnalytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...(data?.revenueByMonth.map((m) => m.revenue) || [1]));

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Business performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Revenue",       value: "RS " + (data?.totalRevenue || 0).toLocaleString(),          icon: "💰", color: "bg-green-500",  change: "+12% this month" },
          { label: "Total Orders",        value: data?.totalOrders || 0,                                       icon: "🛒", color: "bg-blue-500",   change: "+8% this month"  },
          { label: "Total Products",      value: data?.totalProducts || 0,                                     icon: "📦", color: "bg-purple-500", change: "Active listings" },
          { label: "Avg Order Value",     value: "RS " + Math.round(data?.averageOrderValue || 0).toLocaleString(), icon: "📊", color: "bg-amber-500",  change: "Per order"       },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <div className={card.color + " w-10 h-10 rounded-lg flex items-center justify-center"}>
                <span className="text-xl">{card.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 mb-1">{card.value}</p>
            <p className="text-xs text-slate-400">{card.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Orders by Status</h2>
          <div className="space-y-4">
            {Object.entries(data?.ordersByStatus || {}).map(([status, count]) => {
              const total = Object.values(data?.ordersByStatus || {}).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, string> = {
                DELIVERED:  "bg-green-500",
                CONFIRMED:  "bg-blue-500",
                PROCESSING: "bg-indigo-500",
                SHIPPED:    "bg-purple-500",
                PENDING:    "bg-amber-500",
                CANCELLED:  "bg-red-500",
                REFUNDED:   "bg-slate-400",
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{status}</span>
                    <span className="text-sm text-slate-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={"h-full rounded-full " + (colors[status] || "bg-slate-400")}
                      style={{ width: percentage + "%" }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(data?.ordersByStatus || {}).length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Revenue by Month */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue by Month</h2>
          {data?.revenueByMonth.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No revenue data yet</p>
          ) : (
            <div className="space-y-3">
              {data?.revenueByMonth.map((item) => (
                <div key={item.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{item.month}</span>
                    <span className="text-sm font-semibold text-slate-800">RS {item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: Math.round((item.revenue / maxRevenue) * 100) + "%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Top Products by Rating</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Rating</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
              </tr>
            </thead>
            <tbody>
              {data?.topProducts.map((product: any) => (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg opacity-40">📦</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category?.name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                    RS {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400">⭐</span>
                      <span className="text-sm font-medium text-slate-700">{product.rating}</span>
                      <span className="text-xs text-slate-400">({product.totalReviews})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={"text-sm font-medium " + (product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-500" : "text-green-600")}>
                      {product.stock === 0 ? "Out of stock" : product.stock + " left"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}