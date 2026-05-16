import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// Get All Products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "12",
      category,
      minPrice,
      maxPrice,
      rating,
      sort = "createdAt",
      order = "desc",
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (rating) {
      where.rating = { gte: parseFloat(rating as string) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const allowedSortFields = ["createdAt", "price", "rating", "name", "totalReviews"];
    const sortField = allowedSortFields.includes(sort as string) ? sort : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";
    const orderBy = { [sortField as string]: sortOrder };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          category: { select: { name: true, slug: true } },
          seller: { select: { storeName: true, rating: true } },
        },
      }),
      prisma.product.count({ where }),
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
    console.error("GetProducts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Single Product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: {
        category: { select: { name: true, slug: true } },
        seller: {
          select: {
            storeName: true,
            rating: true,
            totalSales: true,
            isVerified: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true } },
            _count: { select: { replies: true } },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const reviews = product.reviews || [];
    const reviewIds = reviews.map((r) => r.id);
    let likeCounts: Record<string, number> = {};
    let dislikeCounts: Record<string, number> = {};

    if (reviewIds.length > 0) {
      const allLikes = await prisma.reviewLike.findMany({
        where: { reviewId: { in: reviewIds } },
        select: { reviewId: true, type: true },
      });

      for (const l of allLikes) {
        if (l.type === "LIKE") likeCounts[l.reviewId] = (likeCounts[l.reviewId] || 0) + 1;
        else dislikeCounts[l.reviewId] = (dislikeCounts[l.reviewId] || 0) + 1;
      }
    }

    const enrichedReviews = reviews.map((r: any) => ({
      ...r,
      likeCount: likeCounts[r.id] || 0,
      dislikeCount: dislikeCounts[r.id] || 0,
      userLike: null,
    }));

    res.json({ product: { ...product, reviews: enrichedReviews } });
  } catch (error) {
    console.error("GetProduct error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create Product
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      stock,
      images,
      categoryId,
      isFeatured,
    } = req.body;

    if (!name || !description || !price || !originalPrice || !categoryId) {
      res.status(400).json({ error: "Required fields missing" });
      return;
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(403).json({ error: "Only sellers can create products" });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice),
        stock: parseInt(stock) || 0,
        images: images || [],
        categoryId,
        sellerId: seller.id,
        isFeatured: isFeatured || false,
      },
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { storeName: true } },
      },
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("CreateProduct error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Product
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(403).json({ error: "Only sellers can update products" });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id, sellerId: seller.id },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found or unauthorized" });
      return;
    }

    const allowedFields = [
      "name", "description", "price", "originalPrice",
      "stock", "images", "categoryId", "isFeatured",
    ];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        data[field] = field === "price" || field === "originalPrice"
          ? parseFloat(req.body[field])
          : field === "stock"
            ? parseInt(req.body[field]) || 0
            : req.body[field];
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    res.json({ message: "Product updated successfully", product: updated });
  } catch (error) {
    console.error("UpdateProduct error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Product
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(403).json({ error: "Only sellers can delete products" });
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
    console.error("DeleteProduct error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Seller's Own Products
export const getMyProducts = async (req: AuthRequest, res: Response) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.userId },
    });

    if (!seller) {
      res.status(403).json({ error: "Only sellers can view their products" });
      return;
    }

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
      },
    });

    res.json({ products });
  } catch (error) {
    console.error("GetMyProducts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get All Categories
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    res.json({ categories });
  } catch (error) {
    console.error("GetCategories error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Featured Products
export const getFeaturedProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { storeName: true } },
      },
    });

    res.json({ products });
  } catch (error) {
    console.error("GetFeaturedProducts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};