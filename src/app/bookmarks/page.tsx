"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAuth } from "@/contexts/AuthContext";

export default function BookmarksPage() {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Bookmarks</h1>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Issues
          </Link>
        </div>

        {!isAuthenticated ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Sign in to access cloud bookmarks</h2>
            <p className="text-muted-foreground mb-6">
              Your local bookmarks are saved in this browser. Sign in to sync them across devices.
            </p>
            <Link
              href="/login?redirect=/bookmarks"
              className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Your Bookmarks</h2>
            <p className="text-muted-foreground">
              Browse issues on the home page and tap the bookmark icon to save them here.
            </p>
            <Link
              href="/"
              className="inline-flex mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Issues
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
