# Changelog

All notable changes to the **First Issues** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). <!-- osps_br_02_01 -->

---

## [1.0.0] - 2026-09-24

### Added
- **GitHub Issue Discovery**: Real-time aggregation of beginner-friendly open-source issues via GitHub GraphQL API.
- **Difficulty Scoring Engine**: Automated heuristic complexity evaluation based on labels, comments, and stars.
- **User Authentication & Bookmarks**: Secure user registration, JWT sessions, and cloud bookmark persistence via PostgreSQL Prisma ORM.
- **Automated Test Suite**: Integrated Vitest test runner with automated test suites for difficulty scoring and client rate limiting. <!-- osps_qa_06_01 -->
- **Cryptographic Release Attestations**: Added GitHub Actions release workflow generating SHA-256 checksums and SLSA provenance attestations. <!-- osps_br_06_01 -->
- **Software Bill of Materials (SBOM)**: Automated CycloneDX SBOM generation delivering `first-issues-${VERSION}-sbom.cdx.json` with every release. <!-- osps_qa_02_02 -->
- **CodeQL SAST Security Analysis**: Automated static analysis workflow blocking CWE Top 25 weaknesses on pull requests and scheduled audits. <!-- osps_vm_06_02 -->
- **OpenVEX Exploitability Document**: Published machine-readable `docs/openvex.json` declaring exploitability status for non-affecting component advisories. <!-- osps_vm_04_02 -->
- **In-App Release Verification Terminal**: Added cryptographic verification UI on `/changelog` providing copyable `sha256sum` and `gh attestation verify` commands with signer identity parameters. <!-- osps_do_03_01, osps_do_03_02 -->
- **Project Governance**: Published [GOVERNANCE.md](GOVERNANCE.md) detailing project maintainer roles, responsibilities, Sensitive Resource Access Matrix, collaborator review criteria, and non-author approval requirements. <!-- osps_gv_01_01, osps_gv_01_02, osps_gv_04_01, osps_qa_07_01 -->
- **Developer Certificate of Origin (DCO)**: Mandated `git commit -s` sign-offs asserting contributor authorization on all commits, validated via CI. <!-- osps_le_01_01 -->
- **Near-Black Craft Design System**: Polished `/changelog` route implementing First Issues software-craft design tokens (`extra/DESIGN.md`) powered by Tailwind CSS v4.

### Changed
- **Dependency Security**: Upgraded Next.js to 16.3.6 resolving upstream production security advisories.
- **Coordinated Vulnerability Disclosure (CVD)**: Enhanced [SECURITY.md](SECURITY.md) with verified maintainer contact, response SLA (48h acknowledgment, 7d remediation), 90-day embargo timeline, and public advisory publishing policy. <!-- osps_vm_01_01, osps_vm_03_01, osps_vm_04_01 -->
- **Release Lifecycle & EOL Policy**: Defined 6-month active release support window and 60-day EOL transition timeline. <!-- osps_do_04_01, osps_do_05_01 -->
- **Testing Guide & Mandatory Policy**: Documented when/how tests are run and mandated automated unit/integration tests for all major code changes. <!-- osps_qa_06_02, osps_qa_06_03 -->
- **Architecture Documentation**: Expanded [docs/architecture.md](docs/architecture.md) with complete system actors, actions matrix, and use-case data flow. <!-- osps_sa_01_01 -->
- **API Reference**: Added formal documentation for `/api/github/issues` query parameters and `/api/errors` telemetry. <!-- osps_sa_02_01 -->

### Security
- **Job-Level Least Privilege**: Configured top-level `permissions: {}` and explicit job-level minimum permissions across all CI/CD pipelines. <!-- osps_ac_04_01, osps_ac_04_02 -->
- **Collaborator Input Sanitization**: Sanitized context variables via isolated environment variables in CI/CD shell steps. <!-- osps_br_01_04 -->
- **Unique Release Asset Identifiers**: Standardized release archives, manifests, and SBOMs with version-associated naming (`first-issues-${VERSION}-*`). <!-- osps_br_02_02 -->
- **Secrets Management Policy**: Codified comprehensive storage, access, and rotation guidelines (90d token rotation, 180d JWT rotation, 12h emergency revocation). <!-- osps_br_07_01, osps_br_07_02 -->
- **Critical Code Path Threat Modeling**: Performed granular STRIDE analysis across authentication, rate limiting, GraphQL proxying, and multi-tenant DB transactions. <!-- osps_sa_03_01, osps_sa_03_02 -->
- **SCA Remediation Thresholds & CI Blocking**: Codified SCA severity thresholds and pre-release gates, blocking pull requests with unaddressed High or Critical vulnerabilities. <!-- osps_vm_05_01, osps_vm_05_02, osps_vm_05_03 -->
- **SAST Remediation Policy**: Established formal remediation SLAs for static analysis findings. <!-- osps_vm_06_01 -->

