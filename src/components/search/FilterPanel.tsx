"use client";

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { categories } from "@/data/categories"

interface FilterState {
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

interface FilterPanelProps {
  filters: {
    minStars: string
    maxStars: string
    minForks: string
    language: string
    isAssigned: boolean
    category: string
    framework: string
    hasPullRequests: boolean
    showBookmarked: boolean
    dateFrom: string
    dateTo: string
  }
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
  setShowFilter: (show: boolean) => void
}

export function FilterPanel({
  filters,
  onFilterChange,
  setShowFilter,
}: FilterPanelProps) {
  const [, startTransition] = useTransition()
  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...filters,
    language: filters.language.split(" ").filter((l) => l),
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
  })

  const [languageInput, setLanguageInput] = useState(filters.language)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "language") {
      setLanguageInput(value)
      startTransition(() => {
        setLocalFilters((prev) => ({
          ...prev,
          language: value.split(" ").filter((l) => l),
        }))
      })
    } else {
      startTransition(() => {
        setLocalFilters((prev) => ({ ...prev, [name]: value }))
      })
    }
  }

  const handleCheckboxChange = (name: string) => {
    startTransition(() => {
      setLocalFilters((prev) => ({
        ...prev,
        [name]: !prev[name as keyof FilterState],
      }))
    })
  }

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      setLocalFilters((prev) => ({ ...prev, category: value }))
    })
  }

  const handleApplyFilters = () => {
    startTransition(() => {
      onFilterChange({
        ...localFilters,
        language: localFilters.language,
        searchQuery: "",
        onlyAssigned: false,
        hasIssues: true,
        recentlyActive: false,
      })
      setShowFilter(false)
    })
  }

  return (
    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Advanced Filters
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Refine your search criteria
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilter(false)}
            className="h-8 w-8 p-0 rounded-full hover:bg-accent transition-colors"
          >
            ×
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="minStars"
              className="text-sm font-medium text-foreground flex items-center"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
              Min Stars
            </Label>
            <Input
              type="number"
              id="minStars"
              name="minStars"
              value={localFilters.minStars}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              className="h-10 border-border/60 focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="maxStars"
              className="text-sm font-medium text-foreground"
            >
              Max Stars
            </Label>
            <Input
              type="number"
              id="maxStars"
              name="maxStars"
              value={localFilters.maxStars}
              onChange={handleInputChange}
              min="0"
              placeholder="1000000"
              className="h-10 border-border/60 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="minForks"
            className="text-sm font-medium text-foreground flex items-center"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            Min Forks
          </Label>
          <Input
            type="number"
            id="minForks"
            name="minForks"
            value={localFilters.minForks}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
            className="h-10 border-border/60 focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="language"
            className="text-sm font-medium text-foreground flex items-center"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
            Language
          </Label>
          <Input
            type="text"
            id="language"
            name="language"
            value={languageInput}
            onChange={handleInputChange}
            placeholder="e.g. JavaScript Python"
            className="h-10 border-border/60 focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="category"
            className="text-sm font-medium text-foreground flex items-center"
          >
            <span className="w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
            Category
          </Label>
          <Select
            value={localFilters.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger
              id="category"
              className="h-10 border-border/60 focus:border-primary transition-colors"
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="framework"
            className="text-sm font-medium text-foreground flex items-center"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
            Framework/Library
          </Label>
          <Input
            type="text"
            id="framework"
            name="framework"
            value={localFilters.framework}
            onChange={handleInputChange}
            placeholder="e.g. React, Vue"
            className="h-10 border-border/60 focus:border-primary transition-colors"
          />
        </div>

        {/* Date Filter Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <h4 className="text-sm font-medium text-foreground">Date Range</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Filter issues by creation date
          </p>

          {/* Quick date range buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                const today = new Date()
                const lastWeek = new Date(
                  today.getTime() - 7 * 24 * 60 * 60 * 1000
                )
                setLocalFilters((prev) => ({
                  ...prev,
                  dateFrom: lastWeek.toISOString().split("T")[0]!,
                  dateTo: today.toISOString().split("T")[0]!,
                }))
              }}
            >
              Last 7 days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                const today = new Date()
                const lastMonth = new Date(
                  today.getTime() - 30 * 24 * 60 * 60 * 1000
                )
                setLocalFilters((prev) => ({
                  ...prev,
                  dateFrom: lastMonth.toISOString().split("T")[0]!,
                  dateTo: today.toISOString().split("T")[0]!,
                }))
              }}
            >
              Last 30 days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                setLocalFilters((prev) => ({
                  ...prev,
                  dateFrom: "",
                  dateTo: "",
                }))
              }}
            >
              Clear Dates
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="dateFrom"
                className="text-xs text-muted-foreground"
              >
                From Date
              </Label>
              <Input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={localFilters.dateFrom || ""}
                onChange={handleInputChange}
                className="h-9 border-border/60 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                To Date
              </Label>
              <Input
                type="date"
                id="dateTo"
                name="dateTo"
                value={localFilters.dateTo || ""}
                onChange={handleInputChange}
                className="h-9 border-border/60 focus:border-primary transition-colors"
              />
            </div>
          </div>
          {localFilters.dateFrom || localFilters.dateTo ? (
            <div className="text-xs text-primary">
              {localFilters.dateFrom && localFilters.dateTo
                ? `Showing issues created between ${localFilters.dateFrom} and ${localFilters.dateTo}`
                : localFilters.dateFrom
                  ? `Showing issues created after ${localFilters.dateFrom}`
                  : `Showing issues created before ${localFilters.dateTo}`}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAssigned"
              checked={localFilters.isAssigned}
              onCheckedChange={() => handleCheckboxChange("isAssigned")}
              className="border-border"
            />
            <Label htmlFor="isAssigned" className="text-foreground">
              Include Assigned Issues
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasPullRequests"
              checked={localFilters.hasPullRequests}
              onCheckedChange={() => handleCheckboxChange("hasPullRequests")}
              className="border-border"
            />
            <Label htmlFor="hasPullRequests" className="text-foreground">
              Include Issues with Pull Requests
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showBookmarked"
              checked={localFilters.showBookmarked}
              onCheckedChange={() => handleCheckboxChange("showBookmarked")}
              className="border-border"
            />
            <Label htmlFor="showBookmarked" className="text-foreground">
              Show Only Bookmarked Issues
            </Label>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <Button
            onClick={handleApplyFilters}
            className="w-full h-12 btn-premium text-base font-medium"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
