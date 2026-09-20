"use client";

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
  }) => void
}

export function QuickFilters({
  filters,
  searchQuery,
  onFilterChange,
}: QuickFiltersProps) {
  const toggleBookmarked = () => {
    onFilterChange({
      ...filters,
      showBookmarked: !filters.showBookmarked,
      searchQuery,
    })
  }

  const toggleCategory = () => {
    const newCategory =
      filters.category === "good-first-issue" ? "all" : "good-first-issue"
    onFilterChange({
      ...filters,
      category: newCategory,
      searchQuery,
    })
  }

  const togglePullRequests = () => {
    const newPullRequestsState = !filters.hasPullRequests
    onFilterChange({
      ...filters,
      hasPullRequests: newPullRequestsState,
      searchQuery,
    })
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
    })
  }

  return (
    <div className="sticky top-24">
      <nav className="bg-surface-1 border border-hairline rounded-[12px] p-3.5 space-y-4">
        {/* Quick Filters */}
        <div>
          <h4 className="px-2 text-[11px] font-medium text-ink-subtle mb-2 uppercase tracking-[0.4px]">
            Quick Filters
          </h4>
          <div className="space-y-1">
            <button
              className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                filters.showBookmarked
                  ? "bg-surface-2 text-ink border border-hairline-strong font-medium"
                  : "text-ink-subtle hover:bg-surface-2 hover:text-ink"
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
              className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                filters.category === "good-first-issue"
                  ? "bg-surface-2 text-ink border border-hairline-strong font-medium"
                  : "text-ink-subtle hover:bg-surface-2 hover:text-ink"
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
              className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                filters.hasPullRequests
                  ? "bg-surface-2 text-ink border border-hairline-strong font-medium"
                  : "text-ink-subtle hover:bg-surface-2 hover:text-ink"
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

        <div className="border-t border-hairline" />

        {/* Languages */}
        <div>
          <h4 className="px-2 text-[11px] font-medium text-ink-subtle mb-2 uppercase tracking-[0.4px]">
            Languages
          </h4>
          <div className="space-y-1">
            {["JavaScript", "Python", "TypeScript", "Java", "Go", "Rust"].map(
              (lang) => (
                <button
                  key={lang}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px] transition-all duration-150 cursor-pointer ${
                    filters.language.includes(lang)
                      ? "bg-surface-2 text-primary-hover border border-primary/20 font-medium"
                      : "text-ink-subtle hover:bg-surface-2 hover:text-ink"
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
