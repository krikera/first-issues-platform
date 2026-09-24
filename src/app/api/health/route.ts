import { NextResponse } from "next/server";
import { cacheService } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cacheHealth = cacheService.healthCheck();
  const cacheInfo = cacheService.getInfo();
  let dbStatus = "connected";

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "disconnected";
  }

  const isHealthy = cacheHealth.memory.status === "ok" && dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        cache: {
          ...cacheHealth,
          ...cacheInfo,
        },
        database: dbStatus,
      },
      version: "1.0.0",
      stack: "next.js",
    },
    { status: isHealthy ? 200 : 503 }
  );
}
