"use client";

import Link from "next/link";
import { ExternalLink, Trash2, Bookmark as BookmarkIcon } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks, formatIssueUrl } from "@/hooks/useBookmarks";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const { isAuthenticated } = useAuth();
  const { bookmarks, cloudBookmarks, localBookmarks, toggleBookmark, isLoading } = useBookmarks();

  const hasCloudBookmarks = isAuthenticated && cloudBookmarks.length > 0;
  const hasLocalBookmarks = !isAuthenticated && (localBookmarks.length > 0 || bookmarks.length > 0);
  const hasBookmarks = hasCloudBookmarks || hasLocalBookmarks;

  const itemsToDisplay = isAuthenticated
    ? cloudBookmarks.map((b) => ({
        id: b.id.toString(),
        issueId: b.issue_id,
        url: formatIssueUrl(b.issue_id, b.issue_url),
        title: b.issue_title && b.issue_title !== "Bookmarked Issue" ? b.issue_title : b.issue_id,
        repo: b.repo_owner && b.repo_name ? `${b.repo_owner}/${b.repo_name}` : b.issue_id.split("#")[0],
        subtitle: `#${b.issue_number || b.issue_id.split("#")[1] || ""}`,
        isLocal: false,
      }))
    : (localBookmarks.length > 0
        ? localBookmarks
        : bookmarks.map((id) => ({
            issue_id: id,
            issue_url: formatIssueUrl(id),
            issue_title: "Bookmarked Issue",
            repository_name: id.split("#")[0] || "unknown",
          }))
      ).map((b) => ({
        id: b.issue_id,
        issueId: b.issue_id,
        url: formatIssueUrl(b.issue_id, b.issue_url),
        title: b.issue_title && b.issue_title !== "Bookmarked Issue" ? b.issue_title : b.issue_id,
        repo: b.repository_name || b.issue_id.split("#")[0] || "unknown",
        subtitle: "Saved locally",
        isLocal: true,
      }));

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <NavBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-hairline">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.6px] text-ink">
              Bookmarks
            </h1>
            <p className="text-[14px] text-ink-subtle mt-1">
              {isLoading
                ? "Loading your saved issues..."
                : hasBookmarks
                ? `${isAuthenticated ? cloudBookmarks.length : bookmarks.length} saved issue${
                    (isAuthenticated ? cloudBookmarks.length : bookmarks.length) === 1 ? "" : "s"
                  } ready for contribution`
                : "Issues saved for your next contribution session"}
            </p>
          </div>
          <Link
            href="/"
            className="text-[13px] text-ink-subtle hover:text-ink transition-colors"
          >
            ← Back to Feed
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : null}

        {!isLoading && !isAuthenticated && bookmarks.length > 0 && (
          <div className="mb-6 p-4 rounded-[10px] border border-primary/20 bg-primary/10 flex items-center justify-between gap-4">
            <div className="text-[13px] text-ink">
              <span className="font-semibold text-primary-hover">Sync your saved issues: </span>
              <span>Your {bookmarks.length} bookmark(s) are stored locally in this browser session.</span>
            </div>
            <Link
              href="/login?redirect=/bookmarks"
              className="px-3 py-1.5 rounded-[6px] bg-primary text-on-primary hover:bg-primary-hover text-[12px] font-medium transition-colors whitespace-nowrap"
            >
              Sign in to sync
            </Link>
          </div>
        )}

        {!isLoading && !hasBookmarks ? (
          <div className="linear-card p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-2 border border-hairline flex items-center justify-center mx-auto mb-4 text-ink-subtle">
              <BookmarkIcon className="w-6 h-6" />
            </div>
            <h2 className="font-display text-[20px] font-medium text-ink tracking-[-0.4px] mb-2">
              No Bookmarked Issues
            </h2>
            <p className="text-[14px] text-ink-subtle max-w-md mx-auto mb-6 leading-relaxed">
              Browse issues on the main search feed and tap the bookmark icon on any card to track them here.
            </p>
            <Link
              href="/"
              className="btn-primary h-10 px-6 text-[14px]"
            >
              Explore Feed
            </Link>
          </div>
        ) : !isLoading && hasBookmarks ? (
          <div className="space-y-3">
            {itemsToDisplay.map((item) => (
              <div
                key={item.id}
                className="linear-card p-5 flex items-start justify-between gap-4 group hover:border-hairline-strong transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-[16px] font-medium text-ink hover:text-primary-hover transition-colors flex items-center gap-1.5"
                  >
                    <span className="truncate">{item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                  </a>
                  <div className="flex items-center gap-2 text-[13px] text-ink-subtle">
                    <span className="font-mono text-ink-muted">{item.repo}</span>
                    <span className="text-hairline-strong">·</span>
                    <span className={item.isLocal ? "text-[12px] text-ink-tertiary" : "font-mono text-[12px] text-ink-tertiary"}>
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(item.issueId)}
                  className="text-ink-tertiary hover:text-destructive hover:bg-destructive/10 h-8 px-2.5 rounded-[6px] transition-colors cursor-pointer"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
