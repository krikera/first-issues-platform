import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { handleApiError, AuthenticationError, ValidationError, ForbiddenError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const body = await request.json();
    const { bookmark_ids } = body;

    if (!Array.isArray(bookmark_ids) || bookmark_ids.length === 0) {
      throw new ValidationError("bookmark_ids array is required");
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        id: { in: bookmark_ids.map((id: number) => Number(id)) },
      },
      select: { id: true, userId: true },
    });

    const unauthorized = bookmarks.some((b) => b.userId !== userId);
    if (unauthorized) throw new ForbiddenError("Cannot delete bookmarks owned by another user");

    const result = await prisma.bookmark.deleteMany({
      where: {
        id: { in: bookmarks.map((b) => b.id) },
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
