/**
 * JWT Authentication utilities
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET_KEY environment variable is required in production mode.");
    }
    return new TextEncoder().encode("fallback-secret-for-build-and-dev-environment-minimum-32-chars");
  }
  if (secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error("FATAL: JWT_SECRET_KEY must be at least 32 characters long in production mode.");
  }
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = getJwtSecret();

const ACCESS_TOKEN_EXPIRES = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRES = "7d"; // 7 days

// In-memory token blacklist mapping jti -> expiration timestamp (ms)
const tokenBlacklist = new Map<string, number>();

export interface TokenPayload extends JWTPayload {
  sub: string; // user id
  type: "access" | "refresh";
}

export async function signAccessToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId), type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES)
    .setJti(crypto.randomUUID())
    .sign(JWT_SECRET);
}

export async function signRefreshToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId), type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES)
    .setJti(crypto.randomUUID())
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check blacklist
    if (payload.jti) {
      const expiresAt = tokenBlacklist.get(payload.jti);
      if (expiresAt) {
        if (Date.now() < expiresAt) {
          return null;
        }
        tokenBlacklist.delete(payload.jti);
      }
    }

    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function blacklistToken(jti: string, ttlMs: number = 7 * 24 * 60 * 60 * 1000): void {
  tokenBlacklist.set(jti, Date.now() + ttlMs);

  // Auto-cleanup after ttl
  setTimeout(() => {
    tokenBlacklist.delete(jti);
  }, Math.min(ttlMs, 2147483647));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(
  authHeader: string | null
): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
 */
export function validatePasswordStrength(password: string): boolean {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasUpper && hasLower && hasDigit;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate username format (alphanumeric, underscore, hyphen, 3-50 chars)
 */
export function validateUsername(username: string): boolean {
  if (!username || username.length < 3 || username.length > 50) return false;
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

/**
 * Helper to get authenticated user ID from request
 */
export async function getAuthenticatedUserId(
  request: Request
): Promise<number | null> {
  const authHeader = request.headers.get("Authorization");
  const token = extractBearerToken(authHeader);
  if (!token) {
    // If no authorization header, check whether an internal verified header exists only alongside middleware verification
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "access") return null;

  return parseInt(payload.sub, 10);
}
