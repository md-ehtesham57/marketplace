"use client";

import { apiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, className = "", size = "sm" }: WishlistButtonProps) {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      checkStatus();
    }
  }, [isAuthenticated, token, productId]);

  const checkStatus = async () => {
    try {
      const res = await fetch(apiUrl("/api/wishlist/check"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ productIds: [productId] }),
      });
      const data = await res.json();
      setWishlisted(data.wishlisted?.[productId] || false);
    } catch {
      // silently fail
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    setLoading(true);
    try {
      if (wishlisted) {
        await fetch(apiUrl("/api/wishlist/") + productId, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
        setWishlisted(false);
      } else {
        await fetch(apiUrl("/api/wishlist/") + productId, {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
        });
        setWishlisted(true);
      }
    } catch {
      // silently fail
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
      className={sizeClasses + " rounded-full border flex items-center justify-center transition-all cursor-pointer " +
        (wishlisted
          ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
          : "bg-white border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500") +
        " " + className}
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
