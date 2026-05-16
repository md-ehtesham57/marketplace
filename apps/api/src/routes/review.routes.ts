import { Router } from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReview,
  toggleReviewLike,
  getReviewReplies,
  createReviewReply,
  updateReviewReply,
  deleteReviewReply,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:productId/reviews", getProductReviews);
router.get("/:productId/reviews/me", authenticate, getUserReview);
router.post("/:productId/reviews", authenticate, createReview);
router.put("/reviews/:reviewId", authenticate, updateReview);
router.delete("/reviews/:reviewId", authenticate, deleteReview);
router.post("/reviews/:reviewId/like", authenticate, toggleReviewLike);
router.get("/reviews/:reviewId/replies", getReviewReplies);
router.post("/reviews/:reviewId/replies", authenticate, createReviewReply);
router.put("/replies/:replyId", authenticate, updateReviewReply);
router.delete("/replies/:replyId", authenticate, deleteReviewReply);

export default router;
