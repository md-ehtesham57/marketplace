import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const reviewInclude = {
  user: { select: { firstName: true, lastName: true, avatar: true } },
  _count: { select: { replies: true } },
};

async function enrichReviews(reviews: any[], userId?: string) {
  if (reviews.length === 0) return reviews;

  const reviewIds = reviews.map((r: any) => r.id);

  const allLikes = await prisma.reviewLike.findMany({
    where: { reviewId: { in: reviewIds } },
    select: { reviewId: true, type: true, userId: true },
  });

  const userLikeMap: Record<string, string | null> = {};
  if (userId) {
    for (const l of allLikes) {
      if (l.userId === userId) {
        userLikeMap[l.reviewId] = l.type;
      }
    }
  }

  const likeCounts: Record<string, number> = {};
  const dislikeCounts: Record<string, number> = {};
  for (const l of allLikes) {
    if (l.type === "LIKE") likeCounts[l.reviewId] = (likeCounts[l.reviewId] || 0) + 1;
    else dislikeCounts[l.reviewId] = (dislikeCounts[l.reviewId] || 0) + 1;
  }

  return reviews.map((r: any) => ({
    ...r,
    likeCount: likeCounts[r.id] || 0,
    dislikeCount: dislikeCounts[r.id] || 0,
    userLike: userLikeMap[r.id] || null,
  }));
}

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
        include: reviewInclude,
      });

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
        include: reviewInclude,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    const enriched = await enrichReviews(reviews, req.userId);

    res.json({
      reviews: enriched,
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
        include: reviewInclude,
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
      include: reviewInclude,
    });

    const enriched = review ? (await enrichReviews([review], req.userId))[0] : null;

    res.json({ review: enriched });
  } catch (error) {
    console.error("GetUserReview error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Toggle Review Like / Dislike ─────────────────────────────
export const toggleReviewLike = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { type } = req.body;

    if (!type || !["LIKE", "DISLIKE"].includes(type)) {
      res.status(400).json({ error: "Type must be LIKE or DISLIKE" });
      return;
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const existing = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId: req.userId as string,
          reviewId,
        },
      },
    });

    if (existing) {
      if (existing.type === type) {
        await prisma.reviewLike.delete({ where: { id: existing.id } });
        res.json({ action: "removed", type: null });
      } else {
        await prisma.reviewLike.update({
          where: { id: existing.id },
          data: { type },
        });
        res.json({ action: "switched", type });
      }
    } else {
      await prisma.reviewLike.create({
        data: {
          userId: req.userId as string,
          reviewId,
          type,
        },
      });
      res.json({ action: "added", type });
    }
  } catch (error) {
    console.error("ToggleReviewLike error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Get Review Replies ───────────────────────────────────────
export const getReviewReplies = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;

    const replies = await prisma.reviewReply.findMany({
      where: { reviewId },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });

    res.json({ replies });
  } catch (error) {
    console.error("GetReviewReplies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Create Review Reply ──────────────────────────────────────
export const createReviewReply = async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      res.status(404).json({ error: "Review not found" });
      return;
    }

    const reply = await prisma.reviewReply.create({
      data: {
        userId: req.userId as string,
        reviewId,
        content: content.trim(),
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });

    res.status(201).json({ message: "Reply posted successfully", reply });
  } catch (error) {
    console.error("CreateReviewReply error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Update Review Reply ──────────────────────────────────────
export const updateReviewReply = async (req: AuthRequest, res: Response) => {
  try {
    const { replyId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const reply = await prisma.reviewReply.findFirst({
      where: { id: replyId, userId: req.userId },
    });

    if (!reply) {
      res.status(404).json({ error: "Reply not found or unauthorized" });
      return;
    }

    const updated = await prisma.reviewReply.update({
      where: { id: replyId },
      data: { content: content.trim() },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });

    res.json({ message: "Reply updated successfully", reply: updated });
  } catch (error) {
    console.error("UpdateReviewReply error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Delete Review Reply ──────────────────────────────────────
export const deleteReviewReply = async (req: AuthRequest, res: Response) => {
  try {
    const { replyId } = req.params;

    const reply = await prisma.reviewReply.findFirst({
      where: { id: replyId, userId: req.userId },
    });

    if (!reply) {
      res.status(404).json({ error: "Reply not found or unauthorized" });
      return;
    }

    await prisma.reviewReply.delete({ where: { id: replyId } });

    res.json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("DeleteReviewReply error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
