import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import app from "../index";
import { prisma } from "../lib/prisma";

process.env.JWT_SECRET = "test-secret";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  password: "$2a$12$hashedpassword",
  firstName: "John",
  lastName: "Doe",
  role: "BUYER",
  avatar: null,
  isActive: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockCreatedUser = {
  id: "user-2",
  email: "new@example.com",
  firstName: "Jane",
  lastName: "Smith",
  role: "BUYER",
  createdAt: new Date("2025-01-01"),
};

describe("Auth Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser as any);

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "new@example.com",
          password: "password123",
          firstName: "Jane",
          lastName: "Smith",
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Account created successfully");
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe("new@example.com");
    });

    it("rejects registration with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("All fields are required");
    });

    it("rejects registration with short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "short",
          firstName: "John",
          lastName: "Doe",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Password must be at least 8 characters");
    });

    it("rejects duplicate email registration", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          firstName: "John",
          lastName: "Doe",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Email already registered");
    });

    it("prevents registering as ADMIN role", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser as any);

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "hacker@example.com",
          password: "password123",
          firstName: "Evil",
          lastName: "Hacker",
          role: "ADMIN",
        });

      expect(res.status).toBe(201);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: "BUYER" }),
        })
      );
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("rejects login with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password are required");
    });

    it("rejects login with wrong password", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("rejects login for deactivated account", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as any);
      vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Account is deactivated");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns current user with valid token", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        password: undefined,
      } as any);

      const token = jwt.sign({ userId: "user-1", role: "BUYER" }, process.env.JWT_SECRET as string);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("rejects request without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized — no token provided");
    });

    it("rejects request with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized — invalid token");
    });
  });
});
