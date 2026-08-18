"use client";

import { memo, useMemo, useEffect, useState } from "react"
import { FixedSizeList as List } from "react-window"

import { IssueCard } from "@/components/IssueCard"
import { IssueCardSkeleton } from "@/components/ui/loading"
import type { Issue } from "@/types"

interface BookmarkData {
  issue_id: string
  issue_url: string
  issue_title: string
  repository_name: string
  notes?: string
  tags?: string[]
}

interface VirtualizedIssueListProps {
  issues: Issue[]
  isBookmarked: (id: string) => boolean
  onToggleBookmark: (issueId: string, issueData?: BookmarkData) => void
  showPullRequests: boolean
  isLoading?: boolean
  loadingCount?: number
  errorRetryCallback?: () => void
}

// Error fallback component
const ErrorFallback = memo(({ retry }: { retry?: () => void }) => (
  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-3 h-3 bg-destructive rounded-full" />
      <span className="text-destructive font-semibold">
        Error Rendering Issue
      </span>
    </div>
    <p className="text-sm text-destructive/80 mb-4">
      An error occurred while rendering the issue list. This could be due to
      unexpected data format or a rendering problem.
    </p>
    {retry ? (
      <button
        onClick={retry}
        className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium transition-colors"
      >
        Retry
      </button>
    ) : null}
  </div>
))

ErrorFallback.displayName = "ErrorFallback"

// Single issue row component - memoized for performance
const IssueRow = memo(
  ({
    index,
    style,
    data,
  }: {
    index: number
    style: React.CSSProperties
    data: {
      issues: Issue[]
      isBookmarked: (id: string) => boolean
      onToggleBookmark: (issueId: string, issueData?: BookmarkData) => void
      showPullRequests: boolean
      isLoading: boolean
      onError: (error: Error, index: number) => void
    }
  }) => {
    const {
      issues,
      isBookmarked,
      onToggleBookmark,
      showPullRequests,
      isLoading,
      onError,
    } = data
    const [hasError, setHasError] = useState(false)

    if (isLoading && index >= issues.length) {
      return (
        <div style={style}>
          <IssueCardSkeleton />
        </div>
      )
    }

    const issue = issues[index]

    // Handle null or undefined issue
    if (!issue) {
      return (
        <div style={style}>
          <div className="px-1 pb-4">
            <ErrorFallback />
          </div>
        </div>
      )
    }

    // If this issue previously errored, show error state
    if (hasError) {
      return (
        <div style={style}>
          <div className="px-1 pb-4">
            <ErrorFallback retry={() => setHasError(false)} />
          </div>
        </div>
      )
    }

    // Try to render the issue card with error boundary
    try {
      return (
        <div style={style}>
          <div className="px-1 pb-4">
            <IssueCard
              key={issue.id}
              issue={issue}
              showPullRequests={showPullRequests}
              isBookmarked={isBookmarked(issue.id)}
              onToggleBookmark={() =>
                onToggleBookmark(issue.id, {
                  issue_id: issue.id,
                  issue_url: issue.html_url,
                  issue_title: issue.title,
                  repository_name: issue.repository_name,
                })
              }
            />
          </div>
        </div>
      )
    } catch (error) {
      // Log error but don't crash the entire list
      console.error(`Error rendering issue at index ${index}:`, error)
      setHasError(true)
      onError(error instanceof Error ? error : new Error(String(error)), index)

      return (
        <div style={style}>
          <div className="px-1 pb-8 mt-2">
            <ErrorFallback retry={() => setHasError(false)} />
          </div>
        </div>
      )
    }
  }
)

IssueRow.displayName = "IssueRow"

export const VirtualizedIssueList = memo(
  ({
    issues,
    isBookmarked,
    onToggleBookmark,
    showPullRequests,
    isLoading = false,
    loadingCount = 5,
    errorRetryCallback,
  }: VirtualizedIssueListProps) => {
    // State for tracking errors
    const [errorCount, setErrorCount] = useState<number>(0)
    const [lastErrorTime, setLastErrorTime] = useState<number | null>(null)
    const [hasGlobalError, setHasGlobalError] = useState<boolean>(false)

    // Calculate total items (issues + loading skeletons)
    const totalItems = isLoading ? issues.length + loadingCount : issues.length

    // Estimated height per issue card - reduced for compact design
    const ITEM_HEIGHT = 200

    // Calculate container height (max 80vh to prevent excessive height)
    const containerHeight = Math.min(
      totalItems * ITEM_HEIGHT,
      typeof window !== "undefined" ? window.innerHeight * 0.8 : 600
    )

    // Handle individual item errors
    const handleItemError = (error: Error, index: number) => {
      setErrorCount((prev) => prev + 1)
      setLastErrorTime(Date.now())
      console.error(`Error rendering issue at index ${index}:`, error)

      // If too many errors occur in a short time, show global error
      if (
        errorCount > 3 &&
        lastErrorTime &&
        Date.now() - lastErrorTime < 5000
      ) {
        setHasGlobalError(true)
      }
    }

    // Reset error state when issues change
    useEffect(() => {
      setErrorCount(0)
      setLastErrorTime(null)
      setHasGlobalError(false)
    }, [issues])

    // Memoize the data object to prevent unnecessary re-renders
    const itemData = useMemo(
      () => ({
        issues,
        isBookmarked,
        onToggleBookmark,
        showPullRequests,
        isLoading,
        onError: handleItemError,
      }),
      [issues, isBookmarked, onToggleBookmark, showPullRequests, isLoading]
    )

    // Show global error if needed
    if (hasGlobalError) {
      return (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <div className="inline-block mx-auto mb-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Critical Error
          </h3>
          <p className="text-sm text-destructive/80 mb-4">
            Multiple rendering errors detected. There may be an issue with the
            data format.
          </p>
          <button
            onClick={() => {
              setHasGlobalError(false)
              setErrorCount(0)
              if (errorRetryCallback) {
                errorRetryCallback()
              }
            }}
            className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )
    }

    // Don't render virtualization for small lists (< 10 items)
    if (totalItems < 10) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {issues.map((issue: Issue, index) => {
              try {
                return (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    showPullRequests={showPullRequests}
                    isBookmarked={isBookmarked(issue.id)}
                    onToggleBookmark={() => onToggleBookmark(issue.id)}
                  />
                )
              } catch (error) {
                console.error(`Error rendering issue at index ${index}:`, error)
                return <ErrorFallback key={`error-${index}`} />
              }
            })}
            {isLoading
              ? Array.from({ length: loadingCount }, (_, i) => (
                  <IssueCardSkeleton key={`skeleton-${i}`} />
                ))
              : null}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Results counter */}
        {issues.length > 0 && (
          <div className="bg-card border rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {issues.length} {issues.length === 1 ? "issue" : "issues"} found
            </span>
            {errorCount > 0 && (
              <span className="text-sm text-destructive">
                {errorCount} failed to load
              </span>
            )}
          </div>
        )}

        {/* Virtualized list */}
        <div className="w-full">
          <List
            height={containerHeight}
            width="100%"
            itemCount={totalItems}
            itemSize={ITEM_HEIGHT}
            itemData={itemData}
            className="custom-scrollbar"
            overscanCount={2} // Render 2 extra items for smoother scrolling
          >
            {IssueRow}
          </List>
        </div>
      </div>
    )
  }
)

VirtualizedIssueList.displayName = "VirtualizedIssueList"
