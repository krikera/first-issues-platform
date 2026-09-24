# Dependency Management & SCA Policy

**Project:** First Issues  
**Control Reference:** OpenSSF Baseline Level 3 <!-- osps_do_06_01, osps_vm_05_01, osps_vm_05_02, osps_vm_05_03, osps_vm_04_02 -->  

This document describes how the First Issues project selects, obtains, tracks, and remediates third-party software dependencies and enforces Software Composition Analysis (SCA) thresholds.

---

## 1. Dependency Selection & License Compliance Policy <!-- osps_vm_05_01 -->

Before any new third-party library or package is introduced to the codebase, it must be evaluated against the following criteria:

1. **Permissive Licensing Threshold**:
   - Packages must be licensed under standard open-source licenses compatible with the project's MIT License (e.g., MIT, Apache 2.0, BSD-2-Clause, BSD-3-Clause, ISC).
   - Packages governed by copyleft (e.g., GPL, AGPL) or source-available/commercial restrictive licenses are strictly prohibited.
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
   - The repository maintains an authoritative [package-lock.json](../package-lock.json).
   - In CI/CD pipelines and production builds, dependencies are installed using `npm ci` rather than `npm install`, ensuring exact version reproducibility. <!-- osps_br_05_01 -->
3. **Cryptographic Integrity Verification**:
   - `package-lock.json` records SHA-512 cryptographic hashes for every installed package and tarball.
   - The npm client validates downloaded artifacts against these hashes before executing or bundling code. <!-- osps_br_03_02 -->

---

## 3. Software Composition Analysis (SCA) & Remediation Thresholds <!-- osps_vm_05_01 -->

The project enforces automated Software Composition Analysis (SCA) thresholds across all development, pull request, and release stages:

| Finding Severity | Threshold | Action in CI/CD | Remediation SLA |
| :--- | :---: | :--- | :--- |
| **Critical Severity** | **0** | **Immediate Build Failure / Block** | Within **48 hours** of disclosure |
| **High Severity** | **0** (unsuppressed) | **Immediate Build Failure / Block** | Within **7 business days** |
| **Medium Severity** | Controlled | Monitored, warning issued | Within **30 business days** |
| **Low / Informational** | Informational | Tracked in advisory dashboard | Addressed during regular update cycles |
| **Prohibited License** | **0** | **Immediate PR Merge Block** | Immediate removal / replacement |

---

## 4. Automated Evaluation, Blocking & OpenVEX Suppression <!-- osps_vm_05_03, osps_vm_04_02 -->

1. **Automated CI Evaluation & Blocking (`osps_vm_05_03`)**:
   - All pull requests and commits to `main` are automatically evaluated in `.github/workflows/ci.yml` via:
     ```bash
     npm audit --audit-level=high --omit=dev
     ```
   - In the event of an unsuppressed High or Critical dependency vulnerability, the workflow immediately fails with an exit code of 1, blocking merging.
2. **OpenVEX Exploitability Document (`osps_vm_04_02`)**:
   - Any vulnerability present in dependency components that is demonstrated to be non-affecting or non-exploitable within First Issues is formally accounted for in [docs/openvex.json](openvex.json).
   - Every declaration must include a valid OpenVEX v0.2.0 justification (e.g., `vulnerable_code_not_present`, `component_not_present`, `inline_mitigations_exist`) and impact statement.
   - The OpenVEX feed is published publicly and accessible in-app on the `/changelog` route.

---

## 5. Pre-Release SCA Gate Policy <!-- osps_vm_05_02 -->

Prior to creating any official software release tag or publishing release assets:
1. The release pipeline ([.github/workflows/release.yml](../.github/workflows/release.yml)) executes an automated pre-release SCA scan:
   ```bash
   npm audit --audit-level=high --omit=dev
   ```
2. No release may be cut or published if any unresolved or unsuppressed High or Critical SCA violation exists.
3. Every release delivers a machine-readable CycloneDX Software Bill of Materials (SBOM) cataloging all runtime dependencies (`first-issues-${VERSION}-sbom.cdx.json`). <!-- osps_qa_02_02 -->

