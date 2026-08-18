# First Issues - Development & Setup Guide

This guide details the setup and execution of the First Issues application in a local development environment.

## Prerequisites

Ensure the following dependencies are installed:

- **Node.js** (v20.0.0 or higher)
- **npm** (v10 or higher)
- **PostgreSQL Database** (Local instance or cloud provider such as Supabase / Neon)
- **Git**

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/krikera/first-issues.git
cd first-issues
```

### 2. Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
cp .env.example .env
```

Set the required environment variables:

```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/first_issues"

# GitHub Personal Access Token
GITHUB_API_KEY=your_github_personal_access_token_here

# JWT Secret for session authentication
JWT_SECRET_KEY=your_secure_jwt_secret_key_here

# Base Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup (Prisma)

Synchronize the PostgreSQL database schema with Prisma:

```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## Running the Application

### Start Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## Available Commands

```bash
npm run dev          # Start Next.js development server
npm run build        # Build optimized production bundle
npm run start        # Run production server
npm run lint         # Run ESLint validation
npx tsc --noEmit     # Execute TypeScript type checking
npm run db:push      # Push Prisma schema updates to database
npm run db:studio    # Launch Prisma Studio web interface
```

