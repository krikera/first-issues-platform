"use client";

import {
  ReloadIcon,
  StarIcon,
  CodeIcon,
  RocketIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse rounded-[6px] bg-surface-2/60 ${className}`} />
);

// Define API response types
interface Repository {
  name: string;
  issue_count: number;
  stars: number;
  language: string;
}

interface RepoStatsResponse {
  total_issues: number;
  top_repositories: Repository[];
  language_distribution: Record<string, number>;
  generated_at: string;
}

interface Recommendation {
  title: string;
  url: string;
  repository: string[];
  labels: string[];
  created_at: string;
  reason: string;
}

interface CacheStats {
  total_cache_entries: number;
  status: string;
  cache_duration_seconds: number;
}

const AnalyticsDashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "repositories" | "recommendations">("overview");
  const [repoStats, setRepoStats] = useState<RepoStatsResponse | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("");

  // Redirect to login only if auth verification finished and user is not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/analytics");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchRepositoryStats = useCallback(
    async (lang: string = "", updateLoading = true, forceRefresh = false) => {
      if (!isAuthenticated) return;

      if (updateLoading) setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (lang) params.set("language", lang);
        if (forceRefresh) params.set("refresh", "true");
        const qs = params.toString();
        const url = `/api/github/issues${qs ? `?${qs}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch repository statistics");
        }
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const issues = data.issues || [];
        const langMap: Record<string, number> = {};
        const repoMap: Record<string, { count: number; stars: number; language: string }> = {};

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        issues.forEach((i: any) => {
          const l = i.language || "Other";
          langMap[l] = (langMap[l] || 0) + 1;
          if (!repoMap[i.repository_name]) {
            repoMap[i.repository_name] = { count: 0, stars: i.stars_count || 0, language: l };
          }
          repoMap[i.repository_name].count += 1;
        });

        const topRepos = Object.entries(repoMap)
          .map(([name, r]) => ({ name, issue_count: r.count, stars: r.stars, language: r.language }))
          .sort((a, b) => b.issue_count - a.issue_count);

        setRepoStats({
          total_issues: issues.length,
          top_repositories: topRepos,
          language_distribution: langMap,
          generated_at: new Date().toISOString(),
        });
      } catch (err: unknown) {
        console.error("Error fetching repository stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch repository statistics.");
      } finally {
        if (updateLoading) setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const fetchRecommendations = useCallback(async (updateLoading = true) => {
    if (!isAuthenticated) return;

    if (updateLoading) setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/github/issues?category=good-first-issue");
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recs = (data.issues || []).slice(0, 5).map((i: any) => ({
        title: i.title,
        url: i.html_url,
        repository: [i.repository_name],
        labels: i.labels || [],
        created_at: i.created_at,
        reason: "good-first-issue",
      }));
      setRecommendations(recs);
    } catch (err: unknown) {
      console.error("Error fetching recommendations:", err);
    } finally {
      if (updateLoading) setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCacheStats = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        const cache = data.services?.cache;
        const memorySize = cache?.memorySize ?? cache?.memory?.size ?? 0;
        setCacheStats({
          total_cache_entries: memorySize,
          status: cache?.memory?.status === "ok" ? "Active" : "Ready",
          cache_duration_seconds: cache?.cacheDuration ?? 300,
        });
      }
    } catch {
      setCacheStats({
        total_cache_entries: 0,
        status: "Unavailable",
        cache_duration_seconds: 300,
      });
    }
  }, []);

  const clearCache = async () => {
    fetchRepositoryStats(language, true, true);
    fetchCacheStats();
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        await Promise.all([
          fetchRepositoryStats("", false),
          fetchRecommendations(false),
          fetchCacheStats(),
        ]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchRepositoryStats, fetchRecommendations, fetchCacheStats]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    fetchRepositoryStats(lang);
  };

  const popularLanguages = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Go",
    "Rust",
    "Java",
  ];

  const prepareLanguageChartData = () => {
    if (!repoStats?.language_distribution) {
      return [];
    }
    return Object.entries(repoStats.language_distribution).slice(0, 10);
  };

  const getColorForLanguage = (lang: string) => {
    const colors: Record<string, string> = {
      JavaScript: "#f7df1e",
      TypeScript: "#3178c6",
      Python: "#3776ab",
      Go: "#00add8",
      Rust: "#dea584",
      Java: "#b07219",
      "C++": "#f34b7d",
      Ruby: "#701516",
      PHP: "#4f5d95",
      Swift: "#ffac45",
      Default: "#5e6ad2",
    };

    return colors[lang] || colors.Default;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-[14px] text-ink-subtle font-mono">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-subtle hover:text-ink transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to Issues
          </Link>
        </div>
        <h1 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-[-0.6px] text-ink">
          Analytics Dashboard
        </h1>
        <p className="text-[14px] text-ink-subtle">
          Insights and distribution across retrieved GitHub open source repositories
        </p>
      </div>

      {error ? (
        <div className="p-4 text-[13px] text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-[8px]">
          <div className="font-semibold mb-0.5">Notice</div>
          <div>{error}</div>
        </div>
      ) : null}

      {/* Linear Tab Bar */}
      <div className="flex items-center">
        <div className="inline-flex p-1 bg-surface-1 border border-hairline rounded-[8px] gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer ${activeTab === "overview"
                ? "bg-surface-2 text-ink border border-hairline font-semibold"
                : "text-ink-subtle hover:text-ink border border-transparent"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("repositories")}
            className={`px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer ${activeTab === "repositories"
                ? "bg-surface-2 text-ink border border-hairline font-semibold"
                : "text-ink-subtle hover:text-ink border border-transparent"
              }`}
          >
            Repositories
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-3.5 py-1.5 rounded-[6px] text-[13px] font-medium transition-all cursor-pointer ${activeTab === "recommendations"
                ? "bg-surface-2 text-ink border border-hairline font-semibold"
                : "text-ink-subtle hover:text-ink border border-transparent"
              }`}
          >
            Sample Issues
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Issues */}
            <div className="linear-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.4px] text-ink-subtle">
                  Total Issues
                </span>
                <RocketIcon className="h-4 w-4 text-ink-tertiary" />
              </div>
              <div className="mt-3">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="font-display text-[28px] font-semibold text-ink tracking-[-0.5px]">
                    {repoStats?.total_issues || 0}
                  </div>
                )}
                <p className="text-[12px] text-ink-subtle mt-1">
                  Good first issues retrieved
                </p>
              </div>
            </div>

            {/* Top Languages */}
            <div className="linear-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.4px] text-ink-subtle">
                  Top Languages
                </span>
                <CodeIcon className="h-4 w-4 text-ink-tertiary" />
              </div>
              <div className="mt-3">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {repoStats?.language_distribution
                      ? Object.keys(repoStats.language_distribution)
                        .slice(0, 3)
                        .map((lang) => (
                          <span
                            key={lang}
                            className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] bg-surface-2 border border-hairline text-ink-muted"
                          >
                            {lang}
                          </span>
                        ))
                      : null}
                  </div>
                )}
                <p className="text-[12px] text-ink-subtle mt-1">
                  Most common languages
                </p>
              </div>
            </div>

            {/* Sample Issues */}
            <div className="linear-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.4px] text-ink-subtle">
                  Sample Issues
                </span>
                <StarIcon className="h-4 w-4 text-ink-tertiary" />
              </div>
              <div className="mt-3">
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="font-display text-[28px] font-semibold text-ink tracking-[-0.5px]">
                    {recommendations.length}
                  </div>
                )}
                <p className="text-[12px] text-ink-subtle mt-1">
                  Sample good first issues from the feed
                </p>
              </div>
            </div>

            {/* Cache Status */}
            <div className="linear-card p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.4px] text-ink-subtle">
                  Cache Status
                </span>
                <button
                  onClick={clearCache}
                  className="h-6 w-6 inline-flex items-center justify-center rounded-[4px] text-ink-tertiary hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
                  title="Refresh cache"
                >
                  <ReloadIcon className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-3">
                {cacheStats ? (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[12px] text-ink-subtle">Status</span>
                      <span className="font-mono text-[13px] font-medium text-semantic-success">
                        {cacheStats.status}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-[12px] text-ink-subtle">Cached Queries</span>
                      <span className="font-mono text-[12px] text-ink-muted">
                        {cacheStats.total_cache_entries} (TTL: {cacheStats.cache_duration_seconds}s)
                      </span>
                    </div>
                  </>
                ) : (
                  <Skeleton className="h-8 w-full" />
                )}
                <p className="text-[12px] text-ink-subtle mt-1">
                  In-memory server cache
                </p>
              </div>
            </div>
          </div>

          {/* Charts & Filter Grid */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Language Distribution */}
            <div className="linear-card p-6 lg:col-span-4 relative overflow-hidden space-y-4">
              <div>
                <h3 className="font-display text-[17px] font-semibold text-ink tracking-[-0.2px]">
                  Language Distribution
                </h3>
                <p className="text-[13px] text-ink-subtle">
                  Distribution of available good first issues by primary language
                </p>
              </div>

              {loading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : repoStats?.language_distribution ? (
                <div className="h-[280px] overflow-y-auto pr-1 space-y-3">
                  {prepareLanguageChartData().map(([lang, count]) => {
                    const color = getColorForLanguage(lang);
                    const pct = repoStats.total_issues > 0
                      ? ((count / repoStats.total_issues) * 100).toFixed(1)
                      : "0";
                    return (
                      <div key={lang} className="space-y-1">
                        <div className="flex justify-between items-center text-[13px]">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-ink font-medium">{lang}</span>
                          </div>
                          <span className="font-mono text-[12px] text-ink-subtle">
                            {count} issues ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-surface-3 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[240px] text-ink-subtle text-[13px]">
                  No language distribution data available
                </div>
              )}
            </div>

            {/* Filter by Language */}
            <div className="linear-card p-6 lg:col-span-3 relative overflow-hidden space-y-4">
              <div>
                <h3 className="font-display text-[17px] font-semibold text-ink tracking-[-0.2px]">
                  Filter by Language
                </h3>
                <p className="text-[13px] text-ink-subtle">
                  Filter statistics by programming language
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLanguageChange("")}
                  className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-colors cursor-pointer ${language === ""
                      ? "bg-surface-3 text-ink border border-primary/40 font-medium"
                      : "bg-surface-1 hover:bg-surface-2 text-ink-subtle hover:text-ink border border-hairline"
                    }`}
                >
                  All
                </button>
                {popularLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1.5 rounded-[6px] text-[12px] font-mono transition-colors cursor-pointer ${language === lang
                        ? "bg-surface-3 text-ink border border-primary/40 font-medium"
                        : "bg-surface-1 hover:bg-surface-2 text-ink-subtle hover:text-ink border border-hairline"
                      }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repositories Tab */}
      {activeTab === "repositories" && (
        <div className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="linear-card p-5 space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
            </div>
          ) : repoStats?.top_repositories && repoStats.top_repositories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {repoStats.top_repositories.map((repo, index) => (
                <div key={index} className="linear-card p-5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <a
                      href={`https://github.com/${repo.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[14px] font-medium text-ink hover:text-primary transition-colors"
                    >
                      {repo.name}
                    </a>
                    <span
                      className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] border border-hairline"
                      style={{
                        backgroundColor: getColorForLanguage(repo.language) + "15",
                        color: getColorForLanguage(repo.language),
                      }}
                    >
                      {repo.language}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hairline text-[13px]">
                    <div>
                      <span className="text-[11px] font-mono uppercase text-ink-subtle block">
                        Open Issues
                      </span>
                      <span className="font-mono font-medium text-ink">
                        {repo.issue_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase text-ink-subtle block">
                        Stars
                      </span>
                      <div className="inline-flex items-center gap-1 font-mono font-medium text-ink">
                        <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                        {repo.stars.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="linear-card p-8 text-center">
              <p className="text-[14px] text-ink-subtle">No repository data available.</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="linear-card p-5 space-y-3">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="linear-card p-5 space-y-2.5 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[15px] text-ink hover:text-primary transition-colors line-clamp-1"
                    >
                      {rec.title}
                    </a>
                    <span className="font-mono text-[11px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-[4px] flex-shrink-0 self-start">
                      {rec.reason}
                    </span>
                  </div>

                  <p className="font-mono text-[12px] text-ink-subtle">
                    {typeof rec.repository === "string"
                      ? rec.repository
                      : rec.repository?.join("/")}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {rec.labels.map((label) => (
                      <span
                        key={label}
                        className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] bg-surface-2 border border-hairline text-ink-muted"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-hairline text-[11px] font-mono text-ink-subtle">
                    {rec.created_at && !isNaN(new Date(rec.created_at).getTime())
                      ? `Created on ${new Date(rec.created_at).toISOString().split("T")[0]}`
                      : "Recently created"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="linear-card p-8 text-center space-y-4">
              <p className="text-[14px] text-ink-subtle">No sample issues currently available.</p>
              <Button
                variant="outline"
                onClick={() => fetchRecommendations(true)}
                className="gap-2 text-[13px] h-9 cursor-pointer"
              >
                <ReloadIcon className="h-3.5 w-3.5" />
                Refresh Sample Issues
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
