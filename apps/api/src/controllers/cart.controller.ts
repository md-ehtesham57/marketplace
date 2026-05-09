import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// ── Get Cart ─────────────────────────────────────────────────
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { name: true, slug: true } },
                seller: { select: { storeName: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId as string },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { name: true, slug: true } },
                  seller: { select: { storeName: true } },
                },
              },
            },
          },
        },
      });
    }

    const subtotal = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const originalTotal = cart.items.reduce(
      (acc, item) => acc + item.product.originalPrice * item.quantity,
      0
    );

    res.json({
      cart,
      summary: {
        itemCount: cart.items.length,
        subtotal: Math.round(subtotal),
        originalTotal: Math.round(originalTotal),
        savings: Math.round(originalTotal - subtotal),
        delivery: subtotal >= 500 ? 0 : 99,
        total: Math.round(subtotal + (subtotal >= 500 ? 0 : 99)),
      },
    });
  } catch (error) {
    console.error("GetCart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Add to Cart ──────────────────────────────────────────────
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      res.status(400).json({ error: "Product ID is required" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ error: "Insufficient stock" });
      return;
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId as string },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    res.json({ message: "Product added to cart" });
  } catch (error) {
    console.error("AddToCart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Update Cart Item ─────────────────────────────────────────
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({ error: "Quantity must be at least 1" });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    if (item.product.stock < quantity) {
      res.status(400).json({ error: "Insufficient stock" });
      return;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.json({ message: "Cart item updated" });
  } catch (error) {
    console.error("UpdateCartItem error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Remove Cart Item ─────────────────────────────────────────
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      res.status(404).json({ error: "Cart item not found" });
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("RemoveCartItem error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Clear Cart ───────────────────────────────────────────────
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
    });

    if (!cart) {
      res.status(404).json({ error: "Cart not found" });
      return;
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("ClearCart error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};