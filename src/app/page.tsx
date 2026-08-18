"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { HeroTerminal } from "@/components/HeroTerminal";
import { SearchSection } from "@/components/SearchSection";
import { ResultsSection } from "@/components/ResultsSection";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useIssueFilters } from "@/hooks/useIssueFilters";
import type { Issue } from "@/types";

function HomeContent() {
  const searchParams = useSearchParams();
  const { toggleBookmark, isBookmarked } = useBookmarks();
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
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("minStars", filters.minStars);
        params.set("maxStars", filters.maxStars);
        params.set("minForks", filters.minForks);
        if (filters.language.length > 0) params.set("language", filters.language.join(" "));
        params.set("isAssigned", String(filters.isAssigned));
        params.set("hasPullRequests", String(filters.hasPullRequests));
        params.set("category", filters.category);
        if (filters.framework) params.set("framework", filters.framework);
        if (filters.searchQuery) params.set("searchQuery", filters.searchQuery);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const response = await fetch(`/api/github/issues?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch issues from API.");
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
    if (!endCursor || !hasNextPage) return;
    setIsSearching(true);

    try {
      const params = new URLSearchParams();
      params.set("minStars", filters.minStars);
      params.set("maxStars", filters.maxStars);
      params.set("minForks", filters.minForks);
      if (filters.language.length > 0) params.set("language", filters.language.join(" "));
      params.set("isAssigned", String(filters.isAssigned));
      params.set("hasPullRequests", String(filters.hasPullRequests));
      params.set("category", filters.category);
      if (filters.framework) params.set("framework", filters.framework);
      if (filters.searchQuery) params.set("searchQuery", filters.searchQuery);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      params.set("cursor", endCursor);

      const response = await fetch(`/api/github/issues?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load more issues from API.");
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

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        <HeroTerminal />
        <div className="container mx-auto px-4 pb-16">
          <SearchSection
            issues={issues}
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
            issues={issues}
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
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
