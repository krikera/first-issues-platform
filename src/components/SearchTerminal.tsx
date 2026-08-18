"use client";

import { useTransition } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Issue } from "@/types"

import { FilterPanel } from "./search/FilterPanel"
import { SearchForm } from "./search/SearchForm"

interface SearchTerminalProps {
  mobileSearchQuery: string
  setMobileSearchQuery: (query: string) => void
  handleMobileSearch: (e: React.FormEvent) => void
  isSearching: boolean
  showMobileFilter: boolean
  setShowMobileFilter: (show: boolean) => void
  showDesktopFilter: boolean
  setShowDesktopFilter: (show: boolean) => void
  filters: {
    minStars: string
    maxStars: string
    minForks: string
    language: string | string[]
    isAssigned: boolean
    category: string
    framework: string
    hasPullRequests: boolean
    showBookmarked: boolean
    dateFrom: string
    dateTo: string
  }
  handleFilterChange: (filters: any) => void
  issues: Issue[]
}

export function SearchTerminal({
  mobileSearchQuery,
  setMobileSearchQuery,
  handleMobileSearch,
  isSearching,
  showMobileFilter,
  setShowMobileFilter,
  showDesktopFilter,
  setShowDesktopFilter,
  filters,
  handleFilterChange,
  issues,
}: SearchTerminalProps) {
  const [, startTransition] = useTransition()
  return (
    <div className="mb-8">
      <div className="bg-card border border-border rounded-lg p-6 max-w-6xl mx-auto shadow-sm">
        {/* Mobile and Tablet View */}
        <div className="lg:hidden">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground">Search Issues</h2>
            <p className="text-muted-foreground text-sm">
              {issues.length} results found
            </p>
          </div>
          <form onSubmit={handleMobileSearch} className="space-y-4">
            <SearchForm
              searchQuery={mobileSearchQuery}
              onSearchChange={setMobileSearchQuery}
              isLoading={isSearching}
              variant="mobile"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-colors"
                    onClick={() =>
                      startTransition(() => setShowMobileFilter(true))
                    }
                  >
                    Filters
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 max-h-[500px] bg-popover border-border"
                  showBackdrop={true}
                  onInteractOutside={() =>
                    startTransition(() => setShowMobileFilter(false))
                  }
                  onEscapeKeyDown={() =>
                    startTransition(() => setShowMobileFilter(false))
                  }
                  {...(showMobileFilter && { forceMount: true })}
                >
                  <FilterPanel
                    filters={{
                      minStars: filters.minStars,
                      maxStars: filters.maxStars,
                      minForks: filters.minForks,
                      language:
                        typeof filters.language === "object"
                          ? filters.language.join(" ")
                          : filters.language,
                      isAssigned: filters.isAssigned,
                      category: filters.category,
                      framework: filters.framework,
                      hasPullRequests: filters.hasPullRequests,
                      showBookmarked: filters.showBookmarked,
                      dateFrom: filters.dateFrom,
                      dateTo: filters.dateTo,
                    }}
                    onFilterChange={handleFilterChange}
                    setShowFilter={setShowMobileFilter}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </form>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Search Issues
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <span>{issues.length} results found</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleMobileSearch}
            className="flex items-center gap-4"
          >
            <SearchForm
              searchQuery={mobileSearchQuery}
              onSearchChange={setMobileSearchQuery}
              isLoading={isSearching}
              variant="desktop"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors h-[42px]"
            >
              Search
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-6 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-colors h-[42px] whitespace-nowrap"
                  onClick={() =>
                    startTransition(() => setShowDesktopFilter(true))
                  }
                >
                  Advanced Search
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 max-h-[600px] bg-popover border-border"
                showBackdrop={true}
                onInteractOutside={() =>
                  startTransition(() => setShowDesktopFilter(false))
                }
                onEscapeKeyDown={() =>
                  startTransition(() => setShowDesktopFilter(false))
                }
                {...(showDesktopFilter && { forceMount: true })}
              >
                <FilterPanel
                  filters={{
                    minStars: filters.minStars,
                    maxStars: filters.maxStars,
                    minForks: filters.minForks,
                    language:
                      typeof filters.language === "object"
                        ? filters.language.join(" ")
                        : filters.language,
                    isAssigned: filters.isAssigned,
                    category: filters.category,
                    framework: filters.framework,
                    hasPullRequests: filters.hasPullRequests,
                    showBookmarked: filters.showBookmarked,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                  }}
                  onFilterChange={handleFilterChange}
                  setShowFilter={setShowDesktopFilter}
                />
              </PopoverContent>
            </Popover>
          </form>
        </div>
      </div>
    </div>
  )
}
