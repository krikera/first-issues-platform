"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { HeroTerminal } from "@/components/HeroTerminal";
import { SearchSection } from "@/components/SearchSection";
import { ResultsSection } from "@/components/ResultsSection";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBookmarks, formatIssueUrl } from "@/hooks/useBookmarks";
import { useIssueFilters } from "@/hooks/useIssueFilters";
import { defaultFilters } from "@/data/defaults";
import type { Issue } from "@/types";

function buildIssueQueryParams(searchParams: URLSearchParams, cursor?: string | null): URLSearchParams {
  const params = new URLSearchParams();
  params.set("minStars", searchParams.get("minStars") || defaultFilters.minStars.toString());
  params.set("maxStars", searchParams.get("maxStars") || defaultFilters.maxStars.toString());
  params.set("minForks", searchParams.get("minForks") || defaultFilters.minForks.toString());
  const lang = searchParams.get("language");
  if (lang) params.set("language", lang);
  params.set("isAssigned", searchParams.get("isAssigned") === "true" ? "true" : "false");
  params.set("hasPullRequests", searchParams.get("hasPullRequests") === "true" ? "true" : "false");
  params.set("category", searchParams.get("category") || defaultFilters.category);
  const framework = searchParams.get("framework");
  if (framework) params.set("framework", framework);
  const query = searchParams.get("searchQuery");
  if (query) params.set("searchQuery", query);
  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) params.set("dateFrom", dateFrom);
  const dateTo = searchParams.get("dateTo");
  if (dateTo) params.set("dateTo", dateTo);
  if (searchParams.get("refresh")) params.set("refresh", searchParams.get("refresh")!);
  if (cursor) params.set("cursor", cursor);
  return params;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const { toggleBookmark, isBookmarked, cloudBookmarks, localBookmarks } = useBookmarks();
  const {
    filters,
    setSearchQuery,
    isSearching,
    setIsSearching,
    handleFilterChange,
  } = useIssueFilters();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState(
    filters.searchQuery || ""
  );

  // Fetch issues on mount and when search params change
  useEffect(() => {
    const fetchIssues = async () => {
      const showBookmarked = searchParams.get("showBookmarked") === "true";
      // If showing only bookmarks, no need to query GitHub API
      if (showBookmarked) {
        setIsLoading(false);
        setIsSearching(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = buildIssueQueryParams(searchParams);
        const response = await fetch(`/api/github/issues?${params.toString()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch issues from API.");
        }
        const data = await response.json();
        setIssues(data.issues || []);
        setHasNextPage(data.hasNextPage || false);
        setEndCursor(data.endCursor || null);
      } catch (err) {
        console.error("Failed to fetch issues:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch issues. Please try again."
        );
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    };

    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLoadMore = async () => {
    if (!endCursor || !hasNextPage || searchParams.get("showBookmarked") === "true") return;
    setIsSearching(true);

    try {
      const params = buildIssueQueryParams(searchParams, endCursor);
      const response = await fetch(`/api/github/issues?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load more issues from API.");
      }
      const data = await response.json();
      setIssues((prev) => [...prev, ...(data.issues || [])]);
      setHasNextPage(data.hasNextPage || false);
      setEndCursor(data.endCursor || null);
    } catch (err) {
      console.error("Failed to load more issues:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const bookmarkedIssues: Issue[] = (
    cloudBookmarks.length > 0
      ? cloudBookmarks.map((b) => ({
          id: b.issue_id,
          title: b.issue_title || b.issue_id,
          html_url: formatIssueUrl(b.issue_id, b.issue_url),
          created_at: b.created_at,
          updated_at: b.created_at,
          repository_url: `https://github.com/${b.repo_owner}/${b.repo_name}`,
          repository_name: `${b.repo_owner}/${b.repo_name}`,
          license: null,
          stars_count: 0,
          fork_count: 0,
          language: null,
          is_assigned: false,
          labels: Array.isArray(b.issue_labels) ? (b.issue_labels as string[]) : [],
          comments_count: 0,
          has_pull_requests: false,
          pr_status: null,
        }))
      : localBookmarks.map((b) => ({
          id: b.issue_id,
          title: b.issue_title || b.issue_id,
          html_url: formatIssueUrl(b.issue_id, b.issue_url),
          created_at: b.created_at || new Date().toISOString(),
          updated_at: b.created_at || new Date().toISOString(),
          repository_url: `https://github.com/${b.repository_name}`,
          repository_name: b.repository_name,
          license: null,
          stars_count: b.stars_count || 0,
          fork_count: 0,
          language: b.language || null,
          is_assigned: false,
          labels: b.labels || [],
          comments_count: 0,
          has_pull_requests: false,
          pr_status: null,
        }))
  );

  const displayedIssues = filters.showBookmarked ? bookmarkedIssues : issues;

  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <NavBar />
      <main className="flex-1">
        <HeroTerminal />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <SearchSection
            issues={displayedIssues}
            minStars={filters.minStars}
            maxStars={filters.maxStars}
            minForks={filters.minForks}
            language={filters.language}
            isAssigned={filters.isAssigned}
            category={filters.category}
            framework={filters.framework}
            hasPullRequests={filters.hasPullRequests}
            showBookmarked={filters.showBookmarked}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            mobileSearchQuery={mobileSearchQuery}
            setMobileSearchQuery={(q) => {
              setMobileSearchQuery(q);
              setSearchQuery(q);
            }}
            isSearching={isSearching}
            setIssues={setIssues}
            setIsSearching={setIsSearching}
            onFilterChange={handleFilterChange}
          />
          <ResultsSection
            issues={displayedIssues}
            error={error}
            isLoading={isLoading}
            isSearching={isSearching}
            hasNextPage={hasNextPage}
            showBookmarked={filters.showBookmarked}
            hasPullRequests={filters.hasPullRequests}
            filters={filters}
            searchQuery={filters.searchQuery}
            handleFilterChange={handleFilterChange}
            setIssues={setIssues}
            setIsSearching={setIsSearching}
            isBookmarked={isBookmarked}
            handleToggleBookmark={toggleBookmark}
            handleLoadMore={handleLoadMore}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-canvas text-ink">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
