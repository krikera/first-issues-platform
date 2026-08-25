/**
 * API error handling utilities
 */

import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = "Authentication required") {
    super(401, message);
    this.name = "AuthenticationError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Access forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class ExternalServiceError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(502, message, details);
    this.name = "ExternalServiceError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Expose stack traces only in development
  const isDev = process.env.NODE_ENV !== "production";
  const stack = isDev && error instanceof Error ? error.stack : undefined;

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
        ...(stack ? { stack } : {}),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors gracefully without leaking schema details
  if (typeof error === "object" && error !== null && "code" in error) {
    const prismaError = error as { code: string; meta?: unknown };
    
    // Unique constraint violation
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { 
          error: "A record with this value already exists (conflict).",
          ...(stack ? { stack } : {}),
        },
        { status: 409 }
      );
    }
    
    // Record not found
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { 
          error: "The requested resource was not found.",
          ...(stack ? { stack } : {}),
        },
        { status: 404 }
      );
    }
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { 
      error: "Internal server error",
      ...(stack ? { stack } : {}),
    },
    { status: 500 }
  );
}
