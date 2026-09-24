import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, GitCommit, Tag, ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Changelog | First Issues",
  description:
    "Product updates, functional improvements, and security releases for the First Issues platform.",
};

interface ReleaseLog {
  version: string;
  date: string;
  title: string;
  isLatest?: boolean;
  security: string[];
  added: string[];
  changed: string[];
}

const RELEASES: ReleaseLog[] = [
  {
    version: "v1.0.0",
    date: "September 24, 2026",
    title: "Official Public Platform Release & OpenSSF Security Hardening",
    isLatest: true,
    security: [
      "Hardened CI/CD execution pipeline with least-privilege token permissions (contents: read).",
      "Published formal STRIDE threat model and comprehensive security assessment.",
      "Established Coordinated Vulnerability Disclosure (CVD) policy with 48h acknowledgment and 90-day embargo timeline.",
      "Configured automated weekly dependency vulnerability tracking with Dependabot.",
      "Enforced sliding-window IP rate limiting on authentication routes to mitigate brute-force attacks.",
      "Stateless JWT authentication with bcrypt password hashing and Prisma ORM parameterized queries.",
    ],
    added: [
      "Real-time GitHub GraphQL issue discovery with 'good first issue' label aggregation.",
      "Multi-dimensional filtering (languages, stars, forks, assigned status).",
      "Automated issue difficulty scoring engine with heuristic complexity evaluation.",
      "User authentication, bookmark persistence, and local-to-cloud synchronization.",
      "Automated Vitest test suite running on every commit and pull request.",
      "Cryptographic release provenance via GitHub Artifact Attestations and SHA-256 checksums.",
      "Transparent governance specification (GOVERNANCE.md) with Sensitive Resource Access Matrix.",
      "Mandatory Developer Certificate of Origin (DCO) commit sign-off verification.",
      "Near-black software-craft interface powered by Tailwind CSS v4.",
    ],
    changed: [
      "Expanded system architecture documentation with complete Actors and Actions matrix.",
      "Added formal API reference specifications for /api/github/issues and /api/errors.",
      "Synchronized package lockfiles and strict dependency tree resolution.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <NavBar />

      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="inline-flex items-center text-[13px] text-ink-subtle hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Issues
            </Link>
          </div>

          <div className="space-y-2">
            <span className="text-[13px] font-medium tracking-[0.4px] uppercase text-primary font-mono">
              Release Telemetry
            </span>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-1.8px] text-ink font-display">
              Changelog
            </h1>
            <p className="text-[16px] text-ink-muted max-w-2xl leading-relaxed">
              Descriptive log of functional features, architectural updates, and security
              modifications across official First Issues releases.
            </p>
          </div>
        </div>

        {/* Changelog Timeline */}
        <div className="space-y-12">
          {RELEASES.map((release) => (
            <article
              key={release.version}
              className="pb-12 border-b border-hairline last:border-b-0 space-y-6"
            >
              {/* Release Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-mono font-medium bg-surface-2 text-ink border border-hairline">
                    <Tag className="w-3 h-3 mr-1.5 text-primary" />
                    {release.version}
                  </span>
                  {release.isLatest && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                      Latest Release
                    </span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-medium tracking-[-0.4px] text-ink font-display">
                    {release.title}
                  </h2>
                </div>

                <time className="text-[13px] text-ink-subtle font-mono">
                  {release.date}
                </time>
              </div>

              {/* Release Sections Grid */}
              <div className="grid grid-cols-1 gap-6 pt-2">
                {/* Security Section */}
                {release.security.length > 0 && (
                  <div className="p-5 rounded-lg bg-surface-1 border border-hairline space-y-3">
                    <div className="flex items-center space-x-2 text-brand-secure">
                      <ShieldCheck className="w-4 h-4" />
                      <h3 className="text-[14px] font-medium tracking-wide uppercase font-mono">
                        Security & Compliance (CVD & Controls)
                      </h3>
                    </div>
                    <ul className="space-y-2 text-[14px] text-ink-muted leading-relaxed">
                      {release.security.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <span className="text-brand-secure mt-1 font-mono text-xs">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Added Features */}
                {release.added.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[13px] font-medium tracking-wide uppercase text-semantic-success font-mono">
                      Added Capabilities
                    </h3>
                    <ul className="space-y-2 text-[14px] text-ink-muted leading-relaxed">
                      {release.added.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <span className="text-semantic-success mt-1 font-mono text-xs">+</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Changed / Hardened */}
                {release.changed.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[13px] font-medium tracking-wide uppercase text-ink-subtle font-mono">
                      Changed & Refactored
                    </h3>
                    <ul className="space-y-2 text-[14px] text-ink-muted leading-relaxed">
                      {release.changed.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <GitCommit className="w-3.5 h-3.5 mt-1 text-ink-tertiary shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
