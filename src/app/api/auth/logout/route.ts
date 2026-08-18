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

    if (token) {
      const payload = await verifyToken(token);
      if (payload?.jti) {
        blacklistToken(payload.jti);
      }
    }

    return NextResponse.json({ message: "Successfully logged out" });
  } catch (error) {
    return handleApiError(error);
  }
}
