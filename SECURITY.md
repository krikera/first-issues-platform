# Security Policy

## Supported Versions

We support security fixes on the `main` branch. Please use the latest release.

## Reporting a Vulnerability & Coordinated Disclosure <!-- osps_vm_01_01, osps_vm_03_01 -->

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

### Public Vulnerability Publishing <!-- osps_vm_04_01 -->
Upon resolution and deployment of a fix, the project publicly publishes the vulnerability details:
1. A formal security advisory is published at [GitHub Security Advisories](https://github.com/krikera/first-issues-platform/security/advisories) with CVE assignment where appropriate.
2. The functional and security modifications are documented in [CHANGELOG.md](CHANGELOG.md) under the `Security` heading. <!-- osps_br_04_01 -->
3. Release notes for the patched version are published to GitHub Releases and the in-app `/changelog` route.

## Access Control & Governance Policies

### 1. Multi-Factor Authentication (MFA / 2FA)
- Multi-factor authentication is mandatory for all project maintainers and collaborators with write or administrative access to the repository. <!-- osps_ac_01_01 -->
- GitHub organization and repository access controls enforce MFA prior to modifying code, branch settings, or release assets.

### 2. Collaborator Permission Management
- New collaborators must be explicitly invited and assigned the minimum permissions necessary for their role (Read/Triage by default). <!-- osps_ac_02_01 -->
- Escalated write or administrative privileges require manual review and approval by the primary repository maintainer (@krikera).

### 3. Branch Protection & Change Control
- Direct pushes or commits to the primary branch (`main`) are strictly prevented. <!-- osps_ac_03_01 -->
- All changes must be submitted via feature branch pull requests, undergo automated checks, and be reviewed prior to merge.
- The `main` branch is designated as the default branch in the version control system, preventing deletion or force-pushing without explicit administrative authorization. <!-- osps_ac_03_02 -->

### 4. Secret Prevention & Credential Management
- Unencrypted secrets, tokens, API keys, and credentials must never be committed to version control. <!-- osps_br_07_01 -->
- All local environment variables are managed through `.env` files that are strictly excluded in `.gitignore`.
- Automated secret scanning (via GitHub Secret Scanning and pre-commit checks) is enforced to detect and block accidental secret exposure.
- If a credential is ever inadvertently pushed, it must be considered immediately compromised, revoked, and rotated.

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
