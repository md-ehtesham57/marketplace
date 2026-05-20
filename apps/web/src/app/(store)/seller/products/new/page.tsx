"use client";

import { apiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";
import { Card } from "@marketplace/ui/card";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AddProductPage() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/seller/products/new");
      return;
    }
    if (user && user.role !== "SELLER") {
      router.push("/");
      return;
    }
    fetchCategories();
  }, [isAuthenticated, isLoading, user]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(apiUrl("/api/products/categories"));
      const data = await res.json();
      setCategories(data.categories || []);
      if (data.categories?.length > 0) {
        setCategoryId(data.categories[0].id);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !description || !price || !originalPrice || !categoryId) {
      setError("All required fields must be filled");
      return;
    }

    const cleaned = price.replace(/,/g, "");
    const cleanedOriginal = originalPrice.replace(/,/g, "");

    const priceNum = parseFloat(cleaned);
    const originalPriceNum = parseFloat(cleanedOriginal);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Price must be a positive number");
      return;
    }

    if (isNaN(originalPriceNum) || originalPriceNum <= 0) {
      setError("Original price must be a positive number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/products"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          name,
          description,
          price: priceNum,
          originalPrice: originalPriceNum,
          stock: parseInt(stock) || 1,
          categoryId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create product");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Created!</h2>
          <p className="text-slate-500 mb-8">{name} has been added successfully.</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="/seller/products/new"
              className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Add Another
            </a>
            <a
              href="/seller"
              className="border border-sky-500 text-sky-500 hover:bg-sky-50 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <a href="/seller" className="text-sm text-sky-500 hover:text-sky-600 transition-colors inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </a>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Add New Product</h1>
          <p className="text-sm text-slate-500 mt-1">Fill in the details below to list a new product.</p>
        </div>

        <Card className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wireless Bluetooth Headphones"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product — features, specifications, condition..."
                rows={4}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Selling Price (RS) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">RS</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setPrice(val);
                    }}
                    placeholder="0"
                    className="w-full text-sm border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Original Price (RS) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">RS</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={originalPrice}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      setOriginalPrice(val);
                    }}
                    placeholder="0"
                    className="w-full text-sm border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="1"
                  min="0"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Product"
                )}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
