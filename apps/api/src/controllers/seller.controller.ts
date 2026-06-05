import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// ── Get Seller Profile ───────────────────────────────────────
export const getSellerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }

    res.json({ seller });
  } catch (error) {
    console.error("GetSellerProfile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get Seller Products ──────────────────────────────────────
export const getSellerProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.id },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      prisma.product.count({ where: { sellerId: seller.id } }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("GetSellerProducts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get Seller Orders ────────────────────────────────────────
export const getSellerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { product: { sellerId: seller.id } },
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, images: true } },
        order: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    const total = await prisma.orderItem.count({
      where: { product: { sellerId: seller.id } },
    });

    res.json({
      orderItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("GetSellerOrders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get Seller Stats ─────────────────────────────────────────
export const getSellerStats = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }

    const [totalProducts, totalOrderItems, revenue] = await Promise.all([
      prisma.product.count({ where: { sellerId: seller.id } }),
      prisma.orderItem.count({ where: { product: { sellerId: seller.id } } }),
      prisma.orderItem.findMany({
        where: { product: { sellerId: seller.id } },
        select: { price: true, quantity: true },
      }),
    ]);

    const totalRevenue = revenue.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    res.json({
      stats: {
        totalProducts,
        totalOrders: totalOrderItems,
        totalRevenue: Math.round(totalRevenue),
        rating: seller.rating,
        isVerified: seller.isVerified,
        storeName: seller.storeName,
      },
    });
  } catch (error) {
    console.error("GetSellerStats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Create Seller Product ────────────────────────────────────
export const createSellerProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, originalPrice, stock, categoryId, isFeatured } = req.body;

    if (!name || !description || !price || !originalPrice || !categoryId) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        stock: parseInt(stock) || 0,
        categoryId,
        sellerId: seller.id,
        isFeatured: isFeatured || false,
        images: [],
      },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("CreateSellerProduct error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Update Seller Product ────────────────────────────────────
export const updateSellerProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found or unauthorized" });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { ...req.body },
    });

    res.json({ message: "Product updated", product: updated });
  } catch (error) {
    console.error("UpdateSellerProduct error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Delete Seller Product ────────────────────────────────────
export const deleteSellerProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(404).json({ error: "Seller profile not found" });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found or unauthorized" });
      return;
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DeleteSellerProduct error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};