import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../index";
import { prisma } from "../lib/prisma";

process.env.JWT_SECRET = "test-secret";

const adminToken = jwt.sign({ userId: "admin-1", role: "ADMIN" }, process.env.JWT_SECRET);
const buyerToken = jwt.sign({ userId: "buyer-1", role: "BUYER" }, process.env.JWT_SECRET);

const mockUsers = [
  {
    id: "user-1",
    email: "user1@example.com",
    firstName: "Alice",
    lastName: "Smith",
    role: "BUYER",
    isActive: true,
    createdAt: new Date("2025-01-01"),
    _count: { orders: 3, reviews: 5 },
  },
  {
    id: "user-2",
    email: "user2@example.com",
    firstName: "Bob",
    lastName: "Jones",
    role: "SELLER",
    isActive: true,
    createdAt: new Date("2025-01-02"),
    _count: { orders: 0, reviews: 2 },
  },
];

describe("User Controller (Admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users/admin/all", () => {
    it("returns all users for admin", async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);
      vi.mocked(prisma.user.count).mockResolvedValue(2);

      const res = await request(app)
        .get("/api/users/admin/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it("rejects non-admin users", async () => {
      const res = await request(app)
        .get("/api/users/admin/all")
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden — admin access required");
    });

    it("rejects unauthenticated requests", async () => {
      const res = await request(app).get("/api/users/admin/all");

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/users/admin/:id/status", () => {
    it("toggles user status", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUsers[0] as any);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUsers[0],
        isActive: false,
      } as any);

      const res = await request(app)
        .put("/api/users/admin/user-1/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User status updated");
    });

    it("returns 404 for non-existent user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/users/admin/nonexistent/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });
  });
});
