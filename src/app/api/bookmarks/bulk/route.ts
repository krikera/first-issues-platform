import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const body = await request.json();
    const { bookmark_ids } = body;

    if (!Array.isArray(bookmark_ids) || bookmark_ids.length === 0) {
      throw new ValidationError("bookmark_ids array is required");
    }

    const result = await prisma.bookmark.deleteMany({
      where: {
        id: { in: bookmark_ids.map((id: number) => Number(id)) },
        userId,
      },
    });

    return NextResponse.json({
      message: `Deleted ${result.count} bookmark(s)`,
      deleted_count: result.count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
