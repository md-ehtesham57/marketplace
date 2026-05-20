"use client";

import { apiUrl } from "@/lib/api";
import { useState } from "react";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";
import { Input } from "@marketplace/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
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
          <h1 className="text-2xl font-bold text-slate-800 mt-6">Forgot password?</h1>
          <p className="text-slate-500 text-sm mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
              {message}
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

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onClick={handleSubmit}
            >
              Send Reset Link
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Remember your password?{" "}
          <a href="/login" className="text-sky-500 hover:text-sky-600 font-medium transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
