import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
import * as authContext from "@/context/auth.context";

vi.mock("@/context/auth.context", () => ({
  useAuth: vi.fn(),
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard header", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({ token: null } as any);

    render(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Welcome back! Here is what is happening.")).toBeInTheDocument();
  });

  it("renders all four stat cards", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({ token: null } as any);

    render(<DashboardPage />);

    expect(screen.getByText("Total Products")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({ token: null } as any);

    render(<DashboardPage />);

    const loadingIndicators = screen.getAllByText("...");
    expect(loadingIndicators.length).toBeGreaterThanOrEqual(4);
  });

  it("fetches stats when token is available", async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({ token: "admin-token" } as any);

    mockFetch.mockImplementation((url: string) => {
      if (url.includes("products")) {
        return Promise.resolve({
          json: () => Promise.resolve({ pagination: { total: 42 } }),
        });
      }
      if (url.includes("orders")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            pagination: { total: 15 },
            orders: [
              { id: "order-1", status: "DELIVERED", totalAmount: 2500, createdAt: "2025-01-15T00:00:00Z" },
            ],
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<DashboardPage />);

    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(await screen.findByText("15")).toBeInTheDocument();
    expect(await screen.findByText("15")).toBeInTheDocument();
    expect(await screen.findByText("DELIVERED")).toBeInTheDocument();
  });

  it("shows 'No orders yet' when there are no orders", async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({ token: "admin-token" } as any);

    mockFetch.mockImplementation((url: string) => {
      if (url.includes("products")) {
        return Promise.resolve({
          json: () => Promise.resolve({ pagination: { total: 0 } }),
        });
      }
      if (url.includes("orders")) {
        return Promise.resolve({
          json: () => Promise.resolve({
            pagination: { total: 0 },
            orders: [],
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<DashboardPage />);

    expect(await screen.findByText("No orders yet")).toBeInTheDocument();
  });

  it("renders Recent Orders section", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({ token: null } as any);

    render(<DashboardPage />);

    expect(screen.getByText("Recent Orders")).toBeInTheDocument();
    expect(screen.getByText("View all →")).toBeInTheDocument();
  });
});
