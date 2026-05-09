"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";
import { Input } from "@marketplace/ui/input";
import { useAuth } from "@/context/auth.context";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Login failed");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
              Market<span className="text-sky-500">place</span>
            </span>
          </a>
          <h1 className="text-2xl font-bold text-slate-800 mt-6">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <div>
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <div className="text-right mt-1">
                <a href="/forgot-password" className="text-xs text-sky-500 hover:text-sky-600 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="accent-sky-500 w-4 h-4" />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={handleLogin}
            >
              Sign In
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-sky-500 hover:text-sky-600 font-medium transition-colors">
            Create one for free
          </a>
        </p>

      </div>
    </div>
  );
}