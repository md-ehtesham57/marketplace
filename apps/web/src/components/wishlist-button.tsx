"use client";

import { apiUrl } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
  initialWishlisted?: boolean; // 🚀 Optimization: Allows skipping fetch if parent knows status
}

export function WishlistButton({ 
  productId, 
  className = "", 
  size = "sm", 
  initialWishlisted 
}: WishlistButtonProps) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted || false);
  const [loading, setLoading] = useState(false);

  // Sync state if the parent prop changes dynamically
  useEffect(() => {
    if (initialWishlisted !== undefined) {
      setWishlisted(initialWishlisted);
    }
  }, [initialWishlisted]);

  useEffect(() => {
    // 🚀 Optimization: Skip the network call if the parent page already provided the state
    if (initialWishlisted !== undefined) return;

    const isTokenReady = token && typeof token === "string" && token.trim() !== "" && token !== "undefined";
    
    // 🚀 Bug Fix: AbortController prevents race conditions from out-of-order responses
    const controller = new AbortController();

    if (isAuthenticated && isTokenReady) {
      checkStatus(controller.signal);
    } else if (!isAuthenticated || !token) {
      setWishlisted(false);
    }

    return () => controller.abort(); // Cancel pending fetch if component unmounts/re-renders
  }, [isAuthenticated, token, productId, initialWishlisted]);

  const checkStatus = async (signal: AbortSignal) => {
    try {
      const res = await fetch(apiUrl("/api/wishlist/check"), {
        method: "POST",
        signal, // Attach the abort signal
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ productIds: [productId] }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setWishlisted(data.wishlisted?.[productId] || false);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Check status error:", err);
      }
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Safe fallback in case window is undefined during SSR
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      router.push("/login?redirect=" + currentPath);
      return;
    }

    if (loading) return; // Prevent double clicks while submitting

    // 🚀 UX Improvement: Optimistic Update (Toggle UI instantly)
    const previousState = wishlisted;
    setWishlisted(!previousState);
    setLoading(true);

    try {
      const url = apiUrl("/api/wishlist/") + productId;
      const response = await fetch(url, {
        method: previousState ? "DELETE" : "POST",
        headers: { Authorization: "Bearer " + token },
      });

      if (!response.ok) {
        throw new Error("Server rejected request");
      }
    } catch (error) {
      console.error("Wishlist mutation failed:", error);
      // 🚀 UX Improvement: Rollback UI to original state if API fails
      setWishlisted(previousState); 
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${sizeClasses} rounded-full border flex items-center justify-center transition-all cursor-pointer ${
        wishlisted
          ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
          : "bg-white border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500"
      } ${className}`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className={iconSize}
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}