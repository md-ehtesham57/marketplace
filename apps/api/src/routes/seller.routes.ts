import { Router } from "express";
import {
  getSellerProfile,
  getSellerProducts,
  getSellerOrders,
  getSellerStats,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from "../controllers/seller.controller";
import { authenticate, authorizeSeller } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(authorizeSeller);

router.get("/profile",       getSellerProfile);
router.get("/stats",         getSellerStats);
router.get("/products",      getSellerProducts);
router.get("/orders",        getSellerOrders);
router.post("/products",     createSellerProduct);
router.put("/products/:id",  updateSellerProduct);
router.delete("/products/:id", deleteSellerProduct);

export default router;