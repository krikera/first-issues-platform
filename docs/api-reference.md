# API Documentation

## Overview

The application utilizes internal Next.js API routes under the `/api` path.

Base URLs:
- **Development**: `http://localhost:3000`
- **Production**: Deployed application domain

---

## Authentication

All protected endpoints require a JWT token in the header:

```
Authorization: Bearer <access_token>
```

The application's authentication service (`AuthContext`) utilizes Axios interceptors to automatically handle token refreshing when encountering a `401 Unauthorized` response.

### Endpoints

#### POST /api/auth/register

Create a new user account.

```json
// Request
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123"
}

// Response 201
{
  "message": "User created successfully",
  "user": { "id": 1, "username": "johndoe", ... }
}
```

#### POST /api/auth/login

Authenticate and receive tokens.

```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { ... }
}
```

#### POST /api/auth/refresh

Refresh access token using the stored refresh token.

```
Authorization: Bearer <refresh_token>
```

#### GET /api/auth/me

Get current user info based on the provided access token.

#### POST /api/auth/logout

Invalidates the current session.

---

## Bookmarks (Protected)

### GET /api/bookmarks

List all bookmarks for the authenticated user.

### POST /api/bookmarks

Create a new bookmark. Requires issue details in the request body.

### PATCH /api/bookmarks/:id

Update bookmark notes/tags.

### DELETE /api/bookmarks/:id

Remove a bookmark by its database ID.

### POST /api/bookmarks/sync

Synchronize local (guest) bookmarks with the database upon user login.

---

## GitHub Issues Discovery <!-- osps_sa_02_01 -->

### GET /api/github/issues

Queries and returns aggregated beginner-friendly GitHub issues matching specified filters. Responses are cached server-side (5-minute TTL) with sliding-window rate limiting (60 req/min).

**Query Parameters:**

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `language` | string | `""` | Filter by programming language (e.g., `javascript`, `python`, `rust`). |
| `minStars` | integer | `0` | Minimum repository star count. |
| `maxStars` | integer | `1000000` | Maximum repository star count. |
| `minForks` | integer | `0` | Minimum repository forks count. |
| `isAssigned` | boolean | `false` | When true, returns only assigned issues; false for unassigned. |
| `category` | string | `"all"` | Issue topic category (e.g. `web`, `ai`, `cli`, `all`). |
| `framework` | string | `""` | Framework filter (e.g. `react`, `nextjs`, `vue`). |
| `cursor` | string | `null` | Pagination cursor for next page of issues. |
| `refresh` | boolean | `false` | Force bypass cache (rate-limited to 6 req/min per IP). |

**Response (200 OK):**
```json
{
  "issues": [
    {
      "id": "I_kwDO...",
      "title": "Fix typo in documentation",
      "url": "https://github.com/org/repo/issues/12",
      "labels": ["good first issue", "docs"],
      "comments_count": 0,
      "created_at": "2026-09-20T10:00:00Z",
      "repository": {
        "name": "repo",
        "owner": "org",
        "stars_count": 1200,
        "forks_count": 85,
        "primary_language": "TypeScript"
      },
      "difficulty": {
        "score": 2.5,
        "label": "Easy",
        "color": "green",
        "emoji": "🟢"
      }
    }
  ],
  "pageInfo": {
    "hasNextPage": true,
    "endCursor": "Y3Vyc29yOnYyOpHO..."
  },
  "totalCount": 42
}
```

---

## Client Error Telemetry <!-- osps_sa_02_01 -->

### POST /api/errors

Receives sanitized client error payloads for diagnostics. Rate-limited to 30 requests per minute per IP.

**Request Body:**
```json
{
  "error": {
    "message": "Failed to fetch GraphQL resource",
    "name": "NetworkError"
  },
  "url": "http://localhost:3000/analytics",
  "timestamp": "2026-09-24T08:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "received": true
}
```

---

## Health Check

### GET /api/health

Returns the API status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-18T12:00:00.000Z",
  "services": {
    "cache": {
      "timestamp": "2026-09-18T12:00:00.000Z",
      "memory": { "status": "ok", "size": 0 },
      "memorySize": 0,
      "cacheDuration": 300
    },
    "database": "connected"
  },
  "version": "1.0.0",
  "stack": "next.js"
}
```

---

## Error Responses

Errors generally follow this structure:

```json
{
  "error": "Error message details"
}
```

| Status | Meaning          |
| ------ | ---------------- |
| 400    | Validation error |
| 401    | Unauthorized     |
| 403    | Forbidden        |
| 404    | Not found        |
| 500    | Server error     |
