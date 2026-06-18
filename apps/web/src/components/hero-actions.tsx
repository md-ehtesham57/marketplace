"use client";

import { useAuth } from "@/context/auth.context";
import { Button } from "@marketplace/ui/button";

export function HeroActions() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Prevent layout shifting while loading auth status
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4 h-12 items-center">
        <div className="w-32 h-11 bg-slate-700/50 rounded-lg animate-pulse" />
        <div className="w-36 h-11 bg-slate-700/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const isSeller = isAuthenticated && (user?.role === "SELLER" || user?.role === "ADMIN");

  return (
    <div className="flex flex-wrap gap-4">
      <a href="/products">
        <Button variant="primary" size="lg">Shop Now</Button>
      </a>
      
      {isSeller ? (
        // 🚀 If logged in as a Seller/Admin, redirect to their dashboard panel
        <a href="/seller">
          <Button variant="outline" size="lg" className="border-sky-400 text-sky-400 hover:bg-sky-400/10">
            Go to Seller Panel
          </Button>
        </a>
      ) : (
        // 🛍️ Otherwise, show the onboarding link for buyers/guests
        <a href="/register?role=seller">
          <Button variant="outline" size="lg">Become a Seller</Button>
        </a>
      )}
    </div>
  );
}