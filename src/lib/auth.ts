/**
 * JWT Authentication utilities
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY environment variable is not defined");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

const ACCESS_TOKEN_EXPIRES = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRES = "7d"; // 7 days

// in-memory token blacklist (for logout)
const tokenBlacklist = new Set<string>();

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
    if (payload.jti && tokenBlacklist.has(payload.jti)) {
      return null;
    }

    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function blacklistToken(jti: string): void {
  tokenBlacklist.add(jti);

  // Auto-cleanup after 1 hour to prevent memory leak
  setTimeout(() => {
    tokenBlacklist.delete(jti);
  }, 60 * 60 * 1000);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
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
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "access") return null;

  return parseInt(payload.sub, 10);
}
