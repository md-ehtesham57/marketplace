import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// ── Get User Wishlist ───────────────────────────────────────
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            category: { select: { name: true, slug: true } },
          },
        },
      },
    });

    res.json({ items });
  } catch (error) {
    console.error("GetWishlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Add to Wishlist ─────────────────────────────────────────
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.userId as string,
          productId,
        },
      },
    });

    if (existing) {
      res.json({ message: "Product already in wishlist" });
      return;
    }

    const item = await prisma.wishlist.create({
      data: {
        userId: req.userId as string,
        productId,
      },
    });

    res.status(201).json({ message: "Added to wishlist", item });
  } catch (error) {
    console.error("AddToWishlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Remove from Wishlist ────────────────────────────────────
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.userId as string,
          productId,
        },
      },
    });

    if (!item) {
      res.status(404).json({ error: "Product not in wishlist" });
      return;
    }

    await prisma.wishlist.delete({
      where: { id: item.id },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("RemoveFromWishlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Check Wishlist Status ───────────────────────────────────
export const checkWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.json({ wishlisted: {} });
      return;
    }

    const items = await prisma.wishlist.findMany({
      where: {
        userId: req.userId,
        productId: { in: productIds },
      },
      select: { productId: true },
    });

    const wishlisted: Record<string, boolean> = {};
    for (const id of productIds) {
      wishlisted[id] = items.some((i) => i.productId === id);
    }

    res.json({ wishlisted });
  } catch (error) {
    console.error("CheckWishlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
