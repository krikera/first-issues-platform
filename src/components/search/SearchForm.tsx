"use client";

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
    onSearchChange(e.target.value)
  }

  if (variant === "mobile") {
    return (
      <div className={`relative ${className}`}>
        <input
          id="search-input-mobile"
          name="search-mobile"
          type="text"
          aria-label="Search issues by repo, language, or keyword"
          placeholder="Search by repo, language, or keyword..."
          value={searchQuery}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full h-10 px-3.5 py-2 bg-surface-1 border border-hairline rounded-[8px] text-ink text-[14px] placeholder:text-ink-subtle focus:border-hairline-strong focus:ring-1 focus:ring-primary-focus focus:outline-none transition-all"
        />
      </div>
    )
  }

  // Desktop variant
  return (
    <div className={`relative flex-grow ${className}`}>
      <input
        id="search-input-desktop"
        name="search-desktop"
        type="text"
        aria-label="Search issues by repo, language, or keyword"
        placeholder="Search by repo, language, or keyword..."
        value={searchQuery}
        onChange={handleInputChange}
        disabled={isLoading}
        className="w-full h-10 px-4 py-2 bg-surface-1 border border-hairline rounded-[8px] text-ink text-[14px] placeholder:text-ink-subtle focus:border-hairline-strong focus:ring-1 focus:ring-primary-focus focus:outline-none transition-all"
      />
    </div>
  )
}
