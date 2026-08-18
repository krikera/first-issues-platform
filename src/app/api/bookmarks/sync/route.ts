import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { handleApiError, AuthenticationError } from "@/lib/error-handler";

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const body = await request.json();
    const localBookmarks = body.local_bookmarks || [];

    let synced = 0;
    for (const bookmark of localBookmarks) {
      const { issue_id, issue_url, issue_title, repository_name } = bookmark;
      if (!issue_id) continue;

      // Parse issue_id
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

      // Upsert — skip if exists
      const existing = await prisma.bookmark.findFirst({
        where: { userId, issueId: issue_id },
      });

      if (!existing) {
        await prisma.bookmark.create({
          data: {
            userId,
            issueId: issue_id,
            issueNumber,
            repoOwner,
            repoName,
            issueTitle: issue_title || null,
            issueUrl: issue_url || null,
          },
        });
        synced++;
      }
    }

    return NextResponse.json({
      message: `Synced ${synced} bookmark(s) to cloud`,
      synced_count: synced,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
