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

    return NextResponse.json({ bookmark: formatBookmark(bookmark) });
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

    return NextResponse.json({ bookmark: formatBookmark(updated) });
  } catch (error) {
    return handleApiError(error);
  }
}

function formatBookmark(b: { id: number; issueId: string; issueNumber: number; repoOwner: string; repoName: string; issueTitle: string | null; issueState: string | null; issueUrl: string | null; issueLabels: unknown; notes: string | null; tags: unknown; createdAt: Date }) {
  return {
    id: b.id,
    issue_id: b.issueId,
    issue_number: b.issueNumber,
    repo_owner: b.repoOwner,
    repo_name: b.repoName,
    issue_title: b.issueTitle,
    issue_state: b.issueState,
    issue_url: b.issueUrl,
    issue_labels: b.issueLabels,
    notes: b.notes,
    tags: b.tags,
    created_at: b.createdAt.toISOString(),
  };
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
