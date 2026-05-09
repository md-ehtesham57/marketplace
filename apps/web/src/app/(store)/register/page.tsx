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
  const [confirm, setConfirm]     = useState("");
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
            <Input id="password" label="Password"      type="password" placeholder="Min 8 characters"  value={password} onChange={(e) => setPassword(e.target.value)} hint="Use a mix of letters, numbers and symbols" fullWidth />
            <Input id="confirm"  label="Confirm Password" type="password" placeholder="Re-enter password" value={confirm}  onChange={(e) => setConfirm(e.target.value)}  fullWidth />

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