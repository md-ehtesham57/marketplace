"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";

interface Stats {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    recentOrders: any[];
}

export default function DashboardPage() {
    const { token } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) fetchStats();
    }, [token]);

    const fetchStats = async () => {
        try {
            const [productsRes, ordersRes] = await Promise.all([
                fetch("http://localhost:4000/api/products?limit=1", {
                    headers: { Authorization: "Bearer " + token },
                }),
                fetch("http://localhost:4000/api/orders/admin/all?limit=5", {
                    headers: { Authorization: "Bearer " + token },
                }),
            ]);

            const productsData = await productsRes.json();
            const ordersData = await ordersRes.json();

            setStats({
                totalProducts: productsData.pagination?.total || 0,
                totalOrders: ordersData.pagination?.total || 0,
                totalUsers: 0,
                totalRevenue: ordersData.orders?.reduce((acc: number, o: any) => acc + o.totalAmount, 0) || 0,
                recentOrders: ordersData.orders || [],
            });
        } catch (error) {
            console.error("FetchStats error:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: "Total Products", value: stats?.totalProducts || 0, icon: "📦", color: "bg-blue-500" },
        { label: "Total Orders", value: stats?.totalOrders || 0, icon: "🛒", color: "bg-green-500" },
        { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", color: "bg-purple-500" },
        { label: "Total Revenue", value: "RS " + (stats?.totalRevenue || 0).toLocaleString(), icon: "💰", color: "bg-amber-500" },
    ];

    return (
        <div className="p-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back! Here is what is happening.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-slate-500">{card.label}</p>
                            <div className={card.color + " w-10 h-10 rounded-lg flex items-center justify-center"}>
                                <span className="text-xl">{card.icon}</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">
                            {loading ? "..." : card.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
                    <a href="/dashboard/orders" className="text-sm text-sky-500 hover:text-sky-600 font-medium">
                        View all →
                    </a>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : stats?.recentOrders.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No orders yet</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentOrders.map((order: any) => (
                                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={
                                                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " +
                                                (order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                                                    order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                                                        order.status === "SHIPPED" ? "bg-blue-100 text-blue-700" :
                                                            "bg-amber-100 text-amber-700")
                                            }>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                            RS {order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN")}
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