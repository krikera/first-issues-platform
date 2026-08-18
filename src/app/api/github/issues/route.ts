import { NextResponse, type NextRequest } from "next/server";
import { fetchGitHubIssues, fetchGitHubIssuesByCategory, fetchGitHubIssuesByFramework } from "@/lib/github";
import { handleApiError } from "@/lib/error-handler";
import type { FilterParams } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: FilterParams = {
      service: "github",
      minStars: parseInt(searchParams.get("minStars") || "0", 10),
      maxStars: parseInt(searchParams.get("maxStars") || "1000000", 10),
      minForks: parseInt(searchParams.get("minForks") || "0", 10),
      language: searchParams.get("language") || "",
      isAssigned: searchParams.get("isAssigned") === "true",
      cursor: searchParams.get("cursor") || null,
      category: searchParams.get("category") || "all",
      framework: searchParams.get("framework") || "",
      hasPullRequests: searchParams.get("hasPullRequests") === "true",
      searchQuery: searchParams.get("searchQuery") || "",
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    let result;

    if (params.framework) {
      result = await fetchGitHubIssuesByFramework(params);
    } else if (params.category && params.category !== "all") {
      result = await fetchGitHubIssuesByCategory(params);
    } else {
      result = await fetchGitHubIssues(params);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
