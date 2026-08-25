import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, extractBearerToken } from "./lib/auth";

export const config = {
  matcher: [
    "/api/bookmarks/:path*",
    "/api/auth/me",
    "/api/auth/logout"
  ],
};

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = extractBearerToken(authHeader);

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload || payload.type !== "access") {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.sub);
  if (payload.jti) {
    requestHeaders.set("x-jti", payload.jti);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
