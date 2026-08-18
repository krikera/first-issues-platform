"use client";

import Link from "next/link"

export function HeroTerminal() {
  return (
    <div className="relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Title & Subheading */}
          <div className="mb-10 space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              Start Your <span className="text-primary">Open-Source</span>{" "}
              Journey
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find high-quality beginner-friendly GitHub issues with advanced
              filtering, real-time updates, and project-quality scoring.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => {
                const resultsSection =
                  document.getElementById("results-section")
                if (resultsSection) {
                  resultsSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              }}
              className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 min-w-[200px]"
            >
              Explore Issues
            </button>
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent border border-border text-foreground font-bold rounded-lg hover:bg-muted transition-all min-w-[200px]"
            >
              Sign In to Sync
            </Link>
          </div>

          {/* How It Works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-foreground">Find an Issue</h3>
              <p className="text-sm text-muted-foreground text-center">
                Browse curated beginner-friendly issues filtered by language and
                difficulty.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-foreground">Fork &amp; Code</h3>
              <p className="text-sm text-muted-foreground text-center">
                Fork the repo, create a branch, and implement your fix or
                feature.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-foreground">Open a PR</h3>
              <p className="text-sm text-muted-foreground text-center">
                Submit a pull request and become an open-source contributor!
              </p>
            </div>
          </div>


        </div>
      </div>
    </div>
  )
}
