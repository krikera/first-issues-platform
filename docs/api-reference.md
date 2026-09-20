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
  "version": "2.0.0",
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
