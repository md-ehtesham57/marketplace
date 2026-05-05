import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";

const cartItems = [
    {
        id: 1,
        name: "Wireless Noise Cancelling Headphones",
        category: "Electronics",
        price: 2999,
        originalPrice: 4999,
        quantity: 1,
        seller: "TechZone Store",
    },
    {
        id: 2,
        name: "Premium Leather Wallet",
        category: "Fashion",
        price: 799,
        originalPrice: 1299,
        quantity: 2,
        seller: "Fashion Hub",
    },
    {
        id: 3,
        name: "Yoga Mat Premium",
        category: "Sports",
        price: 999,
        originalPrice: 1499,
        quantity: 1,
        seller: "SportZone",
    },
];

const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
const originalTotal = cartItems.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0);
const savings = originalTotal - subtotal;
const delivery = subtotal >= 500 ? 0 : 99;
const total = subtotal + delivery;

export default function CartPage() {
    return (
        <div className="bg-slate-50 min-h-screen">

            {/* Page Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-slate-800">
                        My Cart
                        <span className="ml-2 text-base font-normal text-slate-400">
                            ({cartItems.length} items)
                        </span>
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Select All Bar */}
                        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="accent-sky-500 w-4 h-4" />
                                <span className="text-sm font-medium text-slate-700">Select All</span>
                            </label>
                            <button className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium">
                                Remove Selected
                            </button>
                        </div>

                        {/* Items */}
                        {cartItems.map((item) => (
                            <Card key={item.id} padding="none">
                                <div className="p-4">
                                    <div className="flex gap-4">

                                        {/* Checkbox */}
                                        <div className="flex items-start pt-1">
                                            <input type="checkbox" defaultChecked className="accent-sky-500 w-4 h-4" />
                                        </div>

                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-3xl opacity-40">📦</span>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-sky-500 font-medium mb-0.5">{item.category}</p>
                                            <h3 className="text-sm font-semibold text-slate-800 mb-1 line-clamp-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 mb-3">Sold by {item.seller}</p>

                                            <div className="flex items-center justify-between flex-wrap gap-3">

                                                {/* Price */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-bold text-slate-900">
                                                        RS {(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs text-slate-400 line-through">
                                                        RS {(item.originalPrice * item.quantity).toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-semibold text-green-600">
                                                        {Math.round((1 - item.price / item.originalPrice) * 100)}% off
                                                    </span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                                                        <button className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors font-medium">
                                                            -
                                                        </button>
                                                        <span className="px-3 py-1 text-sm font-semibold text-slate-800 border-x border-slate-300">
                                                            {item.quantity}
                                                        </span>
                                                        <button className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors font-medium">
                                                            +
                                                        </button>
                                                    </div>
                                                    <button className="text-sm text-red-400 hover:text-red-600 transition-colors">
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

                        {/* Continue Shopping */}
                        <div className="pt-2">

                        <a href="/products"
                            className="inline-flex items-center gap-2 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors"
                        >
                            {"<-"} Continue Shopping
                        </a>
                    </div>

                </div>

                {/* Order Summary */}
                <div className="space-y-4">

                    {/* Coupon */}
                    <Card>
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Apply Coupon</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter coupon code"
                                className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                            />
                            <Button variant="outline" size="sm">Apply</Button>
                        </div>
                    </Card>

                    {/* Price Breakdown */}
                    <Card>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>RS {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Original Price</span>
                                <span className="line-through text-slate-400">RS {originalTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600 font-medium">
                                <span>Your Savings</span>
                                <span>- RS {savings.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery</span>
                                <span className={delivery === 0 ? "text-green-600 font-medium" : ""}>
                                    {delivery === 0 ? "FREE" : "RS " + delivery}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 mt-4 pt-4">
                            <div className="flex justify-between font-bold text-slate-900">
                                <span>Total</span>
                                <span>RS {total.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                                You save RS {savings.toLocaleString()} on this order!
                            </p>
                        </div>

                        <div className="mt-6">
                            <Button variant="primary" size="lg" fullWidth>
                                Proceed to Checkout
                            </Button>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-4">
                            {["🔒 Secure", "✅ Verified", "↩️ Easy Returns"].map((badge) => (
                                <span key={badge} className="text-xs text-slate-400">{badge}</span>
                            ))}
                        </div>
                    </Card>

                    {/* Delivery Info */}
                    <Card>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🚚</span>
                            <div>
                                <p className="text-sm font-semibold text-slate-700">Free Delivery</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {delivery === 0
                                        ? "Your order qualifies for free delivery!"
                                        : "Add RS " + (500 - subtotal) + " more for free delivery"}
                                </p>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    </div >
  );
}