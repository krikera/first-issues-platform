import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AuthenticationError("User account is inactive or no longer exists");
    }

    const accessToken = await signAccessToken(userId);

    return NextResponse.json({
      access_token: accessToken,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
