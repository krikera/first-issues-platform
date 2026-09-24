# First Issues - Architecture Documentation

## System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser["Browser"]
        NextApp["Next.js App<br/>localhost:3000"]
    end

    subgraph "API Layer"
        NextAPI["Next.js API Routes<br/>/api/..."]
    end

    subgraph "Data Layer"
        PostgreSQL[("PostgreSQL<br/>(via Prisma)")]
    end

    subgraph "External Services"
        GitHubAPI["GitHub GraphQL API"]
    end

    Browser --> NextApp
    NextApp -->|"REST + JWT"| NextAPI
    NextAPI -->|"Prisma ORM"| PostgreSQL
    NextAPI -->|"GraphQL (with server token)"| GitHubAPI
```

---

## System Actors & Actions Architecture <!-- osps_sa_01_01 -->

The First Issues platform defines clear operational boundaries and privilege levels across four key actors:

### 1. System Actors

```mermaid
graph LR
    subgraph "External Actors"
        Guest["Guest User<br/>(Anonymous)"]
        AuthUser["Authenticated User<br/>(JWT Bearer)"]
        Maintainer["Project Maintainer<br/>(Admin / Lead)"]
    end

    subgraph "System Boundary (First Issues)"
        WebApp["Next.js Web Client"]
        APIRoutes["Next.js Server API"]
        DB[("PostgreSQL DB")]
    end

    subgraph "Third-Party Services"
        GHAPI["GitHub GraphQL API"]
    end

    Guest -->|"Search & Filter Issues<br/>Local Bookmarks"| WebApp
    AuthUser -->|"Cloud Sync Bookmarks<br/>Profile Management"| WebApp
    WebApp -->|"Validated Requests"| APIRoutes
    APIRoutes -->|"Query Issues (Cached)"| GHAPI
    APIRoutes -->|"Persist User Data"| DB
    Maintainer -->|"Review PRs, Deploy,<br/>Rotate Secrets, Cut Releases"| APIRoutes
```

### 2. Actor-to-Action Matrix

| Actor | Action / Capability | Interface / Route | Authentication Required | Data Storage / Destination |
| :--- | :--- | :--- | :---: | :--- |
| **Guest User** | • Discover open-source issues<br>• Filter by language, stars, & recency<br>• Compute heuristic difficulty scores<br>• Bookmark issues locally<br>• View language analytics & changelog | `GET /`<br>`POST /api/github/issues`<br>`GET /analytics`<br>`GET /changelog` | No | LocalStorage (Client-only) |
| **Authenticated User** | • Register new user account<br>• Log in and obtain JWT access/refresh tokens<br>• Sync local bookmarks to cloud DB<br>• Create, read, update, delete bookmarks<br>• View authenticated profile | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`POST /api/bookmarks/sync`<br>`GET/POST/PATCH/DELETE /api/bookmarks`<br>`GET /profile` | Yes (Bearer JWT) | PostgreSQL Database |
| **Project Maintainer** | • Review and merge code contributions<br>• Verify DCO sign-offs & CI status checks<br>• Trigger cryptographically signed releases<br>• Manage environment secrets & database schema<br>• Coordinated Vulnerability Disclosure triage | GitHub Repo<br>GitHub Actions (`release.yml`)<br>Vercel Edge Console<br>Prisma DB CLI | Yes (MFA / WebAuthn / Owner) | GitHub, Vercel, Supabase |
| **GitHub GraphQL Service** | • Answer authenticated GraphQL queries<br>• Provide real-time repository stars, issues, and labels | `https://api.github.com/graphql` | Server Key (`GITHUB_API_KEY`) | GitHub Platform |

---

## Production Deployment

```mermaid
graph LR
    subgraph "Users"
        User["User"]
    end

    subgraph "Hosting & CDN"
        Vercel["Vercel<br/>Next.js Fullstack App"]
    end

    subgraph "Database"
        Supabase["Supabase<br/>PostgreSQL"]
    end

    User --> Vercel
    Vercel --> Supabase
```

---

## Frontend Architecture (Next.js App Router)

```mermaid
graph TB
    subgraph "Routes (src/app)"
        IndexRoute["/ (Home)"]
        AnalyticsRoute["/analytics"]
        BookmarksRoute["/bookmarks"]
        LoginRoute["/login"]
        ProfileRoute["/profile"]
    end

    subgraph "Components (src/components)"
        NavBar["NavBar"]
        IssueCard["IssueCard"]
        FilterPanel["FilterPanel"]
        Dashboard["AnalyticsDashboard"]
    end

    subgraph "Contexts (src/contexts)"
        AuthContext["AuthProvider<br/>(JWT + User State)"]
    end

    subgraph "Services (src/lib)"
        GitHubService["github.ts<br/>GraphQL Queries"]
    end

    IndexRoute --> IssueCard
    IndexRoute --> FilterPanel
    AnalyticsRoute --> Dashboard
```

---

## Backend Architecture (Next.js API Routes)

```mermaid
graph TB
    subgraph "Routes (src/app/api)"
        AuthRoutes["/api/auth/..."]
        GitHubRoutes["/api/github/issues"]
        BookmarksRoutes["/api/bookmarks/..."]
        HealthRoutes["/api/health"]
    end

    subgraph "Database Access"
        Prisma["Prisma Client (src/lib/prisma.ts)"]
    end

    subgraph "Active Models (PostgreSQL)"
        UserModel["User"]
        BookmarkModel["Bookmark"]
    end

    AuthRoutes --> Prisma
    BookmarksRoutes --> Prisma
    HealthRoutes --> Prisma

    Prisma --> UserModel
    Prisma --> BookmarkModel
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Next.js Client
    participant A as Next.js API (/api)
    participant DB as PostgreSQL

    Note over U,DB: Registration
    U->>F: Fill register form
    F->>A: POST /api/auth/register
    A->>A: Validate + Hash password (bcrypt)
    A->>DB: Prisma create user
    A-->>F: 201 Created

    Note over U,DB: Login
    U->>F: Enter credentials
    F->>A: POST /api/auth/login
    A->>DB: Find user by email
    A->>A: Verify password
    A->>A: Generate JWT tokens
    A-->>F: {access_token, refresh_token}
    F->>F: Store in localStorage

    Note over U,DB: Authenticated Request
    U->>F: Visit /bookmarks
    F->>A: GET /api/bookmarks + Bearer token
    A->>A: Validate JWT
    A->>DB: Fetch user bookmarks
    A-->>F: 200 OK + data
```

---

## Security Architecture

```mermaid
graph TB
    subgraph "Frontend Security"
        CSP["Content Security Policy"]
        XSS["XSS Prevention<br/>(React auto-escape)"]
        HTTPS["HTTPS Only"]
    end

    subgraph "API Security"
        JWTAuth["JWT Authentication"]
        PrismaValidation["Prisma Validation"]
    end

    subgraph "Data Security"
        BCrypt["Password Hashing<br/>(bcrypt)"]
        EnvSecrets["Secrets in ENV vars"]
    end

    Request["Incoming Request"] --> JWTAuth
    JWTAuth --> PrismaValidation
    PrismaValidation --> BCrypt
```

---

## Directory Structure

```
first-issues/
├── prisma/                       # Database ORM
│   └── schema.prisma            # Database models
├── public/                       # Static assets
├── src/                          # Application Code
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # Backend API routes
│   │   ├── analytics/            # Pages
│   │   ├── bookmarks/            
│   │   ├── login/                
│   │   └── ...                   
│   ├── components/               # React components
│   ├── contexts/                 # Auth & Theme context
│   ├── lib/                      # Backend & shared logic (Prisma, GitHub)
│   ├── types/                    # TypeScript interfaces
│   └── utils/                    # Utility functions
└── docs/                         # Documentation
    └── architecture.md           # This file
```

---

## Technology Stack

| Layer        | Technology            | Purpose               |
| ------------ | --------------------- | --------------------- |
| **Fullstack**| Next.js 16 (App Router)| Routing & API         |
| **Styling**  | Tailwind CSS          | Utility-first CSS     |
| **Auth**     | JWT (jose)            | Stateless Auth        |
| **Database** | PostgreSQL (Supabase) | User data, bookmarks  |
| **ORM**      | Prisma                | Database access       |
| **API**      | GitHub GraphQL        | Issue data            |
| **Hosting**  | Vercel                | Full application deployment |
