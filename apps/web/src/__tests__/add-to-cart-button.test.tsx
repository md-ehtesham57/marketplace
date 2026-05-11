import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import * as authContext from "@/context/auth.context";
import * as cartContext from "@/context/cart.context";

vi.mock("@/context/auth.context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/cart.context", () => ({
  useCart: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("AddToCartButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with Add to Cart text", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({
      addToCart: vi.fn().mockResolvedValue({ success: true }),
    } as any);

    render(<AddToCartButton productId="product-1" />);

    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("redirects to login when not authenticated", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: false,
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({
      addToCart: vi.fn(),
    } as any);

    render(<AddToCartButton productId="product-1" />);
    fireEvent.click(screen.getByText("Add to Cart"));

    expect(mockPush).toHaveBeenCalledWith("/login?redirect=/");
  });

  it("shows Added state after successful add", async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({
      addToCart: vi.fn().mockResolvedValue({ success: true }),
    } as any);

    render(<AddToCartButton productId="product-1" />);
    fireEvent.click(screen.getByText("Add to Cart"));

    expect(await screen.findByText("✓ Added!")).toBeInTheDocument();
  });

  it("shows error message when add to cart fails", async () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      isAuthenticated: true,
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({
      addToCart: vi.fn().mockResolvedValue({ success: false, error: "Out of stock" }),
    } as any);

    render(<AddToCartButton productId="product-1" />);
    fireEvent.click(screen.getByText("Add to Cart"));

    expect(await screen.findByText("Add to Cart")).toBeInTheDocument();
  });
});
