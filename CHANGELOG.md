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
- **Project Governance**: Published [GOVERNANCE.md](GOVERNANCE.md) detailing project maintainer roles, responsibilities, and the Sensitive Resource Access Matrix. <!-- osps_gv_01_01, osps_gv_01_02 -->
- **Developer Certificate of Origin (DCO)**: Mandated `git commit -s` sign-offs asserting contributor authorization on all commits, validated via CI. <!-- osps_le_01_01 -->
- **Threat Assessment**: Published comprehensive STRIDE threat modeling and security analysis in `docs/security-assessment.md`. <!-- osps_sa_03_01 -->
- **Automated Dependency Tracking**: Configured `.github/dependabot.yml` and authored `docs/dependency-management.md`. <!-- osps_do_06_01 -->
- **In-App Changelog**: Added `/changelog` route implementing the First Issues near-black craft design system (`extra/DESIGN.md`) powered by Tailwind CSS v4.

### Changed
- **Coordinated Vulnerability Disclosure (CVD)**: Enhanced [SECURITY.md](SECURITY.md) with verified maintainer contact, response SLA (48h acknowledgment, 7d remediation), 90-day embargo timeline, and public advisory publishing policy. <!-- osps_vm_01_01, osps_vm_03_01, osps_vm_04_01 -->
- **Architecture Documentation**: Expanded [docs/architecture.md](docs/architecture.md) with complete system actors, actions matrix, and use-case data flow. <!-- osps_sa_01_01 -->
- **API Reference**: Added formal documentation for `/api/github/issues` query parameters and `/api/errors` telemetry. <!-- osps_sa_02_01 -->

### Security
- Hardened default CI/CD execution token permissions to `contents: read`. <!-- osps_ac_04_01 -->
- Enforced sliding-window IP rate limiting on authentication routes to mitigate brute-force attempts.
- Enforced HSTS and defense-in-depth HTTP security headers in Next.js configuration.
