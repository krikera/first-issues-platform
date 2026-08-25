import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { handleApiError, AuthenticationError, NotFoundError, ForbiddenError } from "@/lib/error-handler";

// GET /api/bookmarks/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const { id } = await params;
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: parseInt(id, 10) },
    });

    if (!bookmark) throw new NotFoundError("Bookmark not found");
    if (bookmark.userId !== userId) throw new ForbiddenError();

    return NextResponse.json({ bookmark });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/bookmarks/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const { id } = await params;
    const body = await request.json();

    const bookmark = await prisma.bookmark.findFirst({
      where: { id: parseInt(id, 10) },
    });
    if (!bookmark) throw new NotFoundError("Bookmark not found");
    if (bookmark.userId !== userId) throw new ForbiddenError();

    const updated = await prisma.bookmark.update({
      where: { id: bookmark.id },
      data: {
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.tags !== undefined ? { tags: body.tags } : {}),
        ...(body.is_archived !== undefined
          ? { isArchived: body.is_archived }
          : {}),
      },
    });

    return NextResponse.json({ bookmark: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/bookmarks/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const { id } = await params;
    const bookmark = await prisma.bookmark.findFirst({
      where: { id: parseInt(id, 10) },
    });

    if (!bookmark) throw new NotFoundError("Bookmark not found");
    if (bookmark.userId !== userId) throw new ForbiddenError();

    await prisma.bookmark.delete({ where: { id: bookmark.id } });

    return NextResponse.json({ message: "Bookmark deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
