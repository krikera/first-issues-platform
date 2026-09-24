"use client";

import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { useRouter, usePathname } from "next/navigation"
import { Logo } from "@/components/Logo"

const Footer = () => {
  const router = useRouter()
  const pathname = usePathname()

  const handleBrowseIssues = () => {
    if (pathname === "/") {
      const resultsSection = document.getElementById("results-section")
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      router.push("/#results-section")
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "First Issues",
    url: "https://github.com/krikera/first-issues-platform",
    logo: "https://github.com/krikera/first-issues-platform/raw/main/public/favicon.png",
    sameAs: ["https://github.com/krikera/first-issues-platform"],
    description:
      "Open source platform helping developers find their first contribution opportunities",
  }

  return (
    <footer
      className="relative mt-20 border-t border-hairline bg-canvas text-ink-subtle"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <Logo size={24} className="rounded-[5px]" />
              <span className="font-display text-[15px] font-semibold text-ink tracking-[-0.2px]">
                First Issues
              </span>
            </div>
            <p className="text-[13px] text-ink-subtle leading-relaxed max-w-sm">
              A platform helping developers discover beginner-friendly open-source issues and make their first contribution.
            </p>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="font-display text-[13px] font-medium text-ink uppercase tracking-[0.4px] mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <button
                  onClick={handleBrowseIssues}
                  className="text-ink-subtle hover:text-ink transition-colors cursor-pointer"
                >
                  Browse Issues
                </button>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-ink-subtle hover:text-ink transition-colors"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-ink-subtle hover:text-ink transition-colors"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <a
                  href="https://docs.github.com/en/get-started/quickstart/contributing-to-projects"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-subtle hover:text-ink transition-colors"
                >
                  Contributing Guide
                </a>
              </li>
              <li>
                <a
                  href="https://firstcontributions.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-subtle hover:text-ink transition-colors"
                >
                  First Contributions
                </a>
              </li>
              <li>
                <a
                  href="https://opensource.guide/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-subtle hover:text-ink transition-colors"
                >
                  Open Source Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div>
            <h4 className="font-display text-[13px] font-medium text-ink uppercase tracking-[0.4px] mb-3">
              Community
            </h4>
            <ul className="space-y-2 text-[13px]">
              <li>
                <a
                  href="https://github.com/krikera/first-issues-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-subtle hover:text-ink transition-colors flex items-center"
                >
                  <FaGithub className="h-3.5 w-3.5 mr-2" />
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/krikera/first-issues-platform/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-subtle hover:text-ink transition-colors flex items-center"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-2" />
                  GitHub Discussions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-ink-tertiary">
          <p>
            © {new Date().getFullYear()} First Issues. Open source under MIT.
          </p>
          <p className="flex items-center gap-1.5">
            Built for developers making their first open source contribution.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
