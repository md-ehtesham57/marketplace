import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authenticate, authorizeAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", placeOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/status", authorizeAdmin, updateOrderStatus);

export default router;