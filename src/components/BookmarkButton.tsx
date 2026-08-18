"use client";

import Link from "next/link"
import { Bookmark, BookmarkCheck, Loader2, Cloud, X } from "lucide-react"
import { useState, useEffect, FC, MouseEvent } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface BookmarkButtonProps {
  isBookmarked: boolean
  onClick: () => void | Promise<void>
  "aria-label"?: string
}

// Key for storing whether user has seen the nudge
const NUDGE_DISMISSED_KEY = "first-issues-bookmark-nudge-dismissed"

const BookmarkButton: FC<BookmarkButtonProps> = ({
  isBookmarked,
  onClick,
  "aria-label": ariaLabel,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const { isAuthenticated } = useAuth()

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onClick()

      // Show nudge for anonymous users when adding a bookmark
      if (typeof window !== "undefined" && !isAuthenticated && !isBookmarked) {
        const nudgeDismissed = localStorage.getItem(NUDGE_DISMISSED_KEY)
        if (!nudgeDismissed) {
          // Show nudge after a small delay for better UX
          setTimeout(() => setShowNudge(true), 400)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Hide nudge when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowNudge(false)
    }
  }, [isAuthenticated])

  const dismissNudge = (e: MouseEvent) => {
    e.stopPropagation()
    setShowNudge(false)
    if (typeof window !== "undefined") {
      localStorage.setItem(NUDGE_DISMISSED_KEY, "true")
    }
  }

  return (
    <div className="relative">
      <Button
        size="icon"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={
          ariaLabel || (isBookmarked ? "Remove bookmark" : "Add bookmark")
        }
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isBookmarked ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      {/* Sign-in Nudge Tooltip */}
      {showNudge ? (
        <div
          className="absolute right-0 top-full mt-3 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
          role="tooltip"
        >
          <div className="bg-background border-2 border-primary/30 rounded-lg shadow-xl shadow-black/20 p-4 w-64">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Cloud className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Sync across devices
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sign in to save bookmarks to the cloud and access them
                  anywhere.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-3 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                >
                  Sign in →
                </Link>
              </div>
              <button
                onClick={dismissNudge}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1 hover:bg-muted/50 rounded"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Arrow pointing up */}
          <div className="absolute -top-1.5 right-5 w-3 h-3 bg-background border-l-2 border-t-2 border-primary/30 rotate-45" />
        </div>
      ) : null}
    </div>
  )
}

export default BookmarkButton
