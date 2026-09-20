"use client";

import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { Issue } from "@/types"
import type { BookmarkData } from "@/contexts/BookmarkContext"

import ClientOnly from "./ClientOnly"
import { QuickFilters } from "./search/QuickFilters"
import { VirtualizedIssueList } from "./VirtualizedIssueList"

interface ResultsSectionProps {
  issues: Issue[]
  error: string | null
  isLoading: boolean
  isSearching: boolean
  hasNextPage: boolean
  showBookmarked: boolean
  hasPullRequests: boolean
  filters: {
    minStars: string
    maxStars: string
    minForks: string
    language: string[]
    isAssigned: boolean
    category: string
    framework: string
    hasPullRequests: boolean
    showBookmarked: boolean
    dateFrom: string
    dateTo: string
  }
  searchQuery: string
  handleFilterChange: (filters: Record<string, unknown>) => void
  setIssues: (issues: Issue[]) => void
  setIsSearching: (searching: boolean) => void
  isBookmarked: (id: string) => boolean
  handleToggleBookmark: (id: string, issueData?: BookmarkData) => void
  handleLoadMore: () => void
}

export function ResultsSection({
  issues,
  error,
  isLoading,
  isSearching,
  hasNextPage,
  showBookmarked,
  hasPullRequests,
  filters,
  searchQuery,
  handleFilterChange,
  setIssues,
  setIsSearching,
  isBookmarked,
  handleToggleBookmark,
  handleLoadMore,
}: ResultsSectionProps) {
  const router = useRouter()

  const handleRefresh = () => {
    // Add unique refresh timestamp param to force cache clear and trigger Next.js route change
    const url = new URL(window.location.href)
    url.searchParams.set("refresh", Date.now().toString())
    router.replace(url.pathname + url.search)
  }

  const renderIssueList = () => {
    return (
      <ClientOnly
        fallback={
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="linear-card p-5 space-y-3"
              >
                <div className="animate-pulse space-y-2.5">
                  <div className="h-4 bg-surface-2 w-3/4 rounded-[4px]" />
                  <div className="h-3 bg-surface-2 w-1/3 rounded-[4px]" />
                  <div className="h-3 bg-surface-2 w-1/2 rounded-[4px]" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <VirtualizedIssueList
          issues={issues || []}
          isBookmarked={isBookmarked}
          onToggleBookmark={handleToggleBookmark}
          showPullRequests={hasPullRequests}
          isLoading={isSearching}
          loadingCount={5}
        />
      </ClientOnly>
    )
  }

  return (
    <div
      id="results-section"
      className="grid grid-cols-1 lg:grid-cols-5 gap-6 scroll-mt-20"
    >
      {/* Sidebar Terminal (Desktop Only) */}
      <div className="hidden lg:block lg:col-span-1">
        <QuickFilters
          filters={{
            minStars: filters.minStars,
            maxStars: filters.maxStars,
            minForks: filters.minForks,
            language: filters.language,
            isAssigned: filters.isAssigned,
            category: filters.category,
            framework: filters.framework,
            hasPullRequests: filters.hasPullRequests,
            showBookmarked: filters.showBookmarked,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
          }}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-4">
        {/* Error and Empty States */}
        {error && !isSearching ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-[12px] p-6 text-ink">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <span className="text-[14px] font-medium text-destructive-foreground">Search Error</span>
            </div>
            <p className="text-[13px] text-ink-subtle">{error}</p>
          </div>
        ) : null}

        {issues.length === 0 && !error && !isLoading && !isSearching && (
          <div className="linear-card p-12 text-center">
            <h3 className="font-display text-[18px] font-medium text-ink tracking-[-0.3px] mb-2">
              {showBookmarked ? "No Bookmarked Issues" : "No Issues Found"}
            </h3>
            <p className="text-[14px] text-ink-subtle max-w-md mx-auto mb-6 leading-relaxed">
              {showBookmarked
                ? "You haven't bookmarked any issues yet. Browse issues and tap the bookmark icon on any card to save it."
                : "No open-source issues matched your current search filters. Try broadening your criteria."}
            </p>
            {!showBookmarked && (
              <button
                onClick={() => {
                  handleFilterChange({
                    minStars: "0",
                    maxStars: "1000000",
                    minForks: "0",
                    language: [],
                    isAssigned: false,
                    category: "all",
                    framework: "",
                    hasPullRequests: false,
                    showBookmarked: false,
                    dateFrom: "",
                    dateTo: "",
                    searchQuery: "",
                  })
                }}
                className="btn-secondary h-9 px-4 text-[13px] cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading || isSearching ? (
          <div className="space-y-3">
            <div className="linear-card p-10 text-center">
              <div className="flex justify-center items-center gap-1.5 mb-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <div className="font-display text-[15px] font-medium text-ink">
                Fetching GitHub Issues...
              </div>
              <div className="text-[13px] text-ink-subtle mt-1">
                Fetching beginner-friendly issues from active repositories
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="linear-card p-5 opacity-60">
                <div className="animate-pulse space-y-2.5">
                  <div className="h-4 bg-surface-2 w-3/4 rounded-[4px]" />
                  <div className="h-3 bg-surface-2 w-1/3 rounded-[4px]" />
                  <div className="h-3 bg-surface-2 w-1/2 rounded-[4px]" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Issues List */}
        {!isLoading && !isSearching && issues.length > 0 && (
          <div id="issues-section" className="space-y-4">
            {/* Refresh Button */}
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={handleRefresh}
                className="btn-secondary h-8 px-3 text-[12px] gap-1.5 cursor-pointer"
                title="Refresh to get latest issues"
                aria-label="Refresh issue feed"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Refresh Feed</span>
              </button>
            </div>
            {renderIssueList()}

            {/* Load More Button */}
            {!showBookmarked && hasNextPage ? (
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isSearching}
                  className="btn-primary h-10 px-8 text-[14px] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Issues</span>
                  )}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
