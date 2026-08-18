import { NextResponse } from "next/server";
import {
  extractBearerToken,
  verifyToken,
  signAccessToken,
} from "@/lib/auth";
import { handleApiError, AuthenticationError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractBearerToken(authHeader);
    if (!token) {
      throw new AuthenticationError("Refresh token required");
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== "refresh") {
      throw new AuthenticationError("Invalid or expired refresh token");
    }

    const userId = parseInt(payload.sub, 10);
    const accessToken = await signAccessToken(userId);

    return NextResponse.json({
      access_token: accessToken,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
