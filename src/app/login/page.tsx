"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, error, clearError, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      const rawRedirect = searchParams.get("redirect");
      let isSafeRedirect = false;

      if (
        rawRedirect &&
        rawRedirect.startsWith("/") &&
        !rawRedirect.startsWith("//") &&
        !rawRedirect.startsWith("/\\")
      ) {
        try {
          const resolved = new URL(rawRedirect, "http://localhost");
          isSafeRedirect = resolved.origin === "http://localhost";
        } catch {
          isSafeRedirect = false;
        }
      }

      const redirectTo = isSafeRedirect && rawRedirect ? rawRedirect : "/";
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    clearError();
    if (!formData.email.trim()) { setValidationError("Email is required"); return; }
    if (!formData.password) { setValidationError("Password is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError("Please enter a valid email address"); return;
    }
    try { await login(formData); } catch { /* handled by AuthContext */ }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationError("");
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <Logo size={32} className="rounded-[6px]" />
            <span className="font-display text-[18px] font-semibold tracking-[-0.2px] text-ink">
              First Issues
            </span>
          </Link>
          <h2 className="font-display text-[26px] font-semibold text-ink tracking-[-0.5px]">
            Welcome back
          </h2>
          <p className="text-[14px] text-ink-subtle">
            Sign in to sync your bookmarks across devices
          </p>
        </div>

        <div className="linear-panel p-7">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-ink-muted">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-ink-muted">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink transition-colors cursor-pointer"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {(validationError || error) && (
              <div className="flex items-start gap-2 text-[13px] text-destructive-foreground bg-destructive/10 border border-destructive/20 p-2.5 rounded-[6px]">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{validationError || error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 font-medium text-[14px] mt-2 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-5 text-center text-[13px]">
            <span className="text-ink-subtle">Don&apos;t have an account? </span>
            <Link href="/register" className="text-primary hover:text-primary-hover font-medium">
              Sign up
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-[13px] text-ink-subtle hover:text-ink transition-colors"
          >
            ← Back to feed
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
