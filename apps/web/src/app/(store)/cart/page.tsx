"use client";

import { useAuth } from "@/context/auth.context";
import { useCart } from "@/context/cart.context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";

export default function CartPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { items, summary, updateItem, removeItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/cart");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-800">
            My Cart
            <span className="ml-2 text-base font-normal text-slate-400">
              ({items.length} items)
            </span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🛒</p>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Your cart is empty</h2>
            <p className="text-slate-400 mb-6">Add some products to get started</p>
            <Button variant="primary" size="lg">
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} padding="none">
                  <div className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl opacity-40">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-sky-500 font-medium mb-0.5">{item.product.category?.name}</p>
                        <h3 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">{item.product.name}</h3>
                        <p className="text-xs text-slate-400 mb-3">Sold by {item.product.seller?.storeName}</p>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-900">
                              RS {(item.product.price * item.quantity).toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              RS {(item.product.originalPrice * item.quantity).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateItem(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors font-medium disabled:opacity-40"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-sm font-semibold text-slate-800 border-x border-slate-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors font-medium"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              <div className="pt-2">
                <a href="/products" className="text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors">
                  Back to Products
                </a>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span>RS {summary?.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Your Savings</span>
                    <span>- RS {summary?.savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery</span>
                    <span className={summary?.delivery === 0 ? "text-green-600 font-medium" : ""}>
                      {summary?.delivery === 0 ? "FREE" : "RS " + summary?.delivery}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-200 mt-4 pt-4">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span>RS {summary?.total.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    You save RS {summary?.savings.toLocaleString()} on this order!
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => router.push("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </Card>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}