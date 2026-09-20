"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login?redirect=/profile");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-canvas text-ink">
        <NavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <NavBar />
      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="mb-6">
          <h1 className="font-display text-[26px] sm:text-[30px] font-semibold text-ink tracking-[-0.6px]">
            Account Profile
          </h1>
          <p className="text-[14px] text-ink-subtle mt-1">
            Manage your personal credentials and session settings
          </p>
        </div>

        <div className="linear-panel p-6 sm:p-8 space-y-6">

          <div className="flex items-center gap-4 pb-6 border-b border-hairline">
            <div className="w-14 h-14 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-[20px] font-mono font-medium text-primary">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-[18px] font-semibold text-ink tracking-[-0.3px]">
                {user.full_name || user.username}
              </h2>
              <p className="font-mono text-[13px] text-ink-subtle">@{user.username}</p>
            </div>
          </div>

          <div className="grid gap-5 text-[14px]">
            <div>
              <span className="block text-[11px] font-mono uppercase tracking-[0.4px] text-ink-subtle mb-1">
                Email Address
              </span>
              <p className="text-ink font-medium">{user.email}</p>
            </div>

            {user.bio && (
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-[0.4px] text-ink-subtle mb-1">
                  Bio
                </span>
                <p className="text-ink-muted leading-relaxed">{user.bio}</p>
              </div>
            )}

            <div>
              <span className="block text-[11px] font-mono uppercase tracking-[0.4px] text-ink-subtle mb-1">
                Member Since
              </span>
              <p className="text-ink font-mono text-[13px]">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-hairline flex items-center justify-between">
            <span className="text-[12px] text-ink-subtle">Active session</span>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="gap-2 border-hairline text-destructive-foreground hover:bg-destructive/10 hover:border-destructive/30 text-[13px] h-9 cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
