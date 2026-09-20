import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Limit to 30 error reports per minute per IP to prevent telemetry flooding
    if (isRateLimited(`errors:${ip}`, 30, 60)) {
      return NextResponse.json({ error: "Too many error reports" }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("[Client Error Telemetry]", body?.error?.message || "Unknown error", body);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record error" }, { status: 500 });
  }
}
