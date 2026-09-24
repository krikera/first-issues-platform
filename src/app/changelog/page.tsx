"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GitCommit,
  Tag,
  ArrowLeft,
  FileCode,
  FileArchive,
  Fingerprint,
  Copy,
  Check,
  ExternalLink,
  Download,
  AlertCircle,
  PackageCheck,
  Award,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

interface ReleaseLog {
  version: string;
  date: string;
  title: string;
  isLatest?: boolean;
  supportScope: string;
  supportDuration: string;
  eolStatement: string;
  security: string[];
  added: string[];
  changed: string[];
  assets: {
    archiveName: string;
    archiveUrl: string;
    checksumName: string;
    checksumUrl: string;
    sbomName: string;
    sbomUrl: string;
  };
  vexStatements: {
    id: string;
    description: string;
    status: string;
    justification: string;
  }[];
}

const RELEASES: ReleaseLog[] = [
  {
    version: "v1.0.0",
    date: "September 24, 2026",
    title: "Official Public Platform Release & OpenSSF Baseline Level 3 Compliance",
    isLatest: true,
    supportScope:
      "Critical & High security vulnerabilities, regression patches, and core functionality maintenance.",
    supportDuration:
      "Active support for 6 months (through March 2027) or until the subsequent minor release + 60 days.",
    eolStatement:
      "Prior releases enter End-of-Life (EOL) 60 days after a successor minor/major release is published. EOL releases receive no further security updates.",
    security: [
      "Hardened CI/CD execution pipeline with explicit job-level least privilege (osps_ac_04_02).",
      "Collaborator inputs sanitized via isolated environment variables in CI/CD workflows (osps_br_01_04).",
      "Release assets standardized with unique release version identifiers (osps_br_02_02).",
      "CycloneDX Software Bill of Materials (SBOM) generated and delivered with releases (osps_qa_02_02).",
      "SLSA build provenance attestations cryptographically signed via GitHub OIDC (osps_br_06_01).",
      "Automated GitHub CodeQL SAST static analysis blocking security weaknesses in CI (osps_vm_06_02).",
      "Dependency vulnerability evaluation (SCA) automated in CI with zero-tolerance policy (osps_vm_05_03).",
      "Machine-readable OpenVEX exploitability document published for non-exploitable advisories (osps_vm_04_02).",
      "Formal STRIDE threat modeling analyzing critical code paths and interaction surfaces (osps_sa_03_02).",
      "Comprehensive secret management, credential rotation, and EOL policies codified (osps_br_07_02, osps_do_05_01).",
    ],
    added: [
      "Real-time GitHub GraphQL issue discovery with 'good first issue' label aggregation.",
      "Multi-dimensional filtering (languages, stars, forks, assigned status).",
      "Automated issue difficulty scoring engine with heuristic complexity evaluation.",
      "User authentication, bookmark persistence, and local-to-cloud synchronization.",
      "Automated Vitest test suite running on every commit and pull request (osps_qa_06_01, osps_qa_06_02).",
      "Mandatory Developer Certificate of Origin (DCO) sign-off verification (osps_le_01_01).",
      "Transparent governance specification with Sensitive Resource Access Matrix (osps_gv_01_01, osps_gv_04_01).",
      "Near-black software-craft interface powered by Tailwind CSS v4 design system.",
    ],
    changed: [
      "Upgraded Next.js to 16.3.6 addressing all upstream production security advisories.",
      "Expanded system architecture documentation with complete Actors and Actions matrix.",
      "Added formal API reference specifications for /api/github/issues and /api/errors.",
      "Synchronized package lockfiles and strict dependency tree resolution.",
    ],
    assets: {
      archiveName: "first-issues-v1.0.0.tar.gz",
      archiveUrl: "https://github.com/krikera/first-issues-platform/releases/download/v1.0.0/first-issues-v1.0.0.tar.gz",
      checksumName: "first-issues-v1.0.0-checksums.txt",
      checksumUrl: "https://github.com/krikera/first-issues-platform/releases/download/v1.0.0/first-issues-v1.0.0-checksums.txt",
      sbomName: "first-issues-v1.0.0-sbom.cdx.json",
      sbomUrl: "https://github.com/krikera/first-issues-platform/releases/download/v1.0.0/first-issues-v1.0.0-sbom.cdx.json",
    },
    vexStatements: [
      {
        id: "GHSA-82fw-gwwq-j7x9",
        description: "Vitest Path Traversal / Arbitrary File Read in @vitest/mocker",
        status: "not_affected",
        justification: "component_not_present (test-only devDependency)",
      },
      {
        id: "GHSA-67mh-4wv8-2f99",
        description: "esbuild development server cross-origin request handling",
        status: "not_affected",
        justification: "component_not_present (test-only devDependency)",
      },
      {
        id: "GHSA-p293-qw3h-jr36",
        description: "Next.js Windows RCE Path Traversal",
        status: "not_affected",
        justification: "vulnerable_code_not_present (Linux / Vercel Edge runtime)",
      },
      {
        id: "GHSA-2xp9-vwfh-vxw4",
        description: "Next.js AVIF Image Optimization API RCE",
        status: "not_affected",
        justification: "inline_mitigations_exist (AVIF uploads disabled)",
      },
    ],
  },
];

export default function ChangelogPage() {
  const [activeTab, setActiveTab] = useState<"checksum" | "provenance">("checksum");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const checksumCommand = `curl -sLO https://github.com/krikera/first-issues-platform/releases/download/v1.0.0/first-issues-v1.0.0-checksums.txt
curl -sLO https://github.com/krikera/first-issues-platform/releases/download/v1.0.0/first-issues-v1.0.0.tar.gz
sha256sum -c first-issues-v1.0.0-checksums.txt`;

  const provenanceCommand = `gh attestation verify first-issues-v1.0.0.tar.gz \\
  --owner krikera \\
  --repo krikera/first-issues-platform \\
  --cert-identity-regex "^https://github.com/krikera/first-issues-platform/\\.github/workflows/release\\.yml@refs/tags/v.*"`;

  const handleCopy = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabId);
    setTimeout(() => setCopiedTab(null), 2000);
  };

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
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium tracking-[0.4px] uppercase text-primary font-mono">
                Release Telemetry & Provenance
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono tracking-wide uppercase bg-semantic-success/10 text-semantic-success border border-semantic-success/20">
                <Award className="w-3 h-3 mr-1" />
                OpenSSF Baseline Level 3
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-1.8px] text-ink font-display">
              Changelog & Security Releases
            </h1>
            <p className="text-[16px] text-ink-muted max-w-2xl leading-relaxed">
              Descriptive release log of functional capabilities, software supply-chain attestations,
              and security controls for the First Issues platform.
            </p>
          </div>
        </div>

        {/* Releases Timeline */}
        <div className="space-y-16">
          {RELEASES.map((release) => (
            <article
              key={release.version}
              className="space-y-8 pb-16 border-b border-hairline last:border-b-0"
            >
              {/* Release Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
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

                <time className="text-[13px] text-ink-subtle font-mono shrink-0">
                  {release.date}
                </time>
              </div>

              {/* OpenSSF Level 3 Support & Lifecycle Banner */}
              <div className="p-5 rounded-lg bg-surface-1 border border-hairline space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 text-brand-secure">
                    <PackageCheck className="w-4 h-4 text-primary" />
                    <span className="text-[13px] font-mono font-medium uppercase tracking-wide text-ink">
                      Release Lifecycle & Support Status (osps_do_04_01, osps_do_05_01)
                    </span>
                  </div>
                  <span className="status-pill text-[12px] bg-surface-2 text-semantic-success border-hairline">
                    Active Support
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-[14px] text-ink-muted">
                  <div className="space-y-1">
                    <span className="text-[12px] font-mono uppercase tracking-wider text-ink-subtle block">
                      Scope of Support
                    </span>
                    <p className="leading-relaxed">{release.supportScope}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[12px] font-mono uppercase tracking-wider text-ink-subtle block">
                      Support Duration & Sunset
                    </span>
                    <p className="leading-relaxed">{release.supportDuration}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline text-[13px] text-ink-subtle flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-ink-tertiary mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-ink-muted font-normal">EOL Policy:</strong>{" "}
                    {release.eolStatement}
                  </span>
                </div>
              </div>

              {/* Release Deliverables Grid (osps_br_02_02, osps_qa_02_02) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-mono uppercase tracking-wide text-ink-subtle">
                    Released Software Assets & Bill of Materials (osps_br_02_02, osps_qa_02_02)
                  </span>
                  <a
                    href="https://github.com/krikera/first-issues-platform/releases/tag/v1.0.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-primary hover:text-primary-hover flex items-center transition-colors"
                  >
                    View on GitHub <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tarball Archive */}
                  <div className="p-4 rounded-lg bg-surface-1 border border-hairline flex flex-col justify-between space-y-3 hover:border-hairline-strong transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-ink">
                        <FileArchive className="w-4 h-4 text-primary" />
                        <span className="text-[13px] font-mono font-medium">Release Archive</span>
                      </div>
                      <p className="text-[12px] font-mono text-ink-subtle truncate">
                        {release.assets.archiveName}
                      </p>
                    </div>
                    <a
                      href={release.assets.archiveUrl}
                      className="btn-secondary w-full py-1.5 text-[12px] flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Archive</span>
                    </a>
                  </div>

                  {/* SHA-256 Manifest */}
                  <div className="p-4 rounded-lg bg-surface-1 border border-hairline flex flex-col justify-between space-y-3 hover:border-hairline-strong transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-ink">
                        <Fingerprint className="w-4 h-4 text-brand-secure" />
                        <span className="text-[13px] font-mono font-medium">SHA-256 Checksums</span>
                      </div>
                      <p className="text-[12px] font-mono text-ink-subtle truncate">
                        {release.assets.checksumName}
                      </p>
                    </div>
                    <a
                      href={release.assets.checksumUrl}
                      className="btn-secondary w-full py-1.5 text-[12px] flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Manifest</span>
                    </a>
                  </div>

                  {/* CycloneDX SBOM */}
                  <div className="p-4 rounded-lg bg-surface-1 border border-hairline flex flex-col justify-between space-y-3 hover:border-hairline-strong transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-ink">
                        <FileCode className="w-4 h-4 text-semantic-success" />
                        <span className="text-[13px] font-mono font-medium">CycloneDX SBOM</span>
                      </div>
                      <p className="text-[12px] font-mono text-ink-subtle truncate">
                        {release.assets.sbomName}
                      </p>
                    </div>
                    <a
                      href={release.assets.sbomUrl}
                      className="btn-secondary w-full py-1.5 text-[12px] flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download SBOM</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Cryptographic Verification Terminal (osps_do_03_01, osps_do_03_02) */}
              <div className="rounded-xl bg-surface-1 border border-hairline p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-[14px] font-medium text-ink font-display">
                      Cryptographic Release Verification (osps_do_03_01, osps_do_03_02)
                    </h3>
                    <p className="text-[13px] text-ink-muted">
                      Verify release integrity, SLSA provenance attestation, and expected author identity.
                    </p>
                  </div>

                  {/* Terminal Tabs */}
                  <div className="flex items-center space-x-1.5 bg-surface-2 p-1 rounded-md border border-hairline">
                    <button
                      onClick={() => setActiveTab("checksum")}
                      className={`px-3 py-1 text-[12px] font-mono rounded transition-colors ${
                        activeTab === "checksum"
                          ? "bg-surface-1 text-ink border border-hairline"
                          : "text-ink-subtle hover:text-ink"
                      }`}
                    >
                      1. Checksum Digest
                    </button>
                    <button
                      onClick={() => setActiveTab("provenance")}
                      className={`px-3 py-1 text-[12px] font-mono rounded transition-colors ${
                        activeTab === "provenance"
                          ? "bg-surface-1 text-ink border border-hairline"
                          : "text-ink-subtle hover:text-ink"
                      }`}
                    >
                      2. SLSA Attestation
                    </button>
                  </div>
                </div>

                {/* Code Terminal Display */}
                <div className="relative rounded-md bg-canvas border border-hairline p-4 font-mono text-[13px] leading-relaxed overflow-x-auto text-ink-muted">
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() =>
                        handleCopy(
                          activeTab === "checksum" ? checksumCommand : provenanceCommand,
                          activeTab
                        )
                      }
                      className="p-1.5 rounded-md bg-surface-2 hover:bg-surface-3 text-ink-subtle hover:text-ink border border-hairline transition-colors flex items-center space-x-1 text-[11px]"
                      title="Copy command to clipboard"
                    >
                      {copiedTab === activeTab ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-semantic-success" />
                          <span className="text-semantic-success">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="pr-16 whitespace-pre">
                    <code>{activeTab === "checksum" ? checksumCommand : provenanceCommand}</code>
                  </pre>
                </div>

                {/* Signer Identity Parameters */}
                <div className="p-3 rounded-md bg-surface-2 border border-hairline text-[12px] font-mono text-ink-muted space-y-1">
                  <span className="text-ink-subtle uppercase text-[11px] block tracking-wide">
                    Expected Author & Signer Identity (osps_do_03_02)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-ink-muted">
                    <div>
                      <span className="text-ink-tertiary">Repository:</span> krikera/first-issues-platform
                    </div>
                    <div>
                      <span className="text-ink-tertiary">Workflow:</span> .github/workflows/release.yml
                    </div>
                    <div>
                      <span className="text-ink-tertiary">OIDC Issuer:</span> https://token.actions.githubusercontent.com
                    </div>
                    <div>
                      <span className="text-ink-tertiary">Maintainer:</span> @krikera (Project Lead)
                    </div>
                  </div>
                </div>
              </div>

              {/* Supply Chain Security & OpenVEX Feed (osps_vm_04_02) */}
              <div className="rounded-xl bg-surface-1 border border-hairline p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2 text-brand-secure">
                      <ShieldCheck className="w-4 h-4" />
                      <h3 className="text-[14px] font-medium text-ink font-display">
                        Supply Chain Vulnerability & OpenVEX Exploitability Feed (osps_vm_04_02)
                      </h3>
                    </div>
                    <p className="text-[13px] text-ink-muted">
                      Official exploitability status for third-party component vulnerabilities not affecting this platform.
                    </p>
                  </div>

                  <a
                    href="/docs/openvex.json"
                    target="_blank"
                    className="btn-secondary py-1 px-2.5 text-[12px] flex items-center space-x-1.5 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download OpenVEX JSON</span>
                  </a>
                </div>

                <div className="divide-y divide-hairline rounded-md border border-hairline bg-surface-2 overflow-hidden">
                  {release.vexStatements.map((stmt) => (
                    <div key={stmt.id} className="p-3 text-[13px] space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-ink font-medium">{stmt.id}</span>
                          <span className="text-ink-subtle text-[12px]">— {stmt.description}</span>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono uppercase bg-surface-1 text-semantic-success border border-hairline">
                          {stmt.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-ink-muted font-mono">
                        Justification: <span className="text-ink-subtle">{stmt.justification}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security, Features & Changes Accordions / Sections */}
              <div className="grid grid-cols-1 gap-6 pt-2">
                {/* Security Section */}
                {release.security.length > 0 && (
                  <div className="p-5 rounded-lg bg-surface-1 border border-hairline space-y-3">
                    <div className="flex items-center space-x-2 text-brand-secure">
                      <ShieldCheck className="w-4 h-4" />
                      <h3 className="text-[14px] font-medium tracking-wide uppercase font-mono">
                        Security & Supply Chain Assurance (OpenSSF Baseline Level 3)
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
