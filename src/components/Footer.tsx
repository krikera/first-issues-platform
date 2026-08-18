"use client";

import { Mail } from "lucide-react"
import { FaGithub } from "react-icons/fa"

const Footer = () => {
  // Organization schema markup
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "First Issues",
    url: "https://your-domain.com",
    logo: "https://your-domain.com/logo.png",
    sameAs: ["https://github.com/krikera/first-issues"],
    description:
      "Open source platform helping developers find their first contribution opportunities",
    email: "contact@your-domain.com",
  }

  return (
    <footer
      className="relative mt-10"
      itemScope
      itemType="https://schema.org/WPFooter"
    >
      {/* Organization Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="border-t border-border bg-muted/30 pt-10 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  FI
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  First Issues
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Helping developers discover beginner-friendly open source issues
                and make their first contribution.
              </p>
            </div>

            {/* Column 2: Resources */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Resources
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => {
                      const resultsSection =
                        document.getElementById("results-section")
                      if (resultsSection) {
                        resultsSection.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Browse Issues
                  </button>
                </li>
                <li>
                  <a
                    href="https://docs.github.com/en/get-started/quickstart/contributing-to-projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub Contributing Guide
                  </a>
                </li>
                <li>
                  <a
                    href="https://firstcontributions.github.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    First Contributions
                  </a>
                </li>
                <li>
                  <a
                    href="https://opensource.guide/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Open Source Guide
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Connect */}
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Connect
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/krikera/first-issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                  >
                    <FaGithub className="h-4 w-4 mr-2" />
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@your-domain.com"
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    contact@your-domain.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} First Issues. Open source under MIT
              License.
            </p>
            <p className="text-xs text-muted-foreground">
              Built for the open source community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
