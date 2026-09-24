# Security Assessment & Threat Model

**Project:** First Issues (`krikera/first-issues-platform`)  
**Assessment Standard:** OpenSSF Baseline Level 2 <!-- osps_sa_03_01 -->  
**Methodology:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)  
**Last Evaluated:** September 2026  

---

## 1. Executive Summary

First Issues aggregates, filters, and ranks beginner-friendly open-source issues using the GitHub GraphQL API. The application is built using Next.js (App Router), Prisma ORM with PostgreSQL, Tailwind CSS v4, and stateless JWT authentication.

This security assessment examines the primary threats, potential attack surfaces, and defensive mitigations implemented across the platform to ensure robust security posture for both users and maintainers.

---

## 2. System Architecture & Trust Boundaries

```
[ Unauthenticated / Authenticated Client ]
                    │
                    ▼ (HTTPS / TLS 1.3)
      [ Next.js Edge Middleware / Headers ]
                    │
                    ▼
     [ API Routes Handler (/api/...) ]
     ├── Rate Limiting (sliding window)
     ├── JWT Validation (jose HMAC-SHA256)
     └── Input Validation (Zod & Parameter Clamping)
         │                     │
         ▼                     ▼
[ PostgreSQL Database ]   [ GitHub GraphQL API ]
   (via Prisma ORM)         (Server-to-Server Bearer Token)
```

### Trust Boundaries
1. **Client / Browser ↔ Server**: Untrusted input boundary; client requests must be authenticated, sanitized, and rate-limited.
2. **Server ↔ Database**: Trusted VPC / encrypted TLS connection; queries are strictly parameterized through Prisma ORM.
3. **Server ↔ External GitHub API**: Server-side communication using `GITHUB_API_KEY`; key is never exposed to the client bundle.

---

## 3. STRIDE Threat Analysis

| Threat Category | Potential Threat Vector | Impact | Mitigations Implemented |
| :--- | :--- | :--- | :--- |
| **Spoofing** | • Forging JWT session tokens<br>• IP address spoofing to bypass rate limiting | High | • Stateless JWTs signed with 256-bit secret key (`jose`).<br>• `getClientIp` uses rightmost `X-Forwarded-For` and verified edge proxy headers (`cf-connecting-ip`, `x-vercel-ip`) to prevent header spoofing.<br>• Passwords hashed with `bcryptjs` (salt rounds: 10). |
| **Tampering** | • SQL injection via request parameters<br>• GraphQL injection / query tampering<br>• In-transit data modification | High | • 100% of database queries use Prisma ORM parameterized statements.<br>• GraphQL queries are static templates with strongly typed variables and sanitized string inputs.<br>• Strict HTTPS enforcement via HSTS headers (`max-age=31536000; includeSubDomains; preload`). |
| **Repudiation** | • Disputing account actions or bookmark alterations | Medium | • Database records include immutable `createdAt` and `updatedAt` timestamps.<br>• Auth errors and security events logged with sanitized telemetry. |
| **Information Disclosure** | • Leaking GitHub API token to client<br>• Sensitive stack traces in production API errors<br>• Unauthorized bookmark access | Critical | • `GITHUB_API_KEY` and `JWT_SECRET_KEY` are strictly server-side environment variables excluded from `NEXT_PUBLIC_` prefixes.<br>• Generic error responses returned to client (status 400/401/404/500); stack traces suppressed in production.<br>• Bookmark endpoints enforce ownership verification (`userId` match). |
| **Denial of Service (DoS)** | • Brute-force credential stuffing<br>• GraphQL rate limit exhaustion via runaway requests | High | • Sliding-window IP rate limiter (`src/lib/rate-limiter.ts`) enforcing limits on `/api/auth/login` and `/api/auth/register`.<br>• Server-side memory caching (`src/lib/cache.ts`) for GitHub GraphQL responses with 5-minute TTL.<br>• Request bounds validation clamping pagination (`first: 10-50`) and numeric filter limits. |
| **Elevation of Privilege** | • Unauthorized access to administrative or other users' bookmarks | High | • User identity derived strictly from verified JWT claims.<br>• No administrative API endpoints exposed to the public internet.<br>• Multi-Factor Authentication mandatory for repository owners and cloud deployment accounts. <!-- osps_ac_01_01 --> |

---

## 4. Key Attack Surfaces & Mitigations

### 4.1. GitHub API Key Protection
- **Risk**: If `GITHUB_API_KEY` is exposed, adversaries could exhaust API quotas or abuse the associated token.
- **Defense**: Token is loaded exclusively on the Node.js server runtime. The `.env` file is strictly ignored by git (`.gitignore`). Git history is scanned via GitHub Secret Scanning.

### 4.2. Cross-Site Scripting (XSS) & Clickjacking
- **Risk**: Malicious markdown in issue descriptions rendered in the browser.
- **Defense**:
  - React auto-escapes string content in JSX.
  - Security headers configured in `next.config.ts`:
    - `X-Frame-Options: DENY`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 4.3. Supply Chain & Dependency Vulnerabilities
- **Risk**: Compromised third-party npm packages introducing malicious code.
- **Defense**:
  - Dependabot automated weekly vulnerability scanning.
  - `npm ci` with strict SHA-512 lockfile integrity (`package-lock.json`).
  - Automated CI test suites and typecheck validations on pull requests.

---

## 5. Security Assessment Conclusion

The First Issues architecture presents a well-defended, minimal attack surface with strong boundaries between client, server, and third-party APIs. By maintaining strict rate limiting, static GraphQL query structures, parameterized ORM queries, and automated dependency tracking, the platform meets the criteria for OpenSSF Baseline Level 2 security assurance.
