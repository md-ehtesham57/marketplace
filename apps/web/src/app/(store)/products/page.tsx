import { Badge } from "@marketplace/ui/badge";
import { Card } from "@marketplace/ui/card";

const allProducts = [
  { id: 1,  name: "Wireless Noise Cancelling Headphones", price: 2999,  originalPrice: 4999,  rating: 4.5, reviews: 2341, category: "Electronics", badge: "Best Seller" },
  { id: 2,  name: "Premium Leather Wallet",               price: 799,   originalPrice: 1299,  rating: 4.3, reviews: 876,  category: "Fashion",     badge: "Sale"        },
  { id: 3,  name: "Ergonomic Office Chair",               price: 8999,  originalPrice: 12999, rating: 4.7, reviews: 1203, category: "Home",        badge: "Top Rated"   },
  { id: 4,  name: "Running Shoes Pro",                    price: 3499,  originalPrice: 4999,  rating: 4.4, reviews: 567,  category: "Sports",      badge: "New"         },
  { id: 5,  name: "Skincare Essentials Kit",              price: 1299,  originalPrice: 1999,  rating: 4.6, reviews: 934,  category: "Beauty",      badge: "Sale"        },
  { id: 6,  name: "Mechanical Keyboard RGB",              price: 4499,  originalPrice: 5999,  rating: 4.8, reviews: 1876, category: "Electronics", badge: "Top Rated"   },
  { id: 7,  name: "Yoga Mat Premium",                     price: 999,   originalPrice: 1499,  rating: 4.2, reviews: 432,  category: "Sports",      badge: null          },
  { id: 8,  name: "Stainless Steel Water Bottle",         price: 599,   originalPrice: 899,   rating: 4.5, reviews: 1120, category: "Home",        badge: "Best Seller" },
  { id: 9,  name: "Bluetooth Speaker Portable",           price: 1899,  originalPrice: 2999,  rating: 4.3, reviews: 654,  category: "Electronics", badge: "Sale"        },
  { id: 10, name: "Formal Shirt Slim Fit",                price: 1299,  originalPrice: 1999,  rating: 4.1, reviews: 342,  category: "Fashion",     badge: null          },
  { id: 11, name: "Ceramic Coffee Mug Set",               price: 699,   originalPrice: 999,   rating: 4.6, reviews: 789,  category: "Home",        badge: "Best Seller" },
  { id: 12, name: "Protein Shaker Bottle",                price: 449,   originalPrice: 699,   rating: 4.4, reviews: 231,  category: "Sports",      badge: null          },
];

const categories = ["All", "Electronics", "Fashion", "Home", "Sports", "Beauty"];

const sortOptions = [
  "Relevance",
  "Price: Low to High",
  "Price: High to Low",
  "Top Rated",
  "Newest",
];

const badgeVariant: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
  "Best Seller": "success",
  "Sale":        "error",
  "Top Rated":   "info",
  "New":         "warning",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={"w-3 h-3 " + (star <= Math.floor(rating) ? "text-amber-400" : "text-slate-300")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1">{rating}</span>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-800">All Products</h1>
          <p className="text-slate-500 text-sm mt-1">
            Showing {allProducts.length} products
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* ── Sidebar Filters ───────────────────────────────────── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">

            {/* Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Search</h3>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Category</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        defaultChecked={cat === "All"}
                        className="accent-sky-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-sky-500 transition-colors">
                        {cat}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                <span className="text-slate-400 text-sm">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Min Rating</h3>
              <ul className="space-y-2">
                {[4, 3, 2, 1].map((r) => (
                  <li key={r}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="rating" className="accent-sky-500" />
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={"w-3 h-3 " + (star <= r ? "text-amber-400" : "text-slate-300")}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-slate-500">& up</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

          </aside>

          {/* ── Product Grid ──────────────────────────────────────── */}
          <div className="flex-1">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{allProducts.length}</span> products found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white">
                  {sortOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {allProducts.map((product) => (
                <a key={product.id} href={"/products/" + product.id} className="group">
                  <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-44 flex items-center justify-center">
                      <span className="text-5xl opacity-40">📦</span>
                      {product.badge && (
                        <div className="absolute top-3 left-3">
                          <Badge variant={badgeVariant[product.badge] ?? "default"}>
                            {product.badge}
                          </Badge>
                        </div>
                      )}
                      <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-sky-500 font-medium mb-1">{product.category}</p>
                      <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                        {product.name}
                      </h3>
                      <StarRating rating={product.rating} />
                      <p className="text-xs text-slate-400 mt-0.5">{product.reviews.toLocaleString()} reviews</p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-base font-bold text-slate-900">
                            RS {product.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 line-through ml-2">
                            RS {product.originalPrice.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-green-600">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                        </span>
                      </div>
                      <button className="mt-3 w-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 rounded-lg transition-colors duration-150">
                        Add to Cart
                      </button>
                    </div>
                  </Card>
                </a>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12">
              <button className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors">
                ← Prev
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={"px-3 py-1.5 text-sm rounded-lg border transition-colors " + (page === 1 ? "bg-sky-500 text-white border-sky-500" : "border-slate-300 text-slate-600 hover:border-sky-400 hover:text-sky-500")}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors">
                Next →
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}