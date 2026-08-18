"use client";

import { useRouter } from "next/navigation"

import type { Issue } from "@/types"

interface QuickFiltersProps {
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
  onFilterChange: (filters: {
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
    searchQuery: string
    onlyAssigned: boolean
    hasIssues: boolean
    recentlyActive: boolean
  }) => void
  setIssues: (issues: Issue[]) => void
  setIsSearching: (searching: boolean) => void
}

export function QuickFilters({
  filters,
  searchQuery,
  onFilterChange,
  setIssues,
  setIsSearching,
}: QuickFiltersProps) {
  const router = useRouter()

  const handleQuickFilter = (filterUpdate: Partial<typeof filters>) => {
    setIssues([])
    setIsSearching(true)

    const formData = new FormData()
    formData.set("minStars", filterUpdate.minStars || filters.minStars)
    formData.set("maxStars", filterUpdate.maxStars || filters.maxStars)
    formData.set("minForks", filterUpdate.minForks || filters.minForks)
    formData.set(
      "language",
      (filterUpdate.language || filters.language).join(" ")
    )
    formData.set(
      "isAssigned",
      (filterUpdate.isAssigned ?? filters.isAssigned).toString()
    )
    formData.set("category", filterUpdate.category || filters.category)
    formData.set("framework", filterUpdate.framework || filters.framework)
    formData.set(
      "hasPullRequests",
      (filterUpdate.hasPullRequests ?? filters.hasPullRequests).toString()
    )
    formData.set(
      "showBookmarked",
      (filterUpdate.showBookmarked ?? filters.showBookmarked).toString()
    )
    formData.set("searchQuery", searchQuery)
    formData.set("dateFrom", filterUpdate.dateFrom || filters.dateFrom)
    formData.set("dateTo", filterUpdate.dateTo || filters.dateTo)

    const params = new URLSearchParams()
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") params.set(key, value)
    }
    router.push(`/?${params.toString()}`)
  }

  const toggleBookmarked = () => {
    const newBookmarkState = !filters.showBookmarked
    onFilterChange({
      ...filters,
      showBookmarked: newBookmarkState,
      searchQuery,
      onlyAssigned: filters.isAssigned,
      hasIssues: true,
      recentlyActive: false,
    })
    handleQuickFilter({ showBookmarked: newBookmarkState })
  }

  const toggleCategory = () => {
    const newCategory =
      filters.category === "good-first-issue" ? "all" : "good-first-issue"
    onFilterChange({
      ...filters,
      category: newCategory,
      searchQuery,
      onlyAssigned: filters.isAssigned,
      hasIssues: true,
      recentlyActive: false,
    })
    handleQuickFilter({ category: newCategory })
  }

  const togglePullRequests = () => {
    const newPullRequestsState = !filters.hasPullRequests
    onFilterChange({
      ...filters,
      hasPullRequests: newPullRequestsState,
      searchQuery,
      onlyAssigned: filters.isAssigned,
      hasIssues: true,
      recentlyActive: false,
    })
    handleQuickFilter({ hasPullRequests: newPullRequestsState })
  }

  const toggleLanguage = (lang: string) => {
    let newLanguages: string[]
    if (filters.language.includes(lang)) {
      newLanguages = filters.language.filter((l) => l !== lang)
    } else {
      newLanguages = [...filters.language, lang]
    }
    onFilterChange({
      ...filters,
      language: newLanguages,
      searchQuery,
      onlyAssigned: filters.isAssigned,
      hasIssues: true,
      recentlyActive: false,
    })
    handleQuickFilter({ language: newLanguages })
  }

  return (
    <div className="sticky top-24">
      <nav className="bg-card border rounded-lg p-4 space-y-5">
        {/* Quick Filters */}
        <div>
          <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Quick Filters
          </h4>
          <div className="space-y-0.5">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.showBookmarked
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleBookmarked()
              }}
            >
              Bookmarked
            </button>

            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.category === "good-first-issue"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCategory()
              }}
            >
              Good First Issue
            </button>

            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.hasPullRequests
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                togglePullRequests()
              }}
            >
              With Pull Requests
            </button>
          </div>
        </div>

        <hr className="border-border" />

        {/* Languages */}
        <div>
          <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Languages
          </h4>
          <div className="space-y-0.5">
            {["JavaScript", "Python", "TypeScript", "Java", "Go", "Rust"].map(
              (lang) => (
                <button
                  key={lang}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filters.language.includes(lang)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleLanguage(lang)
                  }}
                >
                  {lang}
                </button>
              )
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}
