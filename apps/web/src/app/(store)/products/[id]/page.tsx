import { ReviewsList } from "@/components/reviews-list";
import { Badge } from "@marketplace/ui/badge";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { notFound } from "next/navigation";


interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { firstName: string; lastName: string; avatar?: string };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  images: string[];
  rating: number;
  totalReviews: number;
  isFeatured: boolean;
  category: { name: string; slug: string };
  seller: { storeName: string; rating: number; totalSales: number; isVerified: boolean };
  reviews: Review[];
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch("http://localhost:4000/api/products/" + id, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch {
    return null;
  }
}

async function getRelatedProducts(categorySlug: string, currentId: string) {
  try {
    const res = await fetch(
      "http://localhost:4000/api/products?category=" + categorySlug + "&limit=4",
      { cache: "no-store" }
    );
    const data = await res.json();
    return (data.products || []).filter((p: Product) => p.id !== currentId);
  } catch {
    return [];
  }
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes: Record<string, string> = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={sizes[size] + " " + (star <= Math.floor(rating) ? "text-amber-400" : "text-slate-300")}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.category.slug,
    product.id
  );

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <a href="/" className="hover:text-sky-500 transition-colors">Home</a>
            <span>›</span>
            <a href="/products" className="hover:text-sky-500 transition-colors">Products</a>
            <span>›</span>
            <a href={"/categories/" + product.category.slug} className="hover:text-sky-500 transition-colors">
              {product.category.name}
            </a>
            <span>›</span>
            <span className="text-slate-700 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* Left - Image Gallery */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 h-96 flex items-center justify-center">
              {product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : (
                <span className="text-9xl opacity-20">📦</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={"bg-white rounded-xl border h-20 flex items-center justify-center cursor-pointer transition-all " +
                    (i === 0 ? "border-sky-400 shadow-sm" : "border-slate-200 hover:border-sky-300")}
                >
                  <span className="text-2xl opacity-20">📦</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {product.isFeatured && <Badge variant="success">Featured</Badge>}
                {product.stock === 0 && <Badge variant="error">Out of Stock</Badge>}
                {product.stock > 0 && product.stock <= 10 && (
                  <Badge variant="warning">Only {product.stock} left</Badge>
                )}
              </div>
              <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-sky-500 font-medium mb-2">{product.category.name}</p>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
              <span className="text-sm text-slate-400">({product.totalReviews.toLocaleString()} reviews)</span>
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
                {discount}% off
              </span>
            </div>

            {/* Stock */}
            {product.stock > 0 ? (
              <p className="text-sm text-slate-500 mb-6">
                <span className="text-green-600 font-semibold">In Stock</span>
                {product.stock <= 20 && " — only " + product.stock + " left"}
              </p>
            ) : (
              <p className="text-sm text-red-500 font-semibold mb-6">Out of Stock</p>
            )}

            {/* Add to Cart */}
            <div className="space-y-3 mb-6">
              <AddToCartButton
                productId={product.id}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors duration-150 text-sm"
              />
              <Button variant="outline" size="lg" fullWidth>
                Buy Now
              </Button>
            </div>

            {/* Seller Info */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <p className="text-xs text-slate-500 mb-2">Sold by</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                    <span className="text-sky-600 font-bold text-xs">
                      {product.seller.storeName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700">{product.seller.storeName}</span>
                    {product.seller.isVerified && (
                      <span className="ml-2 text-xs text-sky-500 font-medium">Verified</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-xs font-semibold text-slate-700">{product.seller.rating}</span>
                </div>
              </div>
            </div>

            {/* Delivery Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🚚", label: "Free Delivery", sub: "On orders above RS 500" },
                { icon: "↩️", label: "7 Day Returns", sub: "Easy return policy" },
                { icon: "🔒", label: "Secure Payment", sub: "100% safe checkout" },
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

        {/* Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-lg font-bold text-slate-800 mb-3">Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            </Card>
          </div>

          {/* Reviews Summary */}
          <div>
            <Card>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Reviews</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-slate-800">{product.rating}</p>
                  <StarRating rating={product.rating} size="sm" />
                  <p className="text-xs text-slate-400 mt-1">{product.totalReviews.toLocaleString()} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-2">{star}</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: star === Math.round(product.rating) ? "60%" : star > Math.round(product.rating) ? "20%" : "40%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              {product.reviews.length > 0 ? (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  {product.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-slate-100 pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">
                          {review.user.firstName} {review.user.lastName}
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      {review.comment && (
                        <p className="text-xs text-slate-500 leading-relaxed">{review.comment}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No reviews yet</p>
              )}
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((p: Product) => (
                <a key={p.id} href={"/products/" + p.id} className="group">
                  <Card padding="none" className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-36 flex items-center justify-center">
                      <span className="text-4xl opacity-20">📦</span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-sky-500 font-medium mb-1">{p.category.name}</p>
                      <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 group-hover:text-sky-600 transition-colors mb-2">
                        {p.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">RS {p.price.toLocaleString()}</span>
                        <span className="text-xs text-green-600 font-semibold">
                          {Math.round((1 - p.price / p.originalPrice) * 100)}% off
                        </span>
                      </div>
                      <AddToCartButton productId={p.id} className="mt-2 w-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors" />
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}