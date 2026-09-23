# Security Policy

## Supported Versions

We support security fixes on the `main` branch. Please use the latest release.

## Reporting a Vulnerability

- **Security Advisory (Preferred)**: Open a private advisory report at [GitHub Security Advisories](https://github.com/krikera/first-issues-platform/security/advisories/new).
- **Email Contact**: Send details to `[SECURITY_CONTACT_EMAIL]` (PGP key available upon request).
- **Policy**: Do not open public GitHub issues for security vulnerabilities.
- **Details to Include**: A comprehensive vulnerability description, steps to reproduce, affected software versions, and potential impact.
- **SLA**: Initial acknowledgment within 48 hours; assessment and remediation timeline provided within 7 business days.

## Access Control & Governance Policies

### 1. Multi-Factor Authentication (MFA / 2FA)
- Multi-factor authentication is mandatory for all project maintainers and collaborators with write or administrative access to the repository (`osps_ac_01_01`).
- GitHub organization and repository access controls enforce MFA prior to modifying code, branch settings, or release assets.

### 2. Collaborator Permission Management
- New collaborators must be explicitly invited and assigned the minimum permissions necessary for their role (Read/Triage by default) (`osps_ac_02_01`).
- Escalated write or administrative privileges require manual review and approval by the primary repository maintainer (@krikera).

### 3. Branch Protection & Change Control
- Direct pushes or commits to the primary branch (`main`) are strictly prevented (`osps_ac_03_01`).
- All changes must be submitted via feature branch pull requests, undergo automated checks, and be reviewed prior to merge.
- The `main` branch is designated as the default branch in the version control system, preventing deletion or force-pushing without explicit administrative authorization (`osps_ac_03_02`).

### 4. Secret Prevention & Credential Management
- Unencrypted secrets, tokens, API keys, and credentials must never be committed to version control (`osps_br_07_01`).
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

### 5. Dependency Auditing

- Periodic dependency vulnerability audits via `npm audit` and package integrity validation.

## Pre-Deployment Security Checklist

- [x] Input validation and sanitization on all API routes
- [x] Environment secrets stored strictly in server-side `.env` variables
- [x] Security headers enabled in `next.config.ts`
- [x] Passwords hashed with `bcryptjs` before DB storage
- [x] Prisma ORM used for all database transactions (SQL injection safe)
