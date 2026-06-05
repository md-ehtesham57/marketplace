"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string };
  _count: { reviews: number; orderItems: number };
}

export default function SellerProductsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/seller/products", {
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

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch("http://localhost:4000/api/seller/products/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchProducts();
    } catch (error) {
      console.error("ToggleActive error:", error);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch("http://localhost:4000/api/seller/products/" + id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      fetchProducts();
    } catch (error) {
      console.error("DeleteProduct error:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Products</h1>
          <p className="text-slate-500 text-sm mt-1">{total} products listed</p>
        </div>
        <button
          onClick={() => router.push("/seller/products/new")}
          className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 mb-4">No products listed yet</p>
            <button
              onClick={() => router.push("/seller/products/new")}
              className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
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
                          <p className="text-xs text-slate-400">⭐ {product.rating} · {product._count.reviews} reviews</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.category?.name}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">RS {product.price.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 line-through">RS {product.originalPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"text-sm font-medium " + (product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-500" : "text-green-600")}>
                        {product.stock === 0 ? "Out of stock" : product.stock + " left"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product._count.orderItems}</td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex px-2 py-0.5 rounded-full text-xs font-medium " + (product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push("/seller/products/" + product.id + "/edit")}
                          className="text-xs text-sky-500 hover:text-sky-600 font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(product.id, product.isActive)}
                          className={"text-xs font-medium transition-colors " + (product.isActive ? "text-amber-500 hover:text-amber-600" : "text-green-500 hover:text-green-600")}
                        >
                          {product.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
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
        )}
      </div>
    </div>
  );
}