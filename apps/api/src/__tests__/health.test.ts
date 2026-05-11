import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index";

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.message).toBe("Marketplace API is running");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });
});
