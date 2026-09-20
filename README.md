# First Issues



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
- `npm run build`: Generates Prisma client and builds the application for production.
- `npm run start`: Runs the compiled production server.
- `npm run lint`: Executes Next.js ESLint rules.
- `npm run db:push`: Synchronizes Prisma schema directly with the PostgreSQL database.
- `npm run db:studio`: Opens Prisma Studio GUI for database management.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Refer to [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- GitHub API for issue and repository GraphQL data
- Next.js framework
- Prisma ORM
- Radix UI component primitives
- Tailwind CSS
