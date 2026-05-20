"use client";

import { apiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
  seller: { storeName: string };
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(apiUrl("/api/products?limit=20"), {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("FetchProducts error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{total} products total</p>
        </div>
        <button className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading products...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg opacity-40">📦</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.seller?.storeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category?.name}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">RS {product.price.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 line-through">RS {product.originalPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={
                        "text-sm font-medium " +
                        (product.stock === 0 ? "text-red-500" :
                         product.stock < 10 ? "text-amber-500" : "text-green-600")
                      }>
                        {product.stock === 0 ? "Out of stock" : product.stock + " left"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      ⭐ {product.rating} ({product.totalReviews})
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={
                          "inline-flex px-2 py-0.5 rounded-full text-xs font-medium " +
                          (product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")
                        }>
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                        {product.isFeatured && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-sky-500 hover:text-sky-600 font-medium transition-colors">
                          Edit
                        </button>
                        <button className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}