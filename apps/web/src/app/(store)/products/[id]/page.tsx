import { Badge } from "@marketplace/ui/badge";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";

const product = {
  id: 1,
  name: "Wireless Noise Cancelling Headphones",
  price: 2999,
  originalPrice: 4999,
  rating: 4.5,
  reviews: 2341,
  category: "Electronics",
  badge: "Best Seller",
  seller: "TechZone Store",
  sellerRating: 4.8,
  stock: 14,
  description:
    "Experience premium sound quality with our Wireless Noise Cancelling Headphones. Featuring 40mm drivers, 30-hour battery life, and active noise cancellation technology that blocks out up to 95% of ambient noise. Perfect for travel, work, or everyday listening.",
  features: [
    "Active Noise Cancellation (ANC) — blocks up to 95% ambient noise",
    "40mm dynamic drivers for rich, detailed sound",
    "30-hour battery life with quick charge (10 min = 3 hours)",
    "Foldable design with premium carry case included",
    "Compatible with Alexa, Google Assistant, and Siri",
    "Multipoint connection — connect to 2 devices simultaneously",
  ],
  specs: [
    { label: "Driver Size",       value: "40mm Dynamic"         },
    { label: "Frequency Response",value: "20Hz - 20kHz"         },
    { label: "Battery Life",      value: "30 hours"             },
    { label: "Charging Time",     value: "2 hours"              },
    { label: "Connectivity",      value: "Bluetooth 5.2"        },
    { label: "Weight",            value: "250g"                 },
    { label: "Warranty",          value: "1 Year Manufacturer"  },
  ],
};

const relatedProducts = [
  { id: 6, name: "Mechanical Keyboard RGB",    price: 4499, originalPrice: 5999, rating: 4.8, category: "Electronics" },
  { id: 9, name: "Bluetooth Speaker Portable", price: 1899, originalPrice: 2999, rating: 4.3, category: "Electronics" },
  { id: 1, name: "Wireless Earbuds Pro",       price: 1599, originalPrice: 2499, rating: 4.4, category: "Electronics" },
  { id: 2, name: "USB-C Hub 7-in-1",           price: 1299, originalPrice: 1999, rating: 4.5, category: "Electronics" },
];

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cls + " " + (star <= Math.floor(rating) ? "text-amber-400" : "text-slate-300")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* ── Breadcrumb ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <a href="/" className="hover:text-sky-500 transition-colors">Home</a>
            <span>›</span>
            <a href="/products" className="hover:text-sky-500 transition-colors">Products</a>
            <span>›</span>
            <a href="/categories/electronics" className="hover:text-sky-500 transition-colors">Electronics</a>
            <span>›</span>
            <span className="text-slate-700 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Main Product Section ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* Left — Image Gallery */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 h-96 flex items-center justify-center">
              <span className="text-9xl opacity-30">📦</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={"bg-white rounded-xl border h-20 flex items-center justify-center cursor-pointer transition-all " + (i === 1 ? "border-sky-400 shadow-sm" : "border-slate-200 hover:border-sky-300")}
                >
                  <span className="text-2xl opacity-30">📦</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Product Info */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <Badge variant="success">{product.badge}</Badge>
              <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-sky-500 font-medium mb-2">{product.category}</p>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">{product.name}</h1>

            {/* Rating Row */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} />
              <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
              <span className="text-sm text-slate-400">({product.reviews.toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-extrabold text-slate-900">
                RS {product.price.toLocaleString()}
              </span>
              <span className="text-lg text-slate-400 line-through mb-0.5">
                RS {product.originalPrice.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-green-600 mb-0.5">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% off
              </span>
            </div>

            {/* Stock */}
            <p className="text-sm text-slate-500 mb-6">
              <span className="text-green-600 font-semibold">✓ In Stock</span>
              {" "}— only {product.stock} left
            </p>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <button className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition-colors text-lg font-medium">−</button>
                <span className="px-4 py-2 text-sm font-semibold text-slate-800 border-x border-slate-300">1</span>
                <button className="px-3 py-2 text-slate-600 hover:bg-slate-100 transition-colors text-lg font-medium">+</button>
              </div>
              <Button variant="primary" size="lg" fullWidth>
                Add to Cart
              </Button>
            </div>

            <Button variant="outline" size="lg" fullWidth>
              Buy Now
            </Button>

            {/* Seller Info */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-1">Sold by</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                    <span className="text-sky-600 font-bold text-xs">T</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{product.seller}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-700">{product.sellerRating}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: "🚚", label: "Free Delivery", sub: "On orders above RS 500" },
                { icon: "↩️", label: "7 Day Returns", sub: "Easy return policy"     },
                { icon: "🔒", label: "Secure Payment", sub: "100% safe checkout"   },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Description + Specs ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

          {/* Description & Features */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-lg font-bold text-slate-800 mb-3">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              <h3 className="text-sm font-bold text-slate-700 mt-5 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-sky-500 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Specifications */}
          <div>
            <Card>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Specifications</h2>
              <div className="space-y-3">
                {product.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-slate-500">{spec.label}</span>
                    <span className="font-medium text-slate-700 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ── Related Products ──────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <a key={p.id} href={"/products/" + p.id} className="group">
                <Card padding="none" className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-36 flex items-center justify-center">
                    <span className="text-4xl opacity-30">📦</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-sky-500 font-medium mb-1">{p.category}</p>
                    <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-sky-600 transition-colors mb-2">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">RS {p.price.toLocaleString()}</span>
                      <span className="text-xs text-green-600 font-semibold">
                        {Math.round((1 - p.price / p.originalPrice) * 100)}% off
                      </span>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}