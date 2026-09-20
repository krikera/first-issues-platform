import { NextResponse } from "next/server";
import {
  extractBearerToken,
  verifyToken,
  blacklistToken,
} from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractBearerToken(authHeader);
    
    // Verify bearer access token if present
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.jti && payload.type === "access") {
        blacklistToken(payload.jti, 15 * 60 * 1000); // 15m for access token
      }
    }

    // Also verify and blacklist refresh token from body if provided
    try {
      const body = await request.json().catch(() => ({}));
      if (body?.refresh_token && typeof body.refresh_token === "string") {
        const refreshPayload = await verifyToken(body.refresh_token);
        if (refreshPayload?.jti && refreshPayload.type === "refresh") {
          blacklistToken(refreshPayload.jti, 7 * 24 * 60 * 60 * 1000); // 7d for refresh token
        }
      }
    } catch {
      // Ignore body parsing issues
    }

    return NextResponse.json({ message: "Successfully logged out" });
  } catch (error) {
    return handleApiError(error);
  }
}
