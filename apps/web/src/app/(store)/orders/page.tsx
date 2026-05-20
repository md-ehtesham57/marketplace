"use client";

import { apiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { Card } from "@marketplace/ui/card";
import { Badge } from "@marketplace/ui/badge";
import { Button } from "@marketplace/ui/button";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    category: { name: string };
    seller: { storeName: string };
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const statusVariant: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  PENDING:    "warning",
  CONFIRMED:  "info",
  PROCESSING: "info",
  SHIPPED:    "default",
  DELIVERED:  "success",
  CANCELLED:  "error",
  REFUNDED:   "error",
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/orders");
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(apiUrl("/api/orders"), {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("FetchOrders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(apiUrl("/api/orders/") + orderId + "/cancel", {
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("CancelOrder error:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage your orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No orders yet</h2>
            <p className="text-slate-400 mb-6">Start shopping to see your orders here</p>
            <Button variant="primary" size="lg">
              <a href="/products">Browse Products</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>

                {/* Order Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-slate-700">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <Badge variant={statusVariant[order.status] ?? "default"}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      RS {order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">{order.paymentMethod}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl opacity-40">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity} x RS {item.price.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 flex-shrink-0">
                        RS {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Delivery Address</p>
                  <p className="text-sm text-slate-700">{order.deliveryAddress}</p>
                </div>

                {/* Order Status Timeline */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                  {["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((step, index) => {
                    const statuses = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
                    const currentIndex = statuses.indexOf(order.status);
                    const stepIndex = statuses.indexOf(step);
                    const isCompleted = stepIndex <= currentIndex;
                    const isCancelled = order.status === "CANCELLED";

                    return (
                      <div key={step} className="flex items-center gap-2 flex-shrink-0">
                        <div className={
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold " +
                          (isCancelled ? "bg-red-100 text-red-500" :
                           isCompleted ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-400")
                        }>
                          {isCompleted && !isCancelled ? "✓" : index + 1}
                        </div>
                        <span className={"text-xs font-medium " + (isCompleted && !isCancelled ? "text-sky-600" : "text-slate-400")}>
                          {step.charAt(0) + step.slice(1).toLowerCase()}
                        </span>
                        {index < 3 && (
                          <div className={"h-0.5 w-6 " + (stepIndex < currentIndex && !isCancelled ? "bg-sky-400" : "bg-slate-200")} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Button variant="outline" size="sm">
                    <a href={"/orders/" + order.id}>View Details</a>
                  </Button>
                  {["PENDING", "CONFIRMED"].includes(order.status) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>

              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}