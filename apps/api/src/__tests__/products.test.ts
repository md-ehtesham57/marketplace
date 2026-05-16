import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../index";
import { prisma } from "../lib/prisma";

process.env.JWT_SECRET = "test-secret";

const sellerToken = jwt.sign({ userId: "seller-1", role: "SELLER" }, process.env.JWT_SECRET);
const buyerToken = jwt.sign({ userId: "buyer-1", role: "BUYER" }, process.env.JWT_SECRET);

const mockProduct = {
  id: "prod-1",
  name: "Test Product",
  slug: "test-product-123",
  description: "A test product",
  price: 999,
  originalPrice: 1499,
  stock: 50,
  images: [],
  isActive: true,
  isFeatured: true,
  rating: 4.5,
  totalReviews: 100,
  categoryId: "cat-1",
  sellerId: "seller-profile-1",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  category: { name: "Electronics", slug: "electronics" },
  seller: { storeName: "Test Store", rating: 4.8 },
  reviews: [],
};

const mockSellerProfile = {
  id: "seller-profile-1",
  userId: "seller-1",
  storeName: "Test Store",
  description: "Best store",
  rating: 4.8,
  totalSales: 100,
  isVerified: true,
};

describe("Product Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("returns paginated products", async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([mockProduct] as any);
      vi.mocked(prisma.product.count).mockResolvedValue(1);

      const res = await request(app).get("/api/products");

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it("filters products by category", async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([mockProduct] as any);
      vi.mocked(prisma.product.count).mockResolvedValue(1);

      await request(app).get("/api/products?category=electronics");

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: { slug: "electronics" },
          }),
        })
      );
    });

    it("filters products by price range", async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.product.count).mockResolvedValue(0);

      await request(app).get("/api/products?minPrice=500&maxPrice=2000");

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: { gte: 500, lte: 2000 },
          }),
        })
      );
    });

    it("searches products by name", async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.product.count).mockResolvedValue(0);

      await request(app).get("/api/products?search=wireless");

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: "wireless", mode: "insensitive" } },
              { description: { contains: "wireless", mode: "insensitive" } },
            ],
          }),
        })
      );
    });
  });

  describe("GET /api/products/featured", () => {
    it("returns featured products", async () => {
      vi.mocked(prisma.product.findMany).mockResolvedValue([mockProduct] as any);

      const res = await request(app).get("/api/products/featured");

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true, isFeatured: true },
          take: 8,
        })
      );
    });
  });

  describe("GET /api/products/:id", () => {
    it("returns a single product by id", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct as any);

      const res = await request(app).get("/api/products/prod-1");

      expect(res.status).toBe(200);
      expect(res.body.product.name).toBe("Test Product");
    });

    it("returns 404 for non-existent product", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      const res = await request(app).get("/api/products/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Product not found");
    });
  });

  describe("POST /api/products", () => {
    it("allows seller to create a product", async () => {
      vi.mocked(prisma.seller.findUnique).mockResolvedValue(mockSellerProfile as any);
      vi.mocked(prisma.product.create).mockResolvedValue(mockProduct as any);

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({
          name: "New Product",
          description: "A new product",
          price: 1999,
          originalPrice: 2499,
          stock: 10,
          images: [],
          categoryId: "cat-1",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Product created successfully");
    });

    it("rejects product creation without seller profile", async () => {
      vi.mocked(prisma.seller.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          name: "New Product",
          description: "A new product",
          price: 1999,
          originalPrice: 2499,
          categoryId: "cat-1",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Only sellers can create products");
    });

    it("rejects product creation when not authenticated", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({
          name: "New Product",
          description: "A new product",
          price: 1999,
          originalPrice: 2499,
          categoryId: "cat-1",
        });

      expect(res.status).toBe(401);
    });

    it("rejects product creation with missing required fields", async () => {
      vi.mocked(prisma.seller.findUnique).mockResolvedValue(mockSellerProfile as any);

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({ name: "Incomplete" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Required fields missing");
    });
  });
});
