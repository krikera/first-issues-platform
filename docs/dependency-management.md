# Dependency Management Policy

**Project:** First Issues  
**Control Reference:** OpenSSF Baseline Level 2 <!-- osps_do_06_01 -->  

This document describes how the First Issues project selects, obtains, and tracks third-party software dependencies.

---

## 1. Dependency Selection

Before any new third-party library or package is introduced to the codebase, it must be evaluated against the following criteria:

1. **Permissive Licensing**: Packages must be licensed under standard open-source licenses compatible with the project's MIT License (e.g., MIT, Apache 2.0, BSD-2-Clause, BSD-3-Clause, ISC). Packages under copyleft licenses (e.g., GPL, AGPL) are prohibited.
2. **Maintenance & Community Health**:
   - The package must be actively maintained with recent releases within the last 12 months.
   - The package should demonstrate healthy adoption, community engagement, and responsive maintainers.
   - Packages with abandoned upstream maintenance or unaddressed critical issues must not be selected.
3. **Security Posture & Vulnerability History**:
   - The package must have zero known unpatched High or Critical vulnerabilities in the GitHub Advisory Database / CVE feeds.
4. **Scope & Footprint**:
   - Maintainers prioritize lightweight packages with minimal transitive dependency trees to minimize supply-chain exposure.
   - Where feasible, built-in Node.js / Web Platform APIs are preferred over adding new dependencies.

---

## 2. Obtaining Dependencies

All dependencies are ingested using standardized, cryptographically verified tooling: <!-- osps_br_05_01 -->

1. **Encrypted Registry Connection**: All packages are downloaded exclusively from the official public npm registry (`registry.npmjs.org`) over TLS (HTTPS). <!-- osps_br_03_01 -->
2. **Deterministic Version Pinning**:
   - The repository maintains an authoritative [package-lock.json](package-lock.json).
   - In CI/CD pipelines and production builds, dependencies are installed using `npm ci` rather than `npm install`, ensuring exact version reproducibility. <!-- osps_br_05_01 -->
3. **Cryptographic Integrity Verification**:
   - `package-lock.json` records SHA-512 cryptographic hashes for every installed package and tarball.
   - The npm client validates downloaded artifacts against these hashes before executing or bundling code. <!-- osps_br_03_02 -->

---

## 3. Tracking & Remediation

The project actively monitors and remediates dependency issues using automated scanning and manual audits:

1. **Automated Dependabot Tracking**:
   - GitHub Dependabot is configured via [.github/dependabot.yml](.github/dependabot.yml).
   - Dependabot performs automated weekly scans across both npm runtime dependencies and GitHub Actions workflows, submitting automated PRs for outdated or vulnerable packages.
2. **Automated Vulnerability Scanning in CI**:
   - Routine dependency security audits are performed using `npm audit`.
3. **Remediation SLAs**:
   - **Critical Vulnerabilities**: Remediated, tested, and released within 48 to 72 hours of disclosure.
   - **High Vulnerabilities**: Remediated within 7 business days.
   - **Medium / Low Vulnerabilities**: Addressed during regular dependency update cycles.
