"use client";

import { Navbar } from "@marketplace/ui/navbar";
import { Button } from "@marketplace/ui/button";
import { useAuth } from "@/context/auth.context";
import { useCart } from "@/context/cart.context";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
];

export function AppNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const logo = (
    <a href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">M</span>
      </div>
      <span className="text-xl font-bold text-slate-800">
        Market<span className="text-sky-500">place</span>
      </span>
    </a>
  );

  const actions = (
    <div className="flex items-center gap-3">
      <a href="/wishlist" className="text-slate-600 hover:text-red-500 transition-colors" aria-label="Wishlist">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </a>

      <a href="/cart" className="relative text-slate-600 hover:text-sky-500 transition-colors" aria-label="Cart">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {items.length}
        </span>
      </a>

      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          <a href="/orders" className="text-sm text-slate-600 hover:text-sky-500 transition-colors hidden md:block">
            My Orders
          </a>
          <span className="text-sm text-slate-600 hidden md:block">
            Hi, {user?.firstName}!
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <a href="/login">Login</a>
          </Button>
          <Button variant="primary" size="sm">
            <a href="/register">Sign Up</a>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Navbar
      logo={logo}
      navItems={navItems}
      actions={actions}
    />
  );
}