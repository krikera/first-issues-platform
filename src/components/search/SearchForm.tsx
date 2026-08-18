"use client";

import { sanitizeSearchInput } from "@/utils/clientValidation"

interface SearchFormProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading?: boolean
  variant?: "mobile" | "desktop"
  className?: string
}

export function SearchForm({
  searchQuery,
  onSearchChange,
  isLoading = false,
  variant = "desktop",
  className = "",
}: SearchFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeSearchInput(e.target.value)
    onSearchChange(sanitized)
  }

  if (variant === "mobile") {
    return (
      <div className={`relative ${className}`}>
        <input
          type="text"
          placeholder="Search by repo, language, or keyword..."
          value={searchQuery}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
        />
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={`relative flex-grow ${className}`}>
      <input
        type="text"
        placeholder="Search by repo, language, or keyword..."
        value={searchQuery}
        onChange={handleInputChange}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
      />
    </div>
  )
}
