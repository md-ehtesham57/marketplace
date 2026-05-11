import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

// ── Get All Users (Admin) ────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("GetAllUsers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ── Toggle User Status (Admin) ───────────────────────────────
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    const { password: _, ...safeUser } = updated;
    res.json({ message: "User status updated", user: safeUser });
    void _;
  } catch (error) {
    console.error("ToggleUserStatus error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};