"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, error, clearError, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/";
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-sm">FI</div>
            <span className="text-2xl font-bold text-foreground">First Issues</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h2>
          <p className="mt-2 text-base font-medium text-muted-foreground">Sign in to sync your bookmarks across devices</p>
        </div>
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-base">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={isLoading} autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-base">Password</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange} disabled={isLoading} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" disabled={isLoading} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {(validationError || error) && (
              <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{validationError || error}</span>
              </div>
            )}
            <Button type="submit" className="w-full font-bold text-base py-6" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-base">
            <span className="text-muted-foreground font-medium">Don&apos;t have an account? </span>
            <Link href="/register" className="text-primary hover:underline font-bold">Sign up</Link>
          </div>
        </div>
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
