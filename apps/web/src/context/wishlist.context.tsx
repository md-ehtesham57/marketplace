"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth.context";
import { apiUrl } from "@/lib/api";

interface WishlistContextType {
  wishlistCount: number;
  wishlistIds: Record<string, boolean>;
  fetchWishlistCount: () => Promise<void>;
  toggleLocalWishlist: (productId: string, isAdded: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Record<string, boolean>>({});

  const wishlistCount = Object.values(wishlistIds).filter(Boolean).length;

  const fetchWishlistCount = async () => {
    const isTokenReady = token && typeof token === "string" && token.trim() !== "" && token !== "undefined";
    if (!isAuthenticated || !isTokenReady) return;

    try {
      const res = await fetch(apiUrl("/api/wishlist"), {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) return;
      const data = await res.json();
      
      // Map array items to a quick lookup record: { [productId]: true }
      const idsMap: Record<string, boolean> = {};
      data.items?.forEach((item: any) => {
        idsMap[item.productId] = true;
      });
      setWishlistIds(idsMap);
    } catch (error) {
      console.error("Error loading wishlist items:", error);
    }
  };

  // Sync count on auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlistCount();
    } else {
      setWishlistIds({});
    }
  }, [isAuthenticated, token]);

  // Helper to instantly update the count/state when a single button is clicked
  const toggleLocalWishlist = (productId: string, isAdded: boolean) => {
    setWishlistIds((prev) => ({
      ...prev,
      [productId]: isAdded,
    }));
  };

  return (
    <WishlistContext.Provider value={{ wishlistCount, wishlistIds, fetchWishlistCount, toggleLocalWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}