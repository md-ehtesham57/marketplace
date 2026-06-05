"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { SellerProvider } from "@/context/seller.context";

const navItems = [
  { label: "Dashboard",  href: "/seller",          icon: "📊" },
  { label: "Products",   href: "/seller/products",  icon: "📦" },
  { label: "Orders",     href: "/seller/orders",    icon: "🛒" },
  { label: "Profile",    href: "/seller/profile",   icon: "👤" },
];

function SellerLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/seller");
    }
    if (!isLoading && isAuthenticated && user?.role === "BUYER") {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Seller Panel</p>
              <p className="text-sky-400 text-xs">{user?.firstName} {user?.lastName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
                (pathname === item.href
                  ? "bg-sky-500 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white")
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 space-y-2">
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span>🏪</span> Back to Store
          </a>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  );
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SellerProvider>
      <SellerLayoutInner>{children}</SellerLayoutInner>
    </SellerProvider>
  );
}