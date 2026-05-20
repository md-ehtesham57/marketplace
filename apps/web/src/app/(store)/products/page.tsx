import { apiUrl } from "@/lib/api";
import { Badge } from "@marketplace/ui/badge";
import { Card } from "@marketplace/ui/card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  totalReviews: number;
  stock: number;
  isFeatured: boolean;
  category: { name: string; slug: string };
  seller: { storeName: string };
}

async function getProducts(searchParams: Record<string, string>) {
  try {
    const params = new URLSearchParams();
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
    if (searchParams.rating)   params.set("rating",   searchParams.rating);
    if (searchParams.sort)     params.set("sort",     searchParams.sort);
    if (searchParams.order)    params.set("order",    searchParams.order);
    if (searchParams.search)   params.set("search",   searchParams.search);
    if (searchParams.page)     params.set("page",     searchParams.page);
    params.set("limit", "12");

    const res = await fetch(apiUrl("/api/products?") + params.toString(), {
      cache: "no-store",
    });
    const data = await res.json();
    return { products: data.products || [], pagination: data.pagination };
  } catch {
    return { products: [], pagination: null };
  }
}

async function getCategories() {
  try {
    const res = await fetch(apiUrl("/api/products?limit=100"), {
      cache: "no-store",
    });
    const data = await res.json();
    const cats = new Map();
    (data.products || []).forEach((p: Product) => {
      if (p.category) cats.set(p.category.slug, p.category.name);
    });
    return Array.from(cats.entries()).map(([slug, name]) => ({ slug, name }));
  } catch {
    return [];
  }
}

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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const [{ products, pagination }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  const currentPage = parseInt(searchParams.page || "1");
  const currentCategory = searchParams.category || "";
  const currentSort = searchParams.sort || "createdAt";
  const currentOrder = searchParams.order || "desc";
  const currentSearch = searchParams.search || "";

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-800">All Products</h1>
          <p className="text-slate-500 text-sm mt-1">
            {pagination ? pagination.total + " products found" : "Loading..."}
            {currentSearch ? " for " + currentSearch : ""}
            {currentCategory ? " in " + currentCategory : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-4">

            {/* Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Search</h3>
              <form method="GET" action="/products">
                <input
                  type="text"
                  name="search"
                  defaultValue={currentSearch}
                  placeholder="Search products..."
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                {currentCategory && (
                  <input type="hidden" name="category" value={currentCategory} />
                )}
                <button
                  type="submit"
                  className="mt-2 w-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Category</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/products"
                    className={"flex items-center gap-2 text-sm transition-colors " + (!currentCategory ? "text-sky-500 font-semibold" : "text-slate-600 hover:text-sky-500")}
                  >
                    <span className={!currentCategory ? "w-2 h-2 bg-sky-500 rounded-full inline-block" : "w-2 h-2 bg-slate-200 rounded-full inline-block"} />
                    All Categories
                  </a>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <a
                      href={"/products?category=" + cat.slug}
                      className={"flex items-center gap-2 text-sm transition-colors " + (currentCategory === cat.slug ? "text-sky-500 font-semibold" : "text-slate-600 hover:text-sky-500")}
                    >
                      <span className={currentCategory === cat.slug ? "w-2 h-2 bg-sky-500 rounded-full inline-block" : "w-2 h-2 bg-slate-200 rounded-full inline-block"} />
                      {cat.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Price Range</h3>
              <form method="GET" action="/products">
                {currentCategory && (
                  <input type="hidden" name="category" value={currentCategory} />
                )}
                {currentSearch && (
                  <input type="hidden" name="search" value={currentSearch} />
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    defaultValue={searchParams.minPrice}
                    className="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <span className="text-slate-400 text-sm">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    defaultValue={searchParams.maxPrice}
                    className="w-full text-sm border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 w-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            </div>

            {/* Min Rating */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Min Rating</h3>
              <ul className="space-y-2">
                {[4, 3, 2, 1].map((r) => (
                  <li key={r}>
                    <a
                      href={"/products?rating=" + r + (currentCategory ? "&category=" + currentCategory : "")}
                      className={"flex items-center gap-2 cursor-pointer transition-colors " + (searchParams.rating === String(r) ? "text-sky-500" : "text-slate-600 hover:text-sky-500")}
                    >
                      <div className="flex items-center gap-0.5">
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
                        <span className="text-xs ml-1">and up</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </aside>

          {/* Product Grid */}
          <div className="flex-1">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{pagination?.total || 0}</span> products found
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500">Sort by:</span>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "Newest",     sort: "createdAt", order: "desc" },
                    { label: "Price Low",  sort: "price",     order: "asc"  },
                    { label: "Price High", sort: "price",     order: "desc" },
                    { label: "Top Rated",  sort: "rating",    order: "desc" },
                  ].map((option) => (
                    <a
                      key={option.label}
                      href={
                        "/products?sort=" + option.sort +
                        "&order=" + option.order +
                        (currentCategory ? "&category=" + currentCategory : "") +
                        (currentSearch ? "&search=" + currentSearch : "")
                      }
                      className={
                        "text-xs px-3 py-1.5 rounded-lg border transition-colors " +
                        (currentSort === option.sort && currentOrder === option.order
                          ? "bg-sky-500 text-white border-sky-500"
                          : "border-slate-300 text-slate-600 hover:border-sky-400 hover:text-sky-500")
                      }
                    >
                      {option.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid */}
            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">No Results</p>
                <h2 className="text-xl font-semibold text-slate-700 mb-2">No products found</h2>
                <p className="text-slate-400 mb-6">Try adjusting your filters or search term</p>
                <a
                  href="/products"
                  className="text-sky-500 hover:text-sky-600 font-medium text-sm transition-colors"
                >
                  Clear all filters
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product: Product) => (
                  <a key={product.id} href={"/products/" + product.id} className="group">
                    <Card padding="none" className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 h-44 flex items-center justify-center">
                        <span className="text-slate-300 text-sm">No Image</span>
                        {product.isFeatured && (
                          <div className="absolute top-3 left-3">
                            <Badge variant="success">Featured</Badge>
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute top-3 left-3">
                            <Badge variant="error">Out of Stock</Badge>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <WishlistButton productId={product.id} />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-sky-500 font-medium mb-1">{product.category?.name}</p>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                          {product.name}
                        </h3>
                        <StarRating rating={product.rating} />
                        <p className="text-xs text-slate-400 mt-0.5">{product.totalReviews.toLocaleString()} reviews</p>
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
                        <AddToCartButton productId={product.id} />
                      </div>
                    </Card>
                  </a>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                {currentPage > 1 && (
                  <a
                    href={"/products?page=" + (currentPage - 1) + (currentCategory ? "&category=" + currentCategory : "") + (currentSearch ? "&search=" + currentSearch : "")}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors"
                  >
                    Prev
                  </a>
                )}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <a
                    key={page}
                    href={"/products?page=" + page + (currentCategory ? "&category=" + currentCategory : "") + (currentSearch ? "&search=" + currentSearch : "")}
                    className={"px-3 py-1.5 text-sm rounded-lg border transition-colors " + (page === currentPage ? "bg-sky-500 text-white border-sky-500" : "border-slate-300 text-slate-600 hover:border-sky-400 hover:text-sky-500")}
                  >
                    {page}
                  </a>
                ))}
                {currentPage < pagination.totalPages && (
                  <a
                    href={"/products?page=" + (currentPage + 1) + (currentCategory ? "&category=" + currentCategory : "") + (currentSearch ? "&search=" + currentSearch : "")}
                    className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg text-slate-500 hover:border-sky-400 hover:text-sky-500 transition-colors"
                  >
                    Next
                  </a>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}