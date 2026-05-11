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

const router = Router();

router.use(authenticate);

router.post("/", placeOrder);
router.get("/", getMyOrders);
router.get("/admin/all", authorizeAdmin, getAllOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/status", authorizeAdmin, updateOrderStatus);

export default router;