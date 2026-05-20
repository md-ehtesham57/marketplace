"use client";

import { apiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Card } from "@marketplace/ui/card";
import { Badge } from "@marketplace/ui/badge";
import { WishlistButton } from "@/components/wishlist-button";

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    rating: number;
    totalReviews: number;
    stock: number;
    isFeatured: boolean;
    category: { name: string; slug: string };
  };
}

export default function WishlistPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/wishlist");
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, isLoading]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/wishlist"), {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Fetch wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">My Wishlist</h1>
        <div className="text-center py-20 text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Wishlist</h1>
        <p className="text-sm text-slate-500 mb-8">
          {items.length === 0 ? "Your wishlist is empty" : items.length + " " + (items.length === 1 ? "item" : "items") + " saved"}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">No items yet</p>
            <p className="text-slate-400 mb-6">Save products you love to your wishlist</p>
            <a
              href="/products"
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const p = item.product;
              return (
                <a key={item.id} href={"/products/" + p.id} className="group">
                  <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-48 flex items-center justify-center">
                      <span className="text-5xl opacity-40">📦</span>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <WishlistButton productId={p.id} />
                      </div>
                      {p.stock === 0 && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="error">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-sky-500 font-medium mb-1">{p.category.name}</p>
                      <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={"w-3 h-3 " + (star <= Math.floor(p.rating) ? "text-amber-400" : "text-slate-300")}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-slate-400 ml-1">({p.totalReviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-slate-900">RS {p.price.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 line-through ml-2">RS {p.originalPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-semibold text-green-600">
                          {Math.round((1 - p.price / p.originalPrice) * 100)}% off
                        </span>
                      </div>
                      <AddToCartButton productId={p.id} />
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
