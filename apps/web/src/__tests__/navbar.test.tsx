import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppNavbar } from "@/components/navbar";
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

describe("AppNavbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the logo and brand name", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({ items: [] } as any);

    render(<AppNavbar />);

    expect(screen.getByText("Market")).toBeInTheDocument();
    expect(screen.getByText("place")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({ items: [] } as any);

    render(<AppNavbar />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Deals")).toBeInTheDocument();
  });

  it("shows Login and Sign Up buttons when not authenticated", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({ items: [] } as any);

    render(<AppNavbar />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("shows user name and logout when authenticated", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: { firstName: "John" },
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({ items: [{ id: "1" }] } as any);

    render(<AppNavbar />);

    expect(screen.getByText("Hi, John!")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("My Orders")).toBeInTheDocument();
  });

  it("displays cart item count", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      isAuthenticated: true,
      logout: vi.fn(),
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({
      items: [{ id: "1" }, { id: "2" }, { id: "3" }],
    } as any);

    render(<AppNavbar />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls logout and redirects on logout click", () => {
    const logout = vi.fn();
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: { firstName: "John" },
      isAuthenticated: true,
      logout,
    } as any);
    vi.mocked(cartContext.useCart).mockReturnValue({ items: [] } as any);

    render(<AppNavbar />);

    fireEvent.click(screen.getByText("Logout"));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
