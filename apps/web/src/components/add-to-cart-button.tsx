"use client";

import { useState } from "react";
import { useCart } from "@/context/cart.context";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  className?: string;
}

export function AddToCartButton({ productId, className }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    setLoading(true);
    const result = await addToCart(productId, 1);
    setLoading(false);

    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className || "mt-3 w-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 rounded-lg transition-colors duration-150 disabled:opacity-60"}
    >
      {loading ? "Adding..." : added ? "✓ Added!" : "Add to Cart"}
    </button>
  );
}