import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../index";
import { prisma } from "../lib/prisma";

process.env.JWT_SECRET = "test-secret";

const userToken = jwt.sign({ userId: "user-1", role: "BUYER" }, process.env.JWT_SECRET);
const adminToken = jwt.sign({ userId: "admin-1", role: "ADMIN" }, process.env.JWT_SECRET);

const mockCart = {
  id: "cart-1",
  userId: "user-1",
  items: [
    {
      id: "ci-1",
      cartId: "cart-1",
      productId: "prod-1",
      quantity: 2,
      product: {
        id: "prod-1",
        name: "Test Product",
        price: 999,
        stock: 50,
      },
    },
  ],
};

const mockOrder = {
  id: "order-1",
  userId: "user-1",
  status: "CONFIRMED",
  totalAmount: 1998,
  deliveryAddress: "123 Test St, Mumbai, Maharashtra - 400001",
  paymentMethod: "COD",
  paymentStatus: "PENDING",
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: "oi-1",
      productId: "prod-1",
      quantity: 2,
      price: 999,
      product: { name: "Test Product", images: [] },
    },
  ],
};

describe("Order Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockImplementation(async ({ where }: any) => ({
      id: where.id,
      role: where.id === "admin-1" ? "ADMIN" : "BUYER",
      isActive: true,
    }) as any);
  });

  describe("POST /api/orders", () => {
    it("places an order successfully", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.order.create).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
        const tx = {
          order: { create: vi.fn().mockResolvedValue(mockOrder) },
          product: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          cartItem: { deleteMany: vi.fn() },
        };
        return fn(tx);
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          deliveryAddress: "123 Test St, Mumbai, Maharashtra - 400001",
          paymentMethod: "COD",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Order placed successfully");
    });

    it("rejects order with empty cart", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        ...mockCart,
        items: [],
      } as any);

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          deliveryAddress: "123 Test St",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Cart is empty");
    });

    it("rejects order without delivery address", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Delivery address is required");
    });

    it("rejects order with insufficient stock", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        ...mockCart,
        items: [{
          ...mockCart.items[0],
          quantity: 999,
          product: { ...mockCart.items[0].product, stock: 1 },
        }],
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
        const tx = {
          product: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
        };
        return fn(tx);
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          deliveryAddress: "123 Test St",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Insufficient stock");
    });
  });

  describe("GET /api/orders", () => {
    it("returns user's orders", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([mockOrder] as any);
      vi.mocked(prisma.order.count).mockResolvedValue(1);

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe("GET /api/orders/admin/all", () => {
    it("returns all orders for admin", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([mockOrder] as any);
      vi.mocked(prisma.order.count).mockResolvedValue(1);

      const res = await request(app)
        .get("/api/orders/admin/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toHaveLength(1);
    });

    it("rejects non-admin users", async () => {
      const res = await request(app)
        .get("/api/orders/admin/all")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("returns a single order for the owner", async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(mockOrder as any);

      const res = await request(app)
        .get("/api/orders/order-1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.order.id).toBe("order-1");
    });

    it("returns 404 for non-existent order", async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/orders/nonexistent")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/orders/:id/cancel", () => {
    it("cancels an order in CONFIRMED status", async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
        const tx = {
          order: { update: vi.fn() },
          product: { update: vi.fn() },
        };
        return fn(tx);
      });

      const res = await request(app)
        .put("/api/orders/order-1/cancel")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Order cancelled successfully");
    });

    it("rejects cancellation for delivered order", async () => {
      vi.mocked(prisma.order.findFirst).mockResolvedValue({
        ...mockOrder,
        status: "DELIVERED",
      } as any);

      const res = await request(app)
        .put("/api/orders/order-1/cancel")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Order cannot be cancelled at this stage");
    });
  });

  describe("Rate Limiting", () => {
    it("blocks order placement after 5 attempts", async () => {
      const attempt = () =>
        request(app)
          .post("/api/orders")
          .send({ deliveryAddress: "Rate limit test address" });

      const lastAllowed = await attempt();
      expect([400, 401]).toContain(lastAllowed.status);

      const blocked = await attempt();
      expect(blocked.status).toBe(429);
      expect(blocked.body.error).toBe("Too many orders placed. Slow down.");
    });
  });

  describe("PUT /api/orders/:id/status", () => {
    it("allows admin to update order status", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);
      vi.mocked(prisma.order.update).mockResolvedValue({
        ...mockOrder,
        status: "SHIPPED",
      } as any);

      const res = await request(app)
        .put("/api/orders/order-1/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Order status updated");
    });

    it("rejects invalid order status", async () => {
      const res = await request(app)
        .put("/api/orders/order-1/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INVALID_STATUS" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid order status");
    });

    it("rejects non-admin from updating status", async () => {
      const res = await request(app)
        .put("/api/orders/order-1/status")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "SHIPPED" });

      expect(res.status).toBe(403);
    });
  });
});
