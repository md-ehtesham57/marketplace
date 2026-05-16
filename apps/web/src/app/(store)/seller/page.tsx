"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { Badge } from "@marketplace/ui/badge";
import { Card } from "@marketplace/ui/card";

interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  category: { name: string; slug: string };
}

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/seller");
      return;
    }
    if (user && user.role !== "SELLER") {
      router.push("/");
      return;
    }
    fetchProducts();
  }, [isAuthenticated, isLoading, user]);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:4000/api/products/my", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Fetch seller products error:", error);
    } finally {
      setFetching(false);
    }
  }, [token]);

  const handleToggleActive = async (productId: string, current: boolean) => {
    try {
      await fetch("http://localhost:4000/api/products/" + productId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ isActive: !current }),
      });
      fetchProducts();
    } catch (error) {
      console.error("Toggle active error:", error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch("http://localhost:4000/api/products/" + productId, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      fetchProducts();
    } catch (error) {
      console.error("Delete product error:", error);
    }
  };

  if (isLoading || fetching) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 text-slate-400 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const activeProducts = products.filter((p) => p.isActive).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Seller Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your products and inventory</p>
          </div>
          <a
            href="/seller/products/new"
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm shadow-sky-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{products.length}</p>
                <p className="text-xs text-slate-500">Total Products</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{activeProducts}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{outOfStock}</p>
                <p className="text-xs text-slate-500">Out of Stock</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">RS {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Inventory Value</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Products Table */}
        {products.length === 0 ? (
          <Card className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">No products yet</h3>
            <p className="text-sm text-slate-400 mb-6">Start selling by adding your first product</p>
            <a
              href="/seller/products/new"
              className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Product
            </a>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Price</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="text-center px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-sky-50/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-sky-100 to-sky-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-sky-600 font-bold text-sm">
                              {p.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <a
                              href={"/products/" + p.id}
                              className="font-medium text-slate-800 hover:text-sky-500 transition-colors block truncate max-w-[200px]"
                            >
                              {p.name}
                            </a>
                            <p className="text-xs text-slate-400">
                              Added {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                          {p.category.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-slate-800">RS {p.price.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 line-through ml-1.5">RS {p.originalPrice.toLocaleString()}</span>
                        <span className="text-xs text-green-600 font-medium ml-1.5">
                          {Math.round((1 - p.price / p.originalPrice) * 100)}% off
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center hidden sm:table-cell">
                        {p.stock > 0 ? (
                          <span className="text-sm font-medium text-slate-700">{p.stock}</span>
                        ) : (
                          <span className="text-sm font-medium text-red-500">0</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(p.id, p.isActive)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-sky-500 hover:bg-sky-50 rounded-md transition-colors cursor-pointer"
                          >
                            {p.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
