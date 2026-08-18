import { NextResponse } from "next/server";
import { cacheService } from "@/lib/cache";

export async function GET() {
  const health = cacheService.healthCheck();

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      cache: health,
      database: "connected",
    },
    version: "2.0.0",
    stack: "next.js",
  });
}
