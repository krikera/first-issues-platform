"use client";

import Link from "next/link"
import { Bookmark, BookmarkCheck, Loader2, Cloud, X } from "lucide-react"
import { useState, useEffect, useRef, FC, MouseEvent } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface BookmarkButtonProps {
  isBookmarked: boolean
  onClick: () => void | Promise<void>
  "aria-label"?: string
}

const NUDGE_DISMISSED_KEY = "first-issues-bookmark-nudge-dismissed"

const BookmarkButton: FC<BookmarkButtonProps> = ({
  isBookmarked,
  onClick,
  "aria-label": ariaLabel,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const { isAuthenticated } = useAuth()

  const nudgeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await onClick()

      if (typeof window !== "undefined" && !isAuthenticated && !isBookmarked) {
        const nudgeDismissed = localStorage.getItem(NUDGE_DISMISSED_KEY)
        if (!nudgeDismissed) {
          nudgeTimerRef.current = setTimeout(() => setShowNudge(true), 400)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current) {
        clearTimeout(nudgeTimerRef.current)
      }
    }
  }, [])

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
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isLoading}
        className={`h-8 w-8 rounded-[6px] transition-colors cursor-pointer ${
          isBookmarked
            ? "text-primary hover:text-primary-hover hover:bg-surface-2"
            : "text-ink-tertiary hover:text-ink hover:bg-surface-2"
        }`}
        aria-label={
          ariaLabel || (isBookmarked ? "Remove bookmark" : "Add bookmark")
        }
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-subtle" />
        ) : isBookmarked ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      {/* Sign-in Nudge Tooltip */}
      {showNudge ? (
        <div
          className="absolute right-0 top-full mt-2.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-150"
          role="tooltip"
        >
          <div className="bg-surface-3 border border-hairline rounded-[12px] shadow-lg p-4 w-64 text-ink">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-[6px] bg-primary/10 flex items-center justify-center">
                <Cloud className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-ink">
                  Sync across devices
                </p>
                <p className="text-[12px] text-ink-subtle mt-1 leading-snug">
                  Sign in to save bookmarks to the cloud and access them anywhere.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-2.5 px-3 py-1 text-[12px] font-medium bg-primary text-on-primary rounded-[6px] hover:bg-primary-hover transition-colors"
                >
                  Sign in →
                </Link>
              </div>
              <button
                onClick={dismissNudge}
                className="text-ink-subtle hover:text-ink transition-colors flex-shrink-0 p-1 hover:bg-surface-2 rounded-[4px] cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default BookmarkButton
