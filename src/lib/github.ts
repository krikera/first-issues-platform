import { graphql } from "@octokit/graphql";
import type { Issue, FilterParams } from "@/types";
import { ExternalServiceError } from "@/lib/error-handler";

const GITHUB_TOKEN = process.env.GITHUB_API_KEY || "";
const ISSUES_PER_PAGE = 30;
const REPOS_PER_PAGE = 10;
const ISSUES_PER_REPO = 5;

const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== "string") return "";
  return query
    .replace(/[{}]/g, "")
    .replace(/\$\w+/g, "")
    .replace(/\.\.\./g, "")
    .slice(0, 200)
    .trim();
};

const validateNumericParam = (
  value: number,
  min: number = 0,
  max: number = 10000000
): number => {
  if (isNaN(value) || value < min || value > max) return min;
  return value;
};

interface GitHubIssue {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  labels: { nodes: Array<{ name: string }> };
  assignees: { totalCount: number };
  comments: { totalCount: number };
  timelineItems: {
    totalCount: number;
    nodes: Array<{ source?: { state: string } }>;
  };
  repository: {
    nameWithOwner: string;
    url: string;
    stargazerCount: number;
    forkCount: number;
    primaryLanguage?: { name: string };
    licenseInfo?: {
      key: string;
      name: string;
      spdxId: string;
      url: string;
      node_id: string;
    };
  };
}

interface GitHubSearchResponse {
  search: {
    nodes: GitHubIssue[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

interface GitHubRepositoryWithIssues {
  url: string;
  nameWithOwner: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage?: { name: string };
  licenseInfo?: {
    key: string;
    name: string;
    spdxId: string;
    url: string;
    node_id: string;
  };
  issues: { nodes: GitHubIssue[] };
}

interface GitHubRepositorySearchResponse {
  search: {
    nodes: GitHubRepositoryWithIssues[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    ...(GITHUB_TOKEN ? { authorization: `token ${GITHUB_TOKEN}` } : {}),
  },
});

async function executeGraphQLWithTimeout<T>(
  query: string,
  variables: Record<string, unknown>,
  timeoutMs = 30000,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await Promise.race([
        graphqlWithAuth<T>(query, variables),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
        ),
      ]);
      return response;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const isBadCredentials =
        message.toLowerCase().includes("bad credentials") ||
        (typeof error === "object" &&
          error !== null &&
          "status" in error &&
          (error as { status?: number }).status === 401);

      if (isBadCredentials) {
        throw new ExternalServiceError(
          "Invalid or expired GITHUB_API_KEY. Please configure a valid GitHub Personal Access Token in environment variables."
        );
      }

      console.warn(`GitHub API attempt ${attempt}/${maxRetries} failed:`, message);
      if (attempt === maxRetries) {
        if (message.includes("timeout")) {
          throw new ExternalServiceError("GitHub API is currently unavailable. Please try again later.");
        }
        throw new ExternalServiceError(message);
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  throw new ExternalServiceError("Maximum retries exceeded");
}

export async function fetchGitHubIssues(params: FilterParams) {
  const sanitizedParams = {
    ...params,
    minStars: validateNumericParam(Number(params.minStars), 0, 10000000),
    maxStars: validateNumericParam(Number(params.maxStars), 0, 10000000),
    minForks: validateNumericParam(Number(params.minForks), 0, 1000000),
    searchQuery: sanitizeSearchQuery(params.searchQuery || ""),
    language: sanitizeSearchQuery(params.language || ""),
  };

  const query = `
    query($queryString: String!, $cursor: String) {
      search(query: $queryString, type: ISSUE, first: ${ISSUES_PER_PAGE}, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          ... on Issue {
            title url createdAt updatedAt
            repository {
              nameWithOwner url stargazerCount
              licenseInfo { name }
              forkCount
              primaryLanguage { name }
            }
            assignees(first: 1) { totalCount }
            labels(first: 10) { nodes { name } }
            comments { totalCount }
            timelineItems(first: 1, itemTypes: [CROSS_REFERENCED_EVENT]) {
              totalCount
              nodes {
                ... on CrossReferencedEvent {
                  source { ... on PullRequest { state } }
                }
              }
            }
          }
        }
      }
    }
  `;

  let queryString = 'is:open is:issue label:"good first issue" archived:false';
  if (sanitizedParams.language) {
    const languages = sanitizedParams.language
      .split(" ")
      .filter((lang: string) => lang && /^[a-zA-Z0-9\-+#]{1,50}$/.test(lang));
    if (languages.length > 0) {
      queryString += ` ${languages.map((lang: string) => `language:${lang}`).join(" ")}`;
    }
  }
  if (params.isAssigned) queryString += " assigned:*";
  else queryString += " no:assignee";
  if (params.hasPullRequests) queryString += " linked:pr";
  else queryString += " -linked:pr";

  if (params.dateFrom?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(params.dateFrom)) {
    if (params.dateTo?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(params.dateTo)) {
      queryString += ` created:${params.dateFrom}..${params.dateTo}`;
    } else {
      queryString += ` created:>=${params.dateFrom}`;
    }
  } else if (params.dateTo?.trim() && /^\d{4}-\d{2}-\d{2}$/.test(params.dateTo)) {
    queryString += ` created:<=${params.dateTo}`;
  }

  if (sanitizedParams.searchQuery) {
    queryString += ` ${sanitizedParams.searchQuery} in:title,body`;
  }
  queryString += " sort:created-desc";

  const variables = { queryString, cursor: params.cursor };

  try {
    const response = await executeGraphQLWithTimeout<GitHubSearchResponse>(query, variables);

    const issues: Issue[] = response.search.nodes
      .filter((issue: GitHubIssue) => {
        const hasLicense = Boolean(issue.repository.licenseInfo);
        const stars = issue.repository.stargazerCount;
        const forks = issue.repository.forkCount;
        return (
          stars >= sanitizedParams.minStars &&
          stars <= sanitizedParams.maxStars &&
          forks >= sanitizedParams.minForks &&
          hasLicense
        );
      })
      .map((issue: GitHubIssue) => ({
        id: issue.url,
        title: issue.title,
        html_url: issue.url,
        created_at: issue.createdAt,
        updated_at: issue.updatedAt,
        repository_url: issue.repository.url,
        repository_name: issue.repository.nameWithOwner,
        license: issue.repository.licenseInfo
          ? {
              key: issue.repository.licenseInfo.key,
              name: issue.repository.licenseInfo.name,
              spdx_id: issue.repository.licenseInfo.spdxId,
              url: issue.repository.licenseInfo.url,
              node_id: issue.repository.licenseInfo.node_id,
            }
          : null,
        stars_count: issue.repository.stargazerCount,
        fork_count: issue.repository.forkCount,
        language: issue.repository.primaryLanguage?.name || null,
        is_assigned: issue.assignees.totalCount > 0,
        labels: issue.labels.nodes.map((label) => label.name),
        comments_count: issue.comments.totalCount,
        has_pull_requests: issue.timelineItems.totalCount > 0,
        pr_status:
          issue.timelineItems.totalCount > 0
            ? issue.timelineItems.nodes[0]?.source?.state || null
            : null,
      }));

    const filteredIssues = issues.filter((issue) => {
      if (!params.hasPullRequests) return !issue.has_pull_requests;
      return (
        issue.has_pull_requests &&
        (issue.pr_status === "OPEN" ||
          issue.pr_status === "DRAFT" ||
          issue.pr_status === "CLOSED" ||
          issue.pr_status === null)
      );
    });

    const sortedIssues = filteredIssues.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      issues: sortedIssues,
      hasNextPage: response.search.pageInfo.hasNextPage,
      endCursor: response.search.pageInfo.endCursor,
    };
  } catch (error) {
    console.error("Error fetching GitHub issues:", error);
    throw error;
  }
}

// Helper for Repository search (combines category and framework logic)
async function fetchGitHubIssuesByRepositoryQuery(
  params: FilterParams,
  buildQueryString: () => string
) {
  const query = `query($queryString: String!, $cursor: String) {
    search(query: $queryString, type: REPOSITORY, first: ${REPOS_PER_PAGE}, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        ... on Repository {
          nameWithOwner url stargazerCount forkCount
          licenseInfo { name }
          primaryLanguage { name }
          issues(labels: ["good first issue"], states: OPEN, first: ${ISSUES_PER_REPO}, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title url createdAt
              assignees(first: 1) { totalCount }
              labels(first: 10) { nodes { name } }
              comments { totalCount }
            }
          }
        }
      }
    }
  }`;

  const queryString = buildQueryString();

  try {
    const response = await executeGraphQLWithTimeout<GitHubRepositorySearchResponse>(query, {
      queryString,
      cursor: params.cursor,
    });

    const issues: Issue[] = response.search.nodes
      .flatMap((repo) =>
        repo.issues.nodes.map((issue) => ({
          id: issue.url,
          title: issue.title,
          html_url: issue.url,
          created_at: issue.createdAt,
          updated_at: issue.createdAt, // fallback to creation date
          repository_url: repo.url,
          repository_name: repo.nameWithOwner,
          license: repo.licenseInfo
            ? { key: "", name: repo.licenseInfo.name, spdx_id: "", url: "", node_id: "" }
            : null,
          stars_count: repo.stargazerCount,
          fork_count: repo.forkCount,
          language: repo.primaryLanguage?.name || null,
          is_assigned: issue.assignees.totalCount > 0,
          labels: issue.labels.nodes.map((l) => l.name),
          comments_count: issue.comments.totalCount,
          has_pull_requests: false,
          pr_status: null,
        }))
      )
      .filter((issue) => Boolean(issue.license));

    if (issues.length === 0 && response.search.pageInfo.hasNextPage) {
      // Recurse to next page if current page yielded 0 issues after filtering
      return fetchGitHubIssuesByRepositoryQuery(
        { ...params, cursor: response.search.pageInfo.endCursor },
        buildQueryString
      );
    }

    return {
      issues,
      hasNextPage: response.search.pageInfo.hasNextPage,
      endCursor: response.search.pageInfo.endCursor,
    };
  } catch (error) {
    console.error("Error fetching GitHub issues by repository:", error);
    throw error;
  }
}

export async function fetchGitHubIssuesByCategory(params: FilterParams) {
  return fetchGitHubIssuesByRepositoryQuery(params, () => {
    let queryString = "is:public archived:false";
    if (params.language) {
      queryString += ` ${params.language.split(" ").map((lang) => `language:${lang}`).join(" ")}`;
    }
    queryString += ` stars:${params.minStars}..${params.maxStars}`;
    queryString += ` forks:>=${params.minForks}`;

    if (params.category && params.category !== "all") {
      const categoryMap: Record<string, string> = {
        "web-dev": "web",
        "mobile-dev": "mobile",
        "data-science": "data-science",
        "machine-learning": "machine-learning",
        devops: "devops",
        cybersecurity: "security",
        documentation: "documentation",
      };
      const topic = categoryMap[params.category];
      if (topic) queryString += ` topic:${topic}`;
    }

    if (params.searchQuery) queryString += ` ${params.searchQuery} in:name,description`;
    return queryString;
  });
}

export async function fetchGitHubIssuesByFramework(params: FilterParams) {
  return fetchGitHubIssuesByRepositoryQuery(params, () => {
    let queryString = `topic:${params.framework} is:public archived:false`;
    if (params.language) {
      queryString += ` ${params.language.split(" ").map((lang) => `language:${lang}`).join(" ")}`;
    }
    queryString += ` stars:${params.minStars}..${params.maxStars}`;
    queryString += ` forks:>=${params.minForks}`;
    if (params.searchQuery) queryString += ` ${params.searchQuery} in:name,description`;
    return queryString;
  });
}
