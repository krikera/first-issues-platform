"use client";

import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { Issue } from "@/types"

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
  handleFilterChange: (filters: any) => void
  setIssues: (issues: Issue[]) => void
  setIsSearching: (searching: boolean) => void
  isBookmarked: (id: string) => boolean
  handleToggleBookmark: (id: string, issueData?: any) => void
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
    // Add refresh=true param to force cache clear
    const url = new URL(window.location.href)
    url.searchParams.set("refresh", "true")
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
                className="bg-card border rounded-lg p-6"
              >
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted w-3/4 rounded" />
                  <div className="h-3 bg-muted w-1/2 rounded" />
                  <div className="h-3 bg-muted w-2/3 rounded" />
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
          setIssues={setIssues}
          setIsSearching={setIsSearching}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-4">
        {/* Error and Empty States */}
        {error && !isSearching ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-destructive rounded-full" />
              <span className="text-destructive font-semibold">Error</span>
            </div>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        ) : null}

        {issues.length === 0 && !error && !isLoading && !isSearching && (
          <div className="bg-card border rounded-lg p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {showBookmarked ? "No Bookmarks Found" : "No Results Found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {showBookmarked
                ? "You haven't bookmarked any issues yet. Browse issues and tap the bookmark icon to save them here."
                : "No issues matched your current filters. Try broadening your search or removing some filters."}
            </p>
            {!showBookmarked && (
              <button
                onClick={() => {
                  handleFilterChange({
                    minStars: "",
                    maxStars: "",
                    minForks: "",
                    language: [],
                    isAssigned: false,
                    category: "all",
                    framework: "",
                    hasPullRequests: false,
                    showBookmarked: false,
                    dateFrom: "",
                    dateTo: "",
                  })
                }}
                className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/10 transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading || isSearching ? (
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-12 text-center">
              <div className="text-primary">
                <div className="text-xl font-semibold mb-4">Loading...</div>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <span>Fetching beginner-friendly issues from GitHub...</span>
                </div>
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border rounded-lg p-6 opacity-50">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted w-3/4 rounded" />
                  <div className="h-3 bg-muted w-1/2 rounded" />
                  <div className="h-3 bg-muted w-2/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Issues List */}
        {!isLoading && !isSearching && issues.length > 0 && (
          <div id="issues-section" className="space-y-4">
            {/* Refresh Button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                title="Refresh to get latest issues"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            {renderIssueList()}

            {/* Load More Button */}
            {!showBookmarked && hasNextPage ? (
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={isSearching}
                  className="px-8 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
