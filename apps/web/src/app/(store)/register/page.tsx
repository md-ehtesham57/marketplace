"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";
import { Input } from "@marketplace/ui/input";
import { useAuth } from "@/context/auth.context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState("BUYER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm]     = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirm) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await register({ email, password, firstName, lastName, role });

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Registration failed");
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
          <h1 className="text-2xl font-bold text-slate-800 mt-6">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join thousands of buyers and sellers</p>
        </div>

        <Card>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex rounded-lg border border-slate-200 p-1 mb-6">
            <button
              onClick={() => setRole("BUYER")}
              className={"flex-1 py-2 text-sm font-medium rounded-md transition-colors " + (role === "BUYER" ? "bg-sky-500 text-white" : "text-slate-600 hover:text-slate-800")}
            >
              Buyer
            </button>
            <button
              onClick={() => setRole("SELLER")}
              className={"flex-1 py-2 text-sm font-medium rounded-md transition-colors " + (role === "SELLER" ? "bg-sky-500 text-white" : "text-slate-600 hover:text-slate-800")}
            >
              Seller
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input id="firstname" label="First Name" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
              <Input id="lastname"  label="Last Name"  type="text" placeholder="Doe"  value={lastName}  onChange={(e) => setLastName(e.target.value)}  fullWidth />
            </div>
            <Input id="email"    label="Email Address" type="email"    placeholder="you@example.com"   value={email}    onChange={(e) => setEmail(e.target.value)}    fullWidth />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "2.5rem" }}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", top: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", paddingRight: "0.75rem" }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Use a mix of letters, numbers and symbols</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  style={{ paddingRight: "2.5rem" }}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", top: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", paddingRight: "0.75rem" }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth loading={isLoading} onClick={handleRegister}>
              Create Account
            </Button>
          </div>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-sky-500 hover:text-sky-600 font-medium transition-colors">
            Sign in
          </a>
        </p>

      </div>
    </div>
  );
}