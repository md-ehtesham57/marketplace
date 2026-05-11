import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminLoginPage from "@/app/login/page";
import * as authContext from "@/context/auth.context";

vi.mock("@/context/auth.context", () => ({
  useAuth: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("AdminLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the admin login form", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      login: vi.fn(),
    } as any);

    render(<AdminLoginPage />);

    expect(screen.getByText("Sign in to Admin")).toBeInTheDocument();
    expect(screen.getByText("Admin access only")).toBeInTheDocument();
    expect(screen.getByText("Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      login: vi.fn(),
    } as any);

    render(<AdminLoginPage />);

    expect(screen.getByPlaceholderText("admin@marketplace.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("shows error when submitting with empty fields", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      login: vi.fn(),
    } as any);

    render(<AdminLoginPage />);
    fireEvent.click(screen.getByText("Sign In"));

    expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
  });

  it("calls login and redirects on successful submission", async () => {
    const login = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(authContext.useAuth).mockReturnValue({ login } as any);

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@marketplace.com"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Sign In"));

    expect(await screen.findByText("Sign In")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith("admin@test.com", "password123");
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("displays error message on failed login", async () => {
    const login = vi.fn().mockResolvedValue({
      success: false,
      error: "Access denied",
    });
    vi.mocked(authContext.useAuth).mockReturnValue({ login } as any);

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@marketplace.com"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByText("Sign In"));

    expect(await screen.findByText("Access denied")).toBeInTheDocument();
  });

  it("shows loading state while signing in", () => {
    const login = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.mocked(authContext.useAuth).mockReturnValue({ login } as any);

    render(<AdminLoginPage />);

    fireEvent.change(screen.getByPlaceholderText("admin@marketplace.com"), {
      target: { value: "admin@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Sign In"));

    expect(screen.getByText("Signing in...")).toBeInTheDocument();
  });

  it("renders the footer text", () => {
    vi.mocked(authContext.useAuth).mockReturnValue({
      login: vi.fn(),
    } as any);

    render(<AdminLoginPage />);

    expect(screen.getByText("Marketplace Admin Panel v1.0")).toBeInTheDocument();
  });
});
