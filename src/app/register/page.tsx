"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, error, clearError, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    clearError();
    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return;
    }
    if (!formData.username.trim()) {
      setValidationError("Username is required");
      return;
    }
    if (!formData.password) {
      setValidationError("Password is required");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setValidationError("Password must contain at least one uppercase letter, one lowercase letter, and one digit");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setValidationError("Please enter a valid email address");
      return;
    }
    try {
      await register(formData);
    } catch {
      /* handled by AuthContext */
    }
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
            Create your account
          </h2>
          <p className="text-[14px] text-ink-subtle">
            Join to sync bookmarks and access analytics
          </p>
        </div>

        <div className="linear-panel p-7">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-[13px] font-medium text-ink-muted">
                Full Name <span className="text-ink-tertiary">(optional)</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

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
              <Label htmlFor="username" className="text-[13px] font-medium text-ink-muted">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="username"
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
                  autoComplete="new-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-ink-muted">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-5 text-center text-[13px]">
            <span className="text-ink-subtle">Already have an account? </span>
            <Link href="/login" className="text-primary hover:text-primary-hover font-medium">
              Sign in
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
