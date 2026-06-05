"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth.context";

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  isVerified: boolean;
  storeName: string;
}

interface SellerContextType {
  stats: SellerStats | null;
  isSeller: boolean;
  isLoading: boolean;
  refreshStats: () => Promise<void>;
}

const SellerContext = createContext<SellerContextType | null>(null);

export function SellerProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isSeller = user?.role === "SELLER" || user?.role === "ADMIN";

  const refreshStats = async () => {
    if (!token || !isSeller) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/seller/stats", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setStats(data.stats || null);
    } catch (error) {
      console.error("RefreshStats error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller && token) refreshStats();
  }, [isSeller, token]);

  return (
    <SellerContext.Provider value={{ stats, isSeller, isLoading, refreshStats }}>
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) throw new Error("useSeller must be used within SellerProvider");
  return context;
}