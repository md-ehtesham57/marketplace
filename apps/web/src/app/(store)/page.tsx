import { Badge } from "@marketplace/ui/badge";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";

const categories = [
  { name: "Electronics",   icon: "📱", count: 1240 },
  { name: "Fashion",       icon: "👗", count: 980  },
  { name: "Home & Living", icon: "🛋️", count: 754  },
  { name: "Sports",        icon: "⚽", count: 632  },
  { name: "Books",         icon: "📚", count: 421  },
  { name: "Beauty",        icon: "💄", count: 389  },
  { name: "Toys",          icon: "🧸", count: 310  },
  { name: "Automotive",    icon: "🚗", count: 275  },
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
          className={"w-3.5 h-3.5 " + (star <= Math.floor(rating) ? "text-amber-400" : "text-slate-300")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-500 ml-1">({rating})</span>
    </div>
  );
}

async function getFeaturedProducts() {
  try {
    const res = await fetch("http://localhost:4000/api/products/featured", {
      cache: "no-store",
    });
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-sm font-medium px-3 py-1 rounded-full mb-6">
              🎉 New arrivals every week
            </span>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Discover Products <br />
              <span className="text-sky-400">You Will Love</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Shop from thousands of verified sellers. Quality products, great prices, fast delivery.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">Shop Now</Button>
              <Button variant="outline" size="lg">Become a Seller</Button>
            </div>
            <div className="mt-12 flex items-center gap-8">
              {[
                { label: "Products",     value: "50K+"  },
                { label: "Sellers",      value: "2K+"   },
                { label: "Happy Buyers", value: "100K+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Shop by Category</h2>
            <p className="text-slate-500 text-sm mt-1">Find exactly what you are looking for</p>
          </div>
          <a href="/categories" className="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors">View all →</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={"/categories/" + cat.name.toLowerCase().replace(" & ", "-")}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all duration-200"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
              <span className="text-xs font-semibold text-slate-700 text-center">{cat.name}</span>
              <span className="text-xs text-slate-400">{cat.count.toLocaleString()}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Featured Products</h2>
            <p className="text-slate-500 text-sm mt-1">Hand-picked deals just for you</p>
          </div>
          <a href="/products" className="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors">View all →</a>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No featured products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <a key={product.id} href={"/products/" + product.id} className="group">
                <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-48 flex items-center justify-center">
                    <span className="text-5xl opacity-40">📦</span>
                    <div className="absolute top-3 left-3">
                      <Badge variant="success">Featured</Badge>
                    </div>
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-sky-500 font-medium mb-1">{product.category?.name}</p>
                    <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                      {product.name}
                    </h3>
                    <StarRating rating={product.rating} />
                    <p className="text-xs text-slate-400 mt-0.5">{product.totalReviews?.toLocaleString()} reviews</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-bold text-slate-900">
                          RS {product.price?.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 line-through ml-2">
                          RS {product.originalPrice?.toLocaleString()}
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
        )}
      </section>

    </div>
  );
}