import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getMyProducts,
  getCategories,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/categories", getCategories);
router.get("/featured", getFeaturedProducts);
router.get("/my", authenticate, getMyProducts);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", authenticate, createProduct);
router.put("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);

export default router;
