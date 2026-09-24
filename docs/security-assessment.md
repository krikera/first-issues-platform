# Security Assessment & Threat Model

**Project:** First Issues (`krikera/first-issues-platform`)  
**Assessment Standard:** OpenSSF Baseline Level 3 <!-- osps_sa_03_01, osps_sa_03_02 -->  
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
  - Automated CI dependency audit gate (`npm audit --audit-level=high --omit=dev`).
  - OpenVEX exploitability document ([docs/openvex.json](openvex.json)) accounting for non-affecting component advisories.
  - `npm ci` with strict SHA-512 lockfile integrity (`package-lock.json`).

---

## 5. Threat Modeling & Analysis of Critical Code Paths & Functions <!-- osps_sa_03_02 -->

To meet the requirements of OpenSSF Baseline Level 3, the project performs granular threat modeling on all critical code paths, functions, and subsystem interactions:

### 5.1. Session Authentication & Token Cryptography (`src/lib/auth.ts`)
- **Critical Functions**: `signToken()`, `verifyToken()`, `hashPassword()`, `comparePasswords()`.
- **Target Assets**: User session integrity, user password hashes, JWT signing key (`JWT_SECRET_KEY`).
- **Threat Scenarios**:
  - *Algorithm Confusion / Weak Secrets*: Attacker crafts an unverified token or exploits weak secrets.  
    **Mitigation**: `signToken` and `verifyToken` strictly enforce HMAC-SHA256 (`HS256`) using `jose`, requiring `JWT_SECRET_KEY` to be at least 32 characters (256-bit entropy).
  - *Token Expiration & Replay*: Stolen token reused indefinitely.  
    **Mitigation**: Tokens are minted with explicit 24-hour expiration (`24h`) and verified cryptographically at the API route boundary before granting access to protected resources.
  - *Timing Attacks on Password Verification*: Attacker measures comparison duration to guess passwords.  
    **Mitigation**: Passwords hashed with `bcryptjs` using adaptive salt rounds (10), providing constant-time string comparison resistance.

### 5.2. Abuse Mitigation & Sliding-Window Rate Limiting (`src/lib/rate-limiter.ts`)
- **Critical Functions**: `checkRateLimit()`, `getClientIp()`.
- **Target Assets**: Authentication endpoints (`/api/auth/login`, `/api/auth/register`), database connection pools.
- **Threat Scenarios**:
  - *IP Header Spoofing*: Attacker rotates `X-Forwarded-For` header values to circumvent per-IP limits.  
    **Mitigation**: `getClientIp` prioritizes trusted platform edge headers (`x-vercel-ip`, `cf-connecting-ip`) and parses the rightmost client IP address from proxy chains.
  - *State Exhaustion Denial of Service*: Attacker floods requests from randomized IPs to exhaust Node.js server memory with tracker objects.  
    **Mitigation**: The in-memory rate limiter enforces active cleanup windows, purging expired tracking records every 60 seconds. Exceeded limits return HTTP 429 Too Many Requests with explicit retry-after headers.

### 5.3. Upstream GitHub GraphQL Intermediary & Ingestion (`src/lib/github.ts`)
- **Critical Functions**: `fetchGoodFirstIssues()`, `sanitizeQueryParam()`.
- **Target Assets**: Server-side `GITHUB_API_KEY`, GitHub GraphQL hourly rate limit.
- **Threat Scenarios**:
  - *GraphQL Query Injection*: Attacker injects malicious GraphQL AST syntax through query parameters.  
    **Mitigation**: Queries are compiled as immutable static string templates with strongly typed variables; dynamic user parameters (e.g., search keywords, language filters) are sanitized and stripped of control characters before variable binding.
  - *Resource Exhaustion via Massive Page Requests*: Attacker requests pagination depths (e.g., `first: 10000`) to trigger server timeout.  
    **Mitigation**: Input clamping enforces bounds `10 <= first <= 50`, preventing oversized payload extraction. Responses are cached in-memory (`src/lib/cache.ts`) for 5 minutes.

### 5.4. Database Persistence & Multi-Tenant Bookmark Isolation (`src/app/api/bookmarks/route.ts`)
- **Critical Functions**: `GET`, `POST`, `DELETE`, `PATCH`.
- **Target Assets**: User bookmark collections, database availability.
- **Threat Scenarios**:
  - *Insecure Direct Object Reference (IDOR)*: Attacker deletes or views another user's saved bookmark by guessing the bookmark ID.  
    **Mitigation**: Every bookmark query and mutation (`findUnique`, `delete`, `update`) strictly combines the `id` with the authenticated session `userId` (`where: { id, userId }`), preventing cross-tenant access.
  - *SQL Injection*: Parameter manipulation in bookmark CRUD operations.  
    **Mitigation**: 100% of interactions route through Prisma ORM parameterized statements, preventing raw SQL execution.

---

## 6. Security Assessment Conclusion

The First Issues architecture presents a well-defended, minimal attack surface with strong boundaries between client, server, and third-party APIs. By maintaining strict rate limiting, static GraphQL query structures, parameterized ORM queries, automated dependency tracking, OpenVEX exploitability declarations, and granular threat analysis across critical code paths, the platform meets the criteria for OpenSSF Baseline Level 3 security assurance.

