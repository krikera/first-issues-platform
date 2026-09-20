import { NextResponse, type NextRequest } from "next/server";
import { fetchGitHubIssues, fetchGitHubIssuesByCategory, fetchGitHubIssuesByFramework } from "@/lib/github";
import { handleApiError } from "@/lib/error-handler";
import { cacheService } from "@/lib/cache";
import { isRateLimited, getClientIp } from "@/lib/rate-limiter";
import type { FilterParams } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Limit general searches to 60 requests per minute per IP
    if (isRateLimited(`github_search:${ip}`, 60, 60)) {
      return NextResponse.json(
        { error: "Too many search requests. Please slow down and try again shortly." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);

    const parseNum = (val: string | null, def: number): number => {
      if (!val) return def;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? def : parsed;
    };

    const refreshParam = searchParams.get("refresh");
    const isRefresh = Boolean(refreshParam && refreshParam !== "false" && refreshParam !== "0");
    let shouldBypassCache = isRefresh;

    // Throttle forced cache-busting to 6 requests per minute per IP to protect GitHub PAT quota
    if (isRefresh && isRateLimited(`github_refresh:${ip}`, 6, 60)) {
      shouldBypassCache = false;
    }

    const params: FilterParams = {
      service: "github",
      minStars: parseNum(searchParams.get("minStars"), 0),
      maxStars: parseNum(searchParams.get("maxStars"), 1000000),
      minForks: parseNum(searchParams.get("minForks"), 0),
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

    const cacheKeyParams: Record<string, unknown> = {
      minStars: params.minStars,
      maxStars: params.maxStars,
      minForks: params.minForks,
      language: params.language,
      isAssigned: params.isAssigned,
      cursor: params.cursor,
      category: params.category,
      framework: params.framework,
      hasPullRequests: params.hasPullRequests,
      searchQuery: params.searchQuery,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    };

    if (!shouldBypassCache) {
      const cached = cacheService.get("github_issues", cacheKeyParams);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    let result;

    if (params.framework) {
      result = await fetchGitHubIssuesByFramework(params);
    } else if (params.category && params.category !== "all") {
      result = await fetchGitHubIssuesByCategory(params);
    } else {
      result = await fetchGitHubIssues(params);
    }

    if (result && result.issues) {
      cacheService.set("github_issues", result, cacheKeyParams);
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
