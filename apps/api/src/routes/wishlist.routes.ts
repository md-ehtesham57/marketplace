import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from "../controllers/wishlist.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getWishlist);
router.post("/:productId", authenticate, addToWishlist);
router.delete("/:productId", authenticate, removeFromWishlist);
router.post("/check", authenticate, checkWishlist);

export default router;
