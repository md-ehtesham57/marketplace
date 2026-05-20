import { apiUrl } from "@/lib/api";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("api utility", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("get", () => {
    it("makes a GET request to the correct URL", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ data: "test" }),
      });

      await api.get("/api/products");

      expect(mockFetch).toHaveBeenCalledWith(
        apiUrl("/api/products"),
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("includes Authorization header when token is provided", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ data: "test" }),
      });

      await api.get("/api/orders", "my-token");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer my-token",
          },
        })
      );
    });

    it("returns the parsed JSON response", async () => {
      const responseData = { products: [], pagination: { total: 0 } };
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve(responseData),
      });

      const result = await api.get("/api/products");
      expect(result).toEqual(responseData);
    });

    it("handles network errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(api.get("/api/products")).rejects.toThrow("Network error");
    });
  });

  describe("post", () => {
    it("makes a POST request with JSON body", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });

      const body = { email: "test@example.com", password: "secret" };
      await api.post("/api/auth/login", body);

      expect(mockFetch).toHaveBeenCalledWith(
        apiUrl("/api/auth/login"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
    });

    it("includes Authorization header when token is provided", async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });

      await api.post("/api/orders", { item: "test" }, "token-123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token-123",
          },
        })
      );
    });
  });
});
