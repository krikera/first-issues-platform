import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/auth";
import { handleApiError, AuthenticationError } from "@/lib/error-handler";

function isValidIssueUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  if (typeof url !== "string" || url.length > 500) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "github.com" || parsed.hostname === "www.github.com")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) throw new AuthenticationError();

    const body = await request.json();
    const localBookmarks = Array.isArray(body.local_bookmarks) ? body.local_bookmarks : [];

    if (localBookmarks.length === 0) {
      return NextResponse.json({
        message: "No bookmarks to sync",
        synced_count: 0,
      });
    }

    // Prepare normalized bookmarks
    const candidateBookmarks: Array<{
      issueId: string;
      issueNumber: number;
      repoOwner: string;
      repoName: string;
      issueTitle: string | null;
      issueUrl: string | null;
    }> = [];

    for (const bookmark of localBookmarks) {
      const { issue_id, issue_url, issue_title, repository_name } = bookmark;
      if (!issue_id) continue;

      let repoOwner = "", repoName = "", issueNumber = 0;
      const matchHash = issue_id.match(/^([^/]+)\/([^#]+)#(\d+)$/);
      const matchUrl = (issue_url || issue_id).match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);

      if (matchHash) {
        repoOwner = matchHash[1];
        repoName = matchHash[2];
        issueNumber = parseInt(matchHash[3], 10);
      } else if (matchUrl) {
        repoOwner = matchUrl[1];
        repoName = matchUrl[2];
        issueNumber = parseInt(matchUrl[3], 10);
      } else {
        repoOwner = repository_name?.split("/")[0] || "unknown";
        repoName = repository_name?.split("/")[1] || "unknown";
      }

      const standardizedId =
        repoOwner !== "unknown" && repoName !== "unknown" && issueNumber > 0
          ? `${repoOwner}/${repoName}#${issueNumber}`
          : issue_id;

      const safeUrl =
        issue_url && isValidIssueUrl(issue_url)
          ? issue_url
          : issueNumber > 0
          ? `https://github.com/${repoOwner}/${repoName}/issues/${issueNumber}`
          : null;

      candidateBookmarks.push({
        issueId: standardizedId,
        issueNumber,
        repoOwner,
        repoName,
        issueTitle: issue_title || null,
        issueUrl: safeUrl,
      });
    }

    if (candidateBookmarks.length === 0) {
      return NextResponse.json({ message: "No valid bookmarks to sync", synced_count: 0 });
    }

    // Batch query existing bookmarks for this user
    const existingBookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        issueId: { in: candidateBookmarks.map((c) => c.issueId) },
      },
      select: { issueId: true },
    });

    const existingSet = new Set(existingBookmarks.map((e) => e.issueId));
    const toInsert = candidateBookmarks.filter((c) => !existingSet.has(c.issueId));

    // Deduplicate by issueId before inserting
    const uniqueToInsert = Array.from(new Map(toInsert.map((item) => [item.issueId, item])).values());

    if (uniqueToInsert.length > 0) {
      await prisma.bookmark.createMany({
        data: uniqueToInsert.map((item) => ({
          userId,
          issueId: item.issueId,
          issueNumber: item.issueNumber,
          repoOwner: item.repoOwner,
          repoName: item.repoName,
          issueTitle: item.issueTitle,
          issueUrl: item.issueUrl,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      message: `Synced ${uniqueToInsert.length} bookmark(s) to cloud`,
      synced_count: uniqueToInsert.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
