import { Router } from "express";
import { getAllUsers, toggleUserStatus } from "../controllers/user.controller";
import { authenticate, authorizeAdmin } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(authorizeAdmin);

router.get("/admin/all", getAllUsers);
router.put("/admin/:id/status", toggleUserStatus);

export default router;