# Security Policy

## 1. Supported Versions & Release Lifecycle <!-- osps_do_04_01, osps_do_05_01 -->

The First Issues project maintains a predictable security maintenance lifecycle for official releases:

| Release Branch | Status | Scope of Support | Duration of Support | EOL Date |
| :--- | :---: | :--- | :--- | :--- |
| **`v1.0.x` (Current)** | **Supported** | Critical & High CVEs, regression fixes, security backports | Active support for 6 months (through March 2027) or until next minor release + 60 days | Active |
| **`< v1.0.0`** | **End-of-Life (EOL)** | None | Unsupported | September 2026 |

### Scope & Duration Statement <!-- osps_do_04_01 -->
- **Scope of Support**: The project actively provides security remediation patches for all Critical and High severity vulnerabilities identified in First Issues code or production dependencies. Backports for medium or low severity issues are evaluated on a case-by-case basis.
- **Duration of Support**: Each minor release receives active security support for a minimum duration of **6 months** from initial publication, or for **60 days** after a subsequent minor release is published, whichever is longer.

### End-of-Life (EOL) Policy <!-- osps_do_05_01 -->
When a new minor or major version is released, the preceding minor version enters a **60-day maintenance window**. At the conclusion of this window, the older version reaches End-of-Life (EOL) and will no longer receive security updates, vulnerability patches, or maintenance releases. All downstream users and deployers must upgrade to the latest supported release to maintain security integrity.

---

## 2. Reporting a Vulnerability & Coordinated Disclosure <!-- osps_vm_01_01, osps_vm_03_01 -->

The First Issues project is committed to ensuring the safety and security of all users. We maintain a private reporting channel and follow a Coordinated Vulnerability Disclosure (CVD) process:

- **Private Security Advisory (Preferred)**: Open a private advisory report directly via [GitHub Security Advisories](https://github.com/krikera/first-issues-platform/security/advisories/new). <!-- osps_vm_03_01 -->
- **Direct Email Contact**: Send vulnerability details to `prafulrai522@gmail.com` (Subject: `[SECURITY] First Issues Vulnerability Report`).
- **Policy**: Do not open public GitHub issues or forum posts for undisclosed security vulnerabilities.
- **Details to Include**:
  - Description of the vulnerability and attack vector.
  - Step-by-step reproduction instructions or proof-of-concept (PoC).
  - Affected components, API routes, or dependencies.
  - Assessment of potential impact.

### Response Timeframe & CVD Embargo Timelines <!-- osps_vm_01_01 -->
- **Initial Acknowledgment**: Within **48 hours** of report receipt.
- **Triage & Assessment**: Within **7 business days**, including severity classification (CVSS) and remediation roadmap.
- **Coordinated Disclosure Timeline**: The project adheres to a standard **90-day disclosure embargo**. During this period, the reporter and maintainers collaborate privately to patch the issue. If an active exploit is detected in the wild, the timeline will be expedited to publish fixes immediately.

### Public Vulnerability Publishing & OpenVEX <!-- osps_vm_04_01, osps_vm_04_02 -->
Upon resolution and deployment of a fix, the project publicly publishes the vulnerability details:
1. A formal security advisory is published at [GitHub Security Advisories](https://github.com/krikera/first-issues-platform/security/advisories) with CVE assignment where appropriate.
2. The functional and security modifications are documented in [CHANGELOG.md](CHANGELOG.md) under the `Security` heading. <!-- osps_br_04_01 -->
3. Release notes for the patched version are published to GitHub Releases and the in-app `/changelog` route.
4. Non-affecting dependency advisories are documented in the machine-readable [OpenVEX document](docs/openvex.json) (`<!-- osps_vm_04_02 -->`).

---

## 3. Access Control & Governance Policies

### 3.1. Multi-Factor Authentication (MFA / 2FA)
- Multi-factor authentication is mandatory for all project maintainers and collaborators with write or administrative access to the repository. <!-- osps_ac_01_01 -->
- GitHub organization and repository access controls enforce MFA prior to modifying code, branch settings, or release assets.

### 3.2. Collaborator Review & Escalated Permissions <!-- osps_ac_02_01, osps_gv_04_01 -->
- New collaborators must be explicitly invited and assigned the minimum permissions necessary for their role (Read/Triage by default).
- Escalation to Write or Admin privileges requires a formal review of contributor track record (minimum 3 merged PRs, adherence to DCO and Code of Conduct), hardware 2FA verification, and unanimous approval by existing maintainers as specified in [GOVERNANCE.md](GOVERNANCE.md).

### 3.3. Branch Protection & Non-Author Approval <!-- osps_ac_03_01, osps_ac_03_02, osps_qa_07_01 -->
- Direct pushes or commits to the primary branch (`main`) are strictly prevented.
- All changes must be submitted via pull requests and require at least one non-author human approval prior to merging.
- The `main` branch is designated as the default branch in the version control system, preventing deletion or force-pushing without explicit administrative authorization.

---

## 4. Secrets & Credential Management Policy <!-- osps_br_07_01, osps_br_07_02 -->

The First Issues project enforces strict guidelines for storing, accessing, and rotating secrets and credentials:

### 4.1. Secret Storage Guidelines
- **Zero Unencrypted Secrets in Source Control**: Unencrypted credentials, tokens, private keys, and environment files (`.env`, `.env.local`) must never be committed to git.
- **Production Secrets**: Production values (`DATABASE_URL`, `JWT_SECRET_KEY`, `GITHUB_API_KEY`) reside exclusively in encrypted key stores (Vercel Encrypted Environment Store and Supabase Vault).
- **CI/CD Automation Secrets**: Secrets used in GitHub Actions (`GITHUB_TOKEN`) are scoped with minimal privileges and encrypted at rest using GitHub Secrets.

### 4.2. Secret Access Guidelines
- **Principle of Least Privilege**: Access to production keys is restricted exclusively to the Project Lead (@krikera) and requires hardware MFA (FIDO2/WebAuthn).
- **No Shared Credentials**: Personal access tokens and SSH keys are unique to each individual maintainer and are never shared.
- **Audit Logging**: Access logs for production secrets in Vercel and GitHub are audited quarterly.

### 4.3. Secret Rotation Guidelines
- **Scheduled Cadence**:
  - Upstream API tokens (`GITHUB_API_KEY`) and database credentials: Rotated every **90 days**.
  - Authentication signing keys (`JWT_SECRET_KEY`): Rotated every **180 days** using a rolling dual-key transition window to maintain active user sessions.
- **Emergency Revocation & Rotation**:
  - In the event of suspected credential exposure or maintainer offboarding, credentials are revoked and rotated immediately within **12 hours**.

---

## 5. Static Application Security Testing (SAST) Policy <!-- osps_vm_06_01, osps_vm_06_02 -->

All changes to the codebase are automatically analyzed against documented security weakness policies:

### 5.1. SAST Remediation Thresholds <!-- osps_vm_06_01 -->
| Finding Severity | Scope / Weakness Type | Enforcement Action | Remediation SLA |
| :--- | :--- | :--- | :--- |
| **Critical Severity** | Remote Code Execution, Authentication Bypass, CWE-798 Hardcoded Secrets | Immediate PR block; workflow fails | Remediate within **24 hours** |
| **High Severity** | SQL Injection (CWE-89), XSS (CWE-79), Path Traversal (CWE-22) | Immediate PR block; workflow fails | Remediate within **48 hours** |
| **Medium Severity** | Missing rate limits, insecure headers, timing exposure | Warning generated in review | Remediate within **14 business days** |
| **Low / Informational** | Code quality, style warnings | Non-blocking telemetry | Addressed in regular maintenance |

### 5.2. Automated CI Enforcement <!-- osps_vm_06_02 -->
- Automated Static Application Security Testing is executed on all pull requests and pushes to `main` via GitHub CodeQL ([.github/workflows/codeql.yml](.github/workflows/codeql.yml)).
- Pull requests introducing Critical or High security weaknesses are automatically blocked from merging until resolved.
- Suppressions are strictly governed: any false positive must be accompanied by an inline architectural justification comment and reviewed by the Security Officer.

## Security Implementation Guide

This document outlines the security measures implemented in the First Issues application.

### 1. Input Validation & Sanitization

- **Server-Side Validation (`src/lib/github.ts` & API routes)**:
  - Input query sanitization to prevent GraphQL injection attacks.
  - Parameter bounds validation for numeric search filters (stars, forks).
  - Validation of request parameters via Next.js API route handlers.

### 2. Authentication & Data Security

- **JWT Authentication (`src/lib/auth.ts`)**:
  - Stateless JWT token signing and verification using `jose`.
  - Password hashing using `bcryptjs` with salt rounds.
- **Database Security (`prisma/schema.prisma`)**:
  - Parameterized database queries via Prisma ORM preventing SQL injection.

### 3. Rate Limiting & Abuse Prevention

- **Server Rate Limiting (`src/lib/rate-limiter.ts`)**:
  - In-memory per-IP rate limiting on key authentication endpoints (`/api/auth/login`, `/api/auth/register`) to prevent brute-force attacks.
  - Returns HTTP 429 Too Many Requests response status when limits are exceeded.

### 4. Security Headers & HSTS

Configured in `next.config.ts`:

```typescript
{ key: "X-Frame-Options", value: "DENY" },
{ key: "X-Content-Type-Options", value: "nosniff" },
{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }
```

### 5. Dependency Auditing & Supply Chain Security <!-- osps_do_06_01 -->

- Periodic dependency vulnerability audits via `npm audit` and package integrity validation.
- Automated weekly vulnerability and version scanning via GitHub Dependabot (`.github/dependabot.yml`).
- Detailed selection, acquisition, and tracking criteria defined in [docs/dependency-management.md](docs/dependency-management.md).

### 6. Threat Assessment & Architecture Assurance <!-- osps_sa_03_01 -->

- Formal STRIDE security assessment documented in [docs/security-assessment.md](docs/security-assessment.md).
- Governance and Sensitive Resource Access Matrix documented in [GOVERNANCE.md](GOVERNANCE.md).

## Pre-Deployment Security Checklist

- [x] Input validation and sanitization on all API routes
- [x] Environment secrets stored strictly in server-side `.env` variables
- [x] Security headers enabled in `next.config.ts`
- [x] Passwords hashed with `bcryptjs` before DB storage
- [x] Prisma ORM used for all database transactions (SQL injection safe)
- [x] Automated test suites pass before commit acceptance <!-- osps_qa_06_01 -->
- [x] All commits signed with DCO (`git commit -s`) <!-- osps_le_01_01 -->
