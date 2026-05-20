"use client";

import { apiUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { useCart } from "@/context/cart.context";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";
import { Input } from "@marketplace/ui/input";

export default function CheckoutPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const { items, summary, clearCart } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && items.length === 0) {
      router.push("/cart");
    }
  }, [items, isLoading, isAuthenticated]);

  const handlePlaceOrder = async () => {
    if (!address || !city || !state || !pincode) {
      setError("Please fill in all address fields");
      return;
    }

    setPlacing(true);
    setError("");

    const deliveryAddress = address + ", " + city + ", " + state + " - " + pincode;

    try {
      const res = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ deliveryAddress, paymentMethod }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to place order");
        return;
      }

      router.push("/orders?success=true");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-800">Checkout</h1>
          <p className="text-slate-500 text-sm mt-1">Complete your order</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Delivery + Payment */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <Card>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Delivery Address</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <Input
                  id="address"
                  label="Street Address"
                  placeholder="123 Main Street, Apartment 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="city"
                    label="City"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    fullWidth
                  />
                  <Input
                    id="state"
                    label="State"
                    placeholder="Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    fullWidth
                  />
                </div>
                <Input
                  id="pincode"
                  label="PIN Code"
                  placeholder="400001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  fullWidth
                />
              </div>
            </Card>

            {/* Payment Method */}
            <Card>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: "COD",    label: "Cash on Delivery",  icon: "💵", desc: "Pay when your order arrives" },
                  { id: "UPI",    label: "UPI Payment",        icon: "📱", desc: "Pay via any UPI app"          },
                  { id: "CARD",   label: "Credit/Debit Card",  icon: "💳", desc: "Visa, Mastercard, RuPay"      },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={"flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all " +
                      (paymentMethod === method.id
                        ? "border-sky-400 bg-sky-50"
                        : "border-slate-200 hover:border-sky-200")}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="accent-sky-500"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{method.label}</p>
                      <p className="text-xs text-slate-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Right — Order Summary */}
          <div>
            <Card>
              <h2 className="text-lg font-bold text-slate-800 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg opacity-40">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-900 flex-shrink-0">
                      RS {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>RS {summary?.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Savings</span>
                  <span>- RS {summary?.savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className={summary?.delivery === 0 ? "text-green-600 font-medium" : ""}>
                    {summary?.delivery === 0 ? "FREE" : "RS " + summary?.delivery}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 mt-3 pt-3">
                <div className="flex justify-between font-bold text-slate-900 text-lg">
                  <span>Total</span>
                  <span>RS {summary?.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={placing}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
              </div>

              <p className="text-xs text-center text-slate-400 mt-3">
                🔒 Secure checkout — your data is safe
              </p>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}