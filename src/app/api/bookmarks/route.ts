import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { handleApiError, AuthenticationError, ValidationError, NotFoundError } from "@/lib/error-handler";

// GET /api/bookmarks — list bookmarks
export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get("per_page") || "50", 10)));
    const sortBy = url.searchParams.get("sort_by") || "created_at";
    const sortOrder = url.searchParams.get("sort_order") === "asc" ? "asc" : "desc";

    const allowedSorts = ["created_at", "updated_at", "issue_title"];
    const orderBy = allowedSorts.includes(sortBy) ? sortBy : "created_at";

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId, isArchived: false },
        orderBy: { [orderBy === "issue_title" ? "issueTitle" : orderBy === "updated_at" ? "updatedAt" : "createdAt"]: sortOrder },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.bookmark.count({ where: { userId, isArchived: false } }),
    ]);

    return NextResponse.json({
      bookmarks: bookmarks.map((b) => ({
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
      })),
      total,
      page,
      per_page: perPage,
      total_pages: Math.ceil(total / perPage),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/bookmarks — create bookmark
export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const body = await request.json();
    const { issue_id, issue_url, issue_title, repository_name, notes, tags } = body;

    if (!issue_id) throw new ValidationError("issue_id is required");

    // Parse issue_id format: owner/repo#number
    let repoOwner = "", repoName = "", issueNumber = 0;
    const match = issue_id.match(/^([^/]+)\/([^#]+)#(\d+)$/);
    if (match) {
      repoOwner = match[1];
      repoName = match[2];
      issueNumber = parseInt(match[3], 10);
    } else {
      repoOwner = repository_name?.split("/")[0] || "unknown";
      repoName = repository_name?.split("/")[1] || "unknown";
    }

    // Check for duplicate
    const existing = await prisma.bookmark.findFirst({
      where: { userId, issueId: issue_id },
    });
    if (existing) {
      return NextResponse.json({ bookmark: formatBookmark(existing) });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        issueId: issue_id,
        issueNumber,
        repoOwner,
        repoName,
        issueTitle: issue_title || null,
        issueUrl: issue_url || null,
        notes: notes || null,
        tags: tags || [],
      },
    });

    return NextResponse.json({ bookmark: formatBookmark(bookmark) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/bookmarks — not used at top level, see [id]/route.ts
// But we need a bulk delete via query params sometimes
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) throw new ValidationError("Bookmark ID required");

    const bookmark = await prisma.bookmark.findFirst({
      where: { id: parseInt(id, 10), userId },
    });
    if (!bookmark) throw new NotFoundError("Bookmark not found");

    await prisma.bookmark.delete({ where: { id: bookmark.id } });

    return NextResponse.json({ message: "Bookmark deleted" });
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
