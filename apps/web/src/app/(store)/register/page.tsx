import { Button } from "@marketplace/ui/button";
import { Card } from "@marketplace/ui/card";
import { Input } from "@marketplace/ui/input";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
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

          {/* Account Type Toggle */}
          <div className="flex rounded-lg border border-slate-200 p-1 mb-6">
            <button className="flex-1 py-2 text-sm font-medium rounded-md bg-sky-500 text-white transition-colors">
              Buyer
            </button>
            <button className="flex-1 py-2 text-sm font-medium rounded-md text-slate-600 hover:text-slate-800 transition-colors">
              Seller
            </button>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400">or register with email</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="firstname"
                label="First Name"
                type="text"
                placeholder="John"
                fullWidth
              />
              <Input
                id="lastname"
                label="Last Name"
                type="text"
                placeholder="Doe"
                fullWidth
              />
            </div>
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              fullWidth
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              hint="Use a mix of letters, numbers and symbols"
              fullWidth
            />
            <Input
              id="confirmpassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              fullWidth
            />

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="accent-sky-500 w-4 h-4 mt-0.5" />
              <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <a href="/terms" className="text-sky-500 hover:text-sky-600 transition-colors">
                  Terms of Service
                </a>
                {" "}and{" "}
                <a href="/privacy" className="text-sky-500 hover:text-sky-600 transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            <Button variant="primary" size="lg" fullWidth>
              Create Account
            </Button>
          </div>

        </Card>

        {/* Login Link */}
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