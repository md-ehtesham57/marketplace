import { Router } from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  getUserReview,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/:productId/reviews", getProductReviews);
router.get("/:productId/reviews/me", authenticate, getUserReview);
router.post("/:productId/reviews", authenticate, createReview);
router.put("/reviews/:reviewId", authenticate, updateReview);
router.delete("/reviews/:reviewId", authenticate, deleteReview);

export default router;