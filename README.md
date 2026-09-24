# First Issues


[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/14786/badge)](https://www.bestpractices.dev/projects/14786)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

First Issues is a web application designed to help developers find beginner-friendly open-source contributions. It queries the GitHub GraphQL API to aggregate, filter, and score "good first issue" problems across public repositories.

## Features

### Core Capabilities
- **GitHub Issue Discovery**: Query open-source issues labeled "good first issue" in real-time via the GitHub GraphQL API.
- **Advanced Filtering**: Filter issues by programming language, repository star count, fork count, assigned status, and update recency.
- **Automated Difficulty Scoring**: Heuristic scoring engine calculating issue complexity based on labels, comment count, repository stars, issue age, and assignee/PR status.
- **User Authentication**: Secure user registration, authentication, and profile management using JWT tokens (`jose` + `bcryptjs`).
- **Bookmark Management & Sync**: Save issues locally or sync them directly with a PostgreSQL database when authenticated.
- **Repository Analytics**: Visual metrics on language distribution, issue statistics, and repository recommendations.
- **Theme Support**: Dark and light mode interface powered by Tailwind CSS and CSS variables.

### Architecture & Security
- **Type Safety**: Built with TypeScript across client and server boundaries.
- **ORM & Database**: Schema management and type-safe database queries via Prisma ORM with PostgreSQL.
- **Security Headers**: Standard HTTP security headers (`X-Frame-Options`, `HSTS`, `Permissions-Policy`) configured at the application edge.

## Tech Stack

### Framework & Database
- **Framework**: Next.js 16 (React 19, App Router)
- **Styling & UI**: Tailwind CSS, Radix UI Primitives, Lucide Icons
- **Authentication**: JWT (`jose`), Password Hashing (`bcryptjs`)
- **Database & ORM**: PostgreSQL via Prisma ORM
- **APIs**: GitHub GraphQL API with Next.js API Routes (`/api/...`)
- **Deployment**: Vercel (Web App & API Routes) + Supabase/Neon (PostgreSQL)

## Getting Started

### Prerequisites
- Node.js 20.0.0 or higher
- PostgreSQL database (Supabase, Neon, or local instance)
- Git
- GitHub Personal Access Token (classic token with `public_repo` scope)

### Local Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/krikera/first-issues-platform.git
   cd first-issues
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Push the Prisma database schema:
   ```bash
   npx prisma db push
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

### Required Variables
- `GITHUB_API_KEY`: GitHub Personal Access Token (`public_repo` scope)
- `DATABASE_URL`: PostgreSQL connection URI for Prisma
- `JWT_SECRET_KEY`: Secret key used for signing JWT authentication tokens
- `NEXT_PUBLIC_APP_URL`: Base application URL (e.g., `http://localhost:3000`)

### Obtaining a GitHub Access Token
1. Go to GitHub Settings -> Developer settings -> Personal access tokens -> Tokens (classic).
2. Generate a new token with `public_repo` scope.
3. Add the token to your `.env` file as `GITHUB_API_KEY`.

## Project Structure

```
first-issues/
├── prisma/                       # Database schema definition
│   └── schema.prisma
├── public/                       # Static assets, web manifest, icons
├── src/                          # Next.js App Router application
│   ├── app/                      # Pages and API route handlers (/api/...)
│   ├── components/               # React UI components
│   ├── contexts/                 # Application contexts (Auth, Theme)
│   ├── data/                     # Categories and defaults
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Auth, Prisma client, and GitHub GraphQL client
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Client helpers and difficulty scoring
└── docs/                         # Architecture documentation
```

## Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm test`: Executes the automated Vitest test suite. <!-- osps_qa_06_01, osps_qa_06_02 -->
- `npm run build`: Generates Prisma client and builds the application for production.
- `npm run start`: Runs the compiled production server.
- `npm run lint`: Executes TypeScript typechecks.
- `npm run db:push`: Synchronizes Prisma schema directly with the PostgreSQL database.
- `npm run db:studio`: Opens Prisma Studio GUI for database management.

## Contributing & Governance

- [CONTRIBUTING.md](CONTRIBUTING.md): Contribution workflow, style guidelines, quality checks, when/how testing policy, and DCO (`git commit -s`) requirement. <!-- osps_le_01_01, osps_gv_03_02, osps_qa_06_02, osps_qa_06_03 -->
- [GOVERNANCE.md](GOVERNANCE.md): Project roles, maintainer responsibilities, Sensitive Resource Access Matrix, collaborator review policy, and non-author approval requirements. <!-- osps_gv_01_01, osps_gv_01_02, osps_gv_04_01, osps_qa_07_01 -->
- [SECURITY.md](SECURITY.md): Coordinated Vulnerability Disclosure (CVD) policy, release lifecycle & EOL policy, secrets management guidelines, and SAST thresholds. <!-- osps_vm_01_01, osps_vm_03_01, osps_vm_04_01, osps_do_04_01, osps_do_05_01, osps_br_07_02, osps_vm_06_01 -->
- [CHANGELOG.md](CHANGELOG.md): Descriptive release log of functional and security modifications. <!-- osps_br_04_01 -->
- [docs/security-assessment.md](docs/security-assessment.md): STRIDE threat modeling and granular analysis of critical code paths and functions. <!-- osps_sa_03_01, osps_sa_03_02 -->
- [docs/dependency-management.md](docs/dependency-management.md): Criteria for selecting, obtaining, and tracking dependencies, and SCA remediation thresholds. <!-- osps_do_06_01, osps_vm_05_01, osps_vm_05_02, osps_vm_05_03 -->
- [docs/openvex.json](docs/openvex.json): Machine-readable OpenVEX exploitability document detailing non-exploitability justifications for scanned third-party component vulnerabilities. <!-- osps_vm_04_02 -->

## Verifying Release Integrity & Authenticity <!-- osps_do_03_01, osps_do_03_02 -->

All official releases are cryptographically signed with SLSA build provenance attestations, delivered with CycloneDX Software Bill of Materials (SBOM), and published with SHA-256 digest manifests:

### 1. Verify Checksum Manifest <!-- osps_do_03_01 -->
```bash
# Download the release archive and checksum manifest
curl -sLO https://github.com/krikera/first-issues-platform/releases/download/v1.0.0/first-issues-v1.0.0-checksums.txt
curl -sLO https://github.com/krikera/first-issues-platform/releases/download/v1.0.0/first-issues-v1.0.0.tar.gz

# Verify SHA-256 integrity
sha256sum -c first-issues-v1.0.0-checksums.txt
```

### 2. Verify Cryptographic Provenance & Author Identity <!-- osps_do_03_02 -->
Using the GitHub CLI (`gh`), verify that the release was built and signed exclusively by the official repository release workflow:
```bash
gh attestation verify first-issues-v1.0.0.tar.gz \
  --owner krikera \
  --repo krikera/first-issues-platform \
  --cert-identity-regex "^https://github.com/krikera/first-issues-platform/\.github/workflows/release\.yml@refs/tags/v.*"
```

**Expected Signer & Author Parameters:**
- **Repository:** `krikera/first-issues-platform`
- **Workflow Signer Identity:** `https://github.com/krikera/first-issues-platform/.github/workflows/release.yml`
- **OIDC Issuer:** `https://token.actions.githubusercontent.com`
- **Author Identity:** `@krikera` (Project Lead)

## Repository Scope & Distribution

- **Repository Scope**: First Issues is maintained as a single, unified source repository (`krikera/first-issues-platform`). The project does not maintain multiple or external subproject repositories. <!-- osps_qa_04_01, osps_qa_04_02 -->
- **Encrypted Channels**: All official project channels (repository, documentation, issue tracker) are delivered exclusively over encrypted HTTPS/TLS. <!-- osps_br_03_01 -->
- **Distribution Authenticity**: Official distributions and dependencies are managed through cryptographically authenticated channels (Git over SSH/HTTPS and npm with SHA-512 package lockfiles). <!-- osps_br_03_02 -->
- **Release Provenance & Unique Assets**: Official releases are cryptographically signed with SLSA build provenance attestations, uniquely versioned release assets (`first-issues-${VERSION}.tar.gz`, `first-issues-${VERSION}-checksums.txt`), and CycloneDX SBOMs (`first-issues-${VERSION}-sbom.cdx.json`). <!-- osps_br_02_01, osps_br_02_02, osps_br_06_01, osps_qa_02_02 -->

## License

Distributed under the MIT License. Both the source code and all released software assets are licensed under the MIT License. <!-- osps_le_02_01, osps_le_02_02 --> See [LICENSE](LICENSE) for details.

## Acknowledgments

- GitHub API for issue and repository GraphQL data
- Next.js framework
- Prisma ORM
- Radix UI component primitives
- Tailwind CSS

