"use client";

import { useSeller } from "@/context/seller.context";
import { useAuth } from "@/context/auth.context";

export default function SellerDashboardPage() {
  const { stats, isLoading } = useSeller();
  const { user } = useAuth();

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts || 0,                                        icon: "📦", color: "bg-blue-500"   },
    { label: "Total Orders",   value: stats?.totalOrders || 0,                                          icon: "🛒", color: "bg-green-500"  },
    { label: "Total Revenue",  value: "RS " + (stats?.totalRevenue || 0).toLocaleString(),              icon: "💰", color: "bg-amber-500"  },
    { label: "Store Rating",   value: (stats?.rating || 0) + " / 5",                                   icon: "⭐", color: "bg-purple-500" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {user?.firstName}!
          </h1>
          {stats?.isVerified && (
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Verified Seller
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm">{stats?.storeName}</p>
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
              {isLoading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Add New Product",  href: "/seller/products/new", icon: "➕", desc: "List a new product for sale",       color: "bg-sky-500"    },
          { label: "View Orders",      href: "/seller/orders",       icon: "📋", desc: "Check and manage your orders",      color: "bg-green-500"  },
          { label: "Manage Products",  href: "/seller/products",     icon: "📦", desc: "Edit or remove your listings",      color: "bg-purple-500" },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className={action.color + " w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"}>
              <span className="text-2xl">{action.icon}</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{action.label}</h3>
            <p className="text-sm text-slate-400">{action.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}