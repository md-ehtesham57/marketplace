import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/order.controller";
import { authenticate, authorizeAdmin } from "../middleware/auth";
import { orderLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/", orderLimiter, authenticate, placeOrder);
router.get("/", authenticate, getMyOrders);
router.get("/admin/all", authenticate, authorizeAdmin, getAllOrders);
router.get("/:id", authenticate, getOrder);
router.put("/:id/cancel", authenticate, cancelOrder);
router.put("/:id/status", authenticate, authorizeAdmin, updateOrderStatus);

export default router;