# Security Policy

## Supported Versions

We support security fixes on the `main` branch. Please use the latest release.

## Reporting a Vulnerability

- **Email**: security@your-domain.com
- Do not open public issues for vulnerabilities.
- Provide a clear description, reproduction steps, affected versions, and impact.
- We aim to acknowledge receipt within 3 business days and provide a remediation timeline.

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
  - Per-IP rate limiting on key endpoints to prevent automated abuse.
  - Returns standard HTTP 429 Too Many Requests response headers.

### 4. Security Headers & HSTS

Configured in `next.config.ts`:

```typescript
{ key: "X-Frame-Options", value: "DENY" },
{ key: "X-Content-Type-Options", value: "nosniff" },
{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }
```

### 5. Dependency Scanning

- Automated dependency security scanning via GitHub Dependabot and CodeQL workflows.

## Pre-Deployment Security Checklist

- [x] Input validation and sanitization on all API routes
- [x] Environment secrets stored strictly in server-side `.env` variables
- [x] Security headers enabled in `next.config.ts`
- [x] Passwords hashed with `bcryptjs` before DB storage
- [x] Prisma ORM used for all database transactions (SQL injection safe)
