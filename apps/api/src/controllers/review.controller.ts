import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// ── Create Review ────────────────────────────────────────────
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: req.userId as string,
          productId,
        },
      },
    });

    if (existingReview) {
      res.status(409).json({ error: "You have already reviewed this product" });
      return;
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          userId: req.userId as string,
          productId,
          rating: parseInt(rating),
          comment: comment || null,
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      });

      // Recalculate product rating
      const allReviews = await tx.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          totalReviews: allReviews.length,
        },
      });

      return newReview;
    });

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    console.error("CreateReview error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get Product Reviews ──────────────────────────────────────
export const getProductReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("GetProductReviews error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Update Review ────────────────────────────────────────────
export const updateReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId: req.userId },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found or unauthorized" });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: {
          rating: rating ? parseInt(rating) : review.rating,
          comment: comment !== undefined ? comment : review.comment,
        },
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      });

      const allReviews = await tx.review.findMany({
        where: { productId: review.productId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

      await tx.product.update({
        where: { id: review.productId },
        data: { rating: Math.round(avgRating * 10) / 10 },
      });

      return updatedReview;
    });

    res.json({ message: "Review updated successfully", review: updated });
  } catch (error) {
    console.error("UpdateReview error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Delete Review ────────────────────────────────────────────
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findFirst({
      where: { id: reviewId, userId: req.userId },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found or unauthorized" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });

      const allReviews = await tx.review.findMany({
        where: { productId: review.productId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
          : 0;

      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          totalReviews: allReviews.length,
        },
      });
    });

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("DeleteReview error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Check if user reviewed product ──────────────────────────
export const getUserReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const review = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: req.userId as string,
          productId,
        },
      },
    });

    res.json({ review });
  } catch (error) {
    console.error("GetUserReview error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};