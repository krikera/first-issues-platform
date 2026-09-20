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

  const handleSearchSubmit = (e: React.FormEvent) => {
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
      <div className="linear-panel p-5 sm:p-6 max-w-6xl mx-auto">
        
        {/* Mobile and Tablet View */}
        <div className="lg:hidden">
          <div className="mb-4">
            <h2 className="font-display text-[20px] font-medium tracking-[-0.4px] text-ink">
              Search Issues
            </h2>
            <div className="flex items-center gap-2 text-ink-subtle text-[13px] mt-0.5">
              <span>{issues.length} results found</span>
            </div>
          </div>
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <SearchForm
              searchQuery={mobileSearchQuery}
              onSearchChange={setMobileSearchQuery}
              isLoading={isSearching}
              variant="mobile"
            />
            <div className="flex gap-2.5">
              <button
                type="submit"
                className="flex-1 h-10 px-4 bg-primary text-on-primary rounded-[8px] font-medium text-[14px] hover:bg-primary-hover active:bg-primary-focus transition-colors cursor-pointer"
              >
                Search
              </button>
              <Popover
                open={showMobileFilter}
                onOpenChange={setShowMobileFilter}
              >
                <PopoverTrigger asChild>
                  <button className="h-10 px-4 border border-hairline bg-surface-2 text-ink hover:border-hairline-strong hover:bg-surface-3 rounded-[8px] font-medium text-[14px] transition-colors cursor-pointer">
                    Filters
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 max-h-[500px] p-4 bg-surface-3"
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
                      searchQuery: mobileSearchQuery,
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
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-[22px] font-medium tracking-[-0.4px] text-ink">
                Search Issues
              </h2>
              <div className="flex items-center gap-2 text-ink-subtle text-[13px] mt-0.5">
                <span>{issues.length} results found</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3"
          >
            <SearchForm
              searchQuery={mobileSearchQuery}
              onSearchChange={setMobileSearchQuery}
              isLoading={isSearching}
              variant="desktop"
            />
            <button
              type="submit"
              className="h-10 px-6 bg-primary text-on-primary rounded-[8px] font-medium text-[14px] hover:bg-primary-hover active:bg-primary-focus transition-colors cursor-pointer whitespace-nowrap"
            >
              Search
            </button>

            <Popover
              open={showDesktopFilter}
              onOpenChange={setShowDesktopFilter}
            >
              <PopoverTrigger asChild>
                <button className="h-10 px-5 border border-hairline bg-surface-2 text-ink hover:border-hairline-strong hover:bg-surface-3 rounded-[8px] font-medium text-[14px] transition-colors whitespace-nowrap cursor-pointer">
                  Filters
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-96 max-h-[600px] p-5 bg-surface-3"
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
                    searchQuery: mobileSearchQuery,
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
