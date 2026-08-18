"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FilterPanel } from "@/components/search/FilterPanel"
import { SearchForm } from "@/components/search/SearchForm"
import { defaultFilters } from "@/data/defaults"
import type { Issue } from "@/types"
import { sanitizeFormData, sanitizeSearchInput } from "@/utils/clientValidation"

interface Filters {
  minStars: string
  maxStars: string
  minForks: string
  language: string[]
  category: string
  framework: string
  searchQuery: string
  onlyAssigned: boolean
  hasIssues: boolean
  recentlyActive: boolean
  isAssigned: boolean
  hasPullRequests: boolean
  showBookmarked: boolean
  dateFrom?: string
  dateTo?: string
  [key: string]: string | string[] | boolean | undefined
}

interface SearchSectionProps {
  issues: Issue[]
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
  mobileSearchQuery: string
  setMobileSearchQuery: (query: string) => void
  isSearching: boolean
  setIssues: (issues: Issue[]) => void
  setIsSearching: (searching: boolean) => void
  onFilterChange: (filters: Filters) => void
}

export function SearchSection({
  issues,
  minStars,
  maxStars,
  minForks,
  language,
  isAssigned,
  category,
  framework,
  hasPullRequests,
  showBookmarked,
  dateFrom,
  dateTo,
  mobileSearchQuery,
  setMobileSearchQuery,
  isSearching,
  setIssues,
  setIsSearching,
  onFilterChange,
}: SearchSectionProps) {
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [showDesktopFilter, setShowDesktopFilter] = useState(false)
  const router = useRouter()

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Sanitize search input before creating form data
    const sanitizedSearchQuery = sanitizeSearchInput(mobileSearchQuery)

    const formData = new FormData()
    Object.entries({
      minStars,
      maxStars,
      minForks,
      searchQuery: sanitizedSearchQuery,
      category,
      framework,
      hasPullRequests: hasPullRequests.toString(),
      showBookmarked: showBookmarked.toString(),
      isAssigned: isAssigned.toString(),
      language: language.join(" "),
      dateFrom,
      dateTo,
    }).forEach(([key, value]) => {
      const typedKey = key as keyof typeof defaultFilters
      if (key === "language") {
        const defaultLanguageValue = (
          defaultFilters[typedKey] as string[]
        ).join(" ")
        if (value !== defaultLanguageValue) {
          formData.set(key, value)
        } else {
          formData.delete(key)
        }
      } else if (value !== defaultFilters[typedKey].toString()) {
        formData.set(key, value)
      } else {
        formData.delete(key)
      }
    })

    // Sanitize all form data
    const sanitizedFormData = sanitizeFormData(formData)
    setIssues([])
    setIsSearching(true)
    const params = new URLSearchParams()
    for (const [key, value] of sanitizedFormData.entries()) {
      if (typeof value === "string") params.set(key, value)
    }
    router.push(`/?${params.toString()}`)
  }

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
              <Popover
                open={showMobileFilter}
                onOpenChange={setShowMobileFilter}
              >
                <PopoverTrigger asChild>
                  <button className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-colors">
                    Filters
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 max-h-[500px] bg-popover border-border"
                  showBackdrop={true}
                >
                  <FilterPanel
                    filters={{
                      minStars,
                      maxStars,
                      minForks,
                      language: language.join(" "),
                      isAssigned,
                      category,
                      framework,
                      hasPullRequests,
                      showBookmarked,
                      dateFrom,
                      dateTo,
                    }}
                    onFilterChange={onFilterChange}
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

            <Popover
              open={showDesktopFilter}
              onOpenChange={setShowDesktopFilter}
            >
              <PopoverTrigger asChild>
                <button className="px-6 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-colors h-[42px] whitespace-nowrap">
                  Advanced Search
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 max-h-[600px] bg-popover border-border"
                showBackdrop={true}
              >
                <FilterPanel
                  filters={{
                    minStars,
                    maxStars,
                    minForks,
                    language: language.join(" "),
                    isAssigned,
                    category,
                    framework,
                    hasPullRequests,
                    showBookmarked,
                    dateFrom,
                    dateTo,
                  }}
                  onFilterChange={onFilterChange}
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
