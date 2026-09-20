"use client";

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function HeroTerminal() {
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative z-10 overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Linear Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-hairline bg-surface-1 text-ink-subtle text-[13px] font-medium tracking-[0.4px] mb-8 hover:border-hairline-strong transition-colors">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-ink">Open Source Issues</span>
            <span className="text-hairline-strong">·</span>
            <span>Good First Issues for Contributors</span>
          </div>

          {/* Main Title with Linear Display Typography */}
          <div className="space-y-6 mb-10">
            <h1 className="font-display text-[42px] sm:text-[60px] md:text-[72px] font-semibold leading-[1.08] tracking-[-1.8px] sm:tracking-[-2.4px] text-ink">
              Find beginner-friendly <br className="hidden sm:inline" />
              open source <span className="text-primary font-semibold">issues</span>
            </h1>
            <p className="font-text text-[17px] sm:text-[19px] text-ink-subtle max-w-2xl mx-auto leading-[1.5] tracking-[-0.1px]">
              Browse and filter GitHub issues labeled for new contributors, save bookmarks, and find projects to contribute to.
            </p>
          </div>

          {/* Linear CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button
              onClick={() => {
                const resultsSection = document.getElementById("results-section")
                if (resultsSection) {
                  resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              }}
              className="w-full sm:w-auto h-10 px-5 bg-primary text-on-primary font-medium text-[14px] rounded-[8px] hover:bg-primary-hover active:bg-primary-focus transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Good First Issues</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {mounted && isAuthenticated ? (
              <Link
                href="/bookmarks"
                className="w-full sm:w-auto h-10 px-5 bg-surface-1 text-ink border border-hairline font-medium text-[14px] rounded-[8px] hover:bg-surface-2 hover:border-hairline-strong active:bg-surface-3 transition-colors flex items-center justify-center"
              >
                View saved bookmarks
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto h-10 px-5 bg-surface-1 text-ink border border-hairline font-medium text-[14px] rounded-[8px] hover:bg-surface-2 hover:border-hairline-strong active:bg-surface-3 transition-colors flex items-center justify-center"
              >
                Sign in to sync bookmarks
              </Link>
            )}
          </div>

          {/* Linear 3-Step Charcoal Panel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="linear-card p-6 flex flex-col justify-between">
              <div>
                <span className="status-pill inline-block mb-3">01 / DISCOVERY</span>
                <h3 className="font-display text-[17px] font-medium text-ink tracking-[-0.3px] mb-1.5">
                  Search & Filter
                </h3>
                <p className="text-[14px] text-ink-subtle leading-[1.5]">
                  Filter issues by programming language, star count, assignment status, and pull request activity.
                </p>
              </div>
            </div>

            <div className="linear-card p-6 flex flex-col justify-between">
              <div>
                <span className="status-pill inline-block mb-3">02 / WORKFLOW</span>
                <h3 className="font-display text-[17px] font-medium text-ink tracking-[-0.3px] mb-1.5">
                  Fork & Clone
                </h3>
                <p className="text-[14px] text-ink-subtle leading-[1.5]">
                  Fork the repository, clone it to your local environment, and review the project&apos;s contributing guide.
                </p>
              </div>
            </div>

            <div className="linear-card p-6 flex flex-col justify-between">
              <div>
                <span className="status-pill inline-block mb-3">03 / CONTRIBUTION</span>
                <h3 className="font-display text-[17px] font-medium text-ink tracking-[-0.3px] mb-1.5">
                  Submit a PR
                </h3>
                <p className="text-[14px] text-ink-subtle leading-[1.5]">
                  Submit your pull request directly to the upstream repository for the maintainers to review.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
