import { NextResponse } from "next/server";
import { extractBearerToken, verifyToken } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractBearerToken(authHeader);
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true, user_id: payload.sub });
  } catch (error) {
    return handleApiError(error);
  }
}
