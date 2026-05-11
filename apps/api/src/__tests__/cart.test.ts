import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../index";
import { prisma } from "../lib/prisma";

process.env.JWT_SECRET = "test-secret";

const token = jwt.sign({ userId: "user-1", role: "BUYER" }, process.env.JWT_SECRET);

const mockCart = {
  id: "cart-1",
  userId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
};

const mockProduct = {
  id: "prod-1",
  name: "Test Product",
  price: 999,
  originalPrice: 1499,
  stock: 50,
  isActive: true,
  images: [],
  category: { name: "Electronics", slug: "electronics" },
  seller: { storeName: "Test Store" },
};

describe("Cart Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/cart", () => {
    it("returns cart for authenticated user", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue({
        ...mockCart,
        items: [{ id: "item-1", productId: "prod-1", quantity: 2, product: mockProduct }],
      } as any);

      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.cart).toBeDefined();
      expect(res.body.summary).toBeDefined();
    });

    it("creates a new cart if none exists", async () => {
      vi.mocked(prisma.cart.findUnique)
        .mockResolvedValueOnce(null);

      vi.mocked(prisma.cart.create).mockResolvedValue({
        ...mockCart,
        items: [],
      } as any);

      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(prisma.cart.create).toHaveBeenCalled();
    });

    it("rejects without authentication", async () => {
      const res = await request(app).get("/api/cart");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/cart", () => {
    it("adds item to cart", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.cartItem.create).mockResolvedValue({} as any);

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: "prod-1", quantity: 1 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Product added to cart");
    });

    it("rejects adding out-of-stock product", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        ...mockProduct,
        stock: 0,
      } as any);

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: "prod-1", quantity: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Insufficient stock");
    });

    it("rejects without productId", async () => {
      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Product ID is required");
    });
  });

  describe("PUT /api/cart/:itemId", () => {
    it("updates cart item quantity", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue({
        id: "item-1",
        cartId: "cart-1",
        productId: "prod-1",
        quantity: 1,
        product: mockProduct,
      } as any);
      vi.mocked(prisma.cartItem.update).mockResolvedValue({} as any);

      const res = await request(app)
        .put("/api/cart/item-1")
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart item updated");
    });

    it("rejects with quantity below 1", async () => {
      const res = await request(app)
        .put("/api/cart/item-1")
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Quantity must be at least 1");
    });

    it("rejects if item not in user's cart", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/cart/item-999")
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 2 });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Cart item not found");
    });

    it("rejects if quantity exceeds stock", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue({
        id: "item-1",
        cartId: "cart-1",
        productId: "prod-1",
        quantity: 1,
        product: { ...mockProduct, stock: 2 },
      } as any);

      const res = await request(app)
        .put("/api/cart/item-1")
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Insufficient stock");
    });
  });

  describe("DELETE /api/cart/:itemId", () => {
    it("removes item from cart", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.findFirst).mockResolvedValue({
        id: "item-1",
        cartId: "cart-1",
      } as any);
      vi.mocked(prisma.cartItem.delete).mockResolvedValue({} as any);

      const res = await request(app)
        .delete("/api/cart/item-1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item removed from cart");
    });
  });

  describe("DELETE /api/cart/clear", () => {
    it("clears all items from cart", async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart as any);
      vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 2 } as any);

      const res = await request(app)
        .delete("/api/cart/clear")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart cleared");
    });
  });
});
