"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth.context";

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: number;
        originalPrice: number;
        images: string[];
        category: { name: string; slug: string };
        seller: { storeName: string };
    };
}

interface CartSummary {
    itemCount: number;
    subtotal: number;
    originalTotal: number;
    savings: number;
    delivery: number;
    total: number;
}

interface CartContextType {
    items: CartItem[];
    summary: CartSummary | null;
    addToCart: (productId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    isLoading: boolean;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const { token, isAuthenticated } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [summary, setSummary] = useState<CartSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refreshCart = async () => {
        if (!isAuthenticated || !token) {
            setItems([]);
            setSummary(null);
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch("http://localhost:4000/api/cart", {
                headers: { Authorization: "Bearer " + token },
            });
            const data = await res.json();
            setItems(data.cart?.items || []);
            setSummary(data.summary || null);
        } catch (error) {
            console.error("RefreshCart error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setItems([]);
            setSummary(null);
        }
    }, [isAuthenticated]);

    const addToCart = async (productId: string, quantity = 1) => {
        if (!isAuthenticated || !token) {
            window.location.href = "/login?redirect=" + window.location.pathname;
            return { success: false, error: "Please login to add items to cart" };
        }

        try {
            const res = await fetch("http://localhost:4000/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ productId, quantity }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            await refreshCart();
            return { success: true };
        } catch {
            return { success: false, error: "Failed to add to cart" };
        }
    };

    const updateItem = async (itemId: string, quantity: number) => {
        if (!token) return;

        try {
            await fetch("http://localhost:4000/api/cart/" + itemId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({ quantity }),
            });
            await refreshCart();
        } catch (error) {
            console.error("UpdateItem error:", error);
        }
    };

    const removeItem = async (itemId: string) => {
        if (!token) return;

        try {
            await fetch("http://localhost:4000/api/cart/" + itemId, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + token },
            });
            await refreshCart();
        } catch (error) {
            console.error("RemoveItem error:", error);
        }
    };

    const clearCart = async () => {
        if (!token) return;

        try {
            await fetch("http://localhost:4000/api/cart/clear", {
                method: "DELETE",
                headers: { Authorization: "Bearer " + token },
            });
            await refreshCart();
        } catch (error) {
            console.error("ClearCart error:", error);
        }
    };

    return (
        <CartContext.Provider value={{
            items,
            summary,
            addToCart,
            updateItem,
            removeItem,
            clearCart,
            isLoading,
            refreshCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}