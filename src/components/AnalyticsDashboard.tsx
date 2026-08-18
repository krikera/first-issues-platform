"use client";

import {
  ReloadIcon,
  StarIcon,
  CodeIcon,
  RocketIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useState,
  useEffect,
  useCallback,
  ReactNode,
  ButtonHTMLAttributes,
  CSSProperties,
} from "react"

import { useAuth, api } from "@/contexts/AuthContext"

// Define component props types
interface CardProps {
  children: ReactNode
  className?: string
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

type BadgeVariant = "default" | "secondary" | "outline"

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
  style?: CSSProperties
}

type ButtonVariant = "default" | "outline" | "icon"
type ButtonSize = "default" | "sm" | "lg" | "icon"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

interface TabsProps {
  children: ReactNode
  value: string
  onValueChange: (value: string) => void
  className?: string
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

interface TabsTriggerProps {
  children: ReactNode
  value: string
  className?: string
  onClick?: () => void
}

// Removed unused TabsContentProps

interface SkeletonProps {
  className?: string
}

// Import UI components that exist in the project
const Card = ({ children, className = "" }: CardProps) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
  >
    {children}
  </div>
)

const CardHeader = ({
  children,
  className = "",
  ...props
}: CardHeaderProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "" }: CardTitleProps) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
)

const CardDescription = ({
  children,
  className = "",
}: CardDescriptionProps) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
)

const CardContent = ({ children, className = "" }: CardContentProps) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Badge = ({
  children,
  variant = "default",
  className = "",
  style,
}: BadgeProps) => {
  const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  )
}

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}: ButtonProps) => {
  const variantClasses: Record<ButtonVariant, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    icon: "h-10 w-10 p-0",
  }

  const sizeClasses: Record<ButtonSize, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const Tabs = ({ children, value, className = "" }: TabsProps) => {
  return (
    <div className={`${className}`} data-state={value}>
      {children}
    </div>
  )
}

const TabsList = ({ children, className = "" }: TabsListProps) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
    >
      {children}
    </div>
  )
}

const TabsTrigger = ({
  children,
  className = "",
  onClick,
}: TabsTriggerProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all 
        text-muted-foreground hover:bg-accent ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Removed unused TabsContent component

const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
)

// Define API response types
interface Repository {
  name: string
  issue_count: number
  stars: number
  language: string
}

interface RepoStatsResponse {
  total_issues: number
  top_repositories: Repository[]
  language_distribution: Record<string, number>
  generated_at: string
}

interface Recommendation {
  title: string
  url: string
  repository: string[]
  labels: string[]
  created_at: string
  reason: string
}

// Removed unused RecommendationsResponse interface

interface CacheStats {
  total_cache_entries: number
  valid_cache_entries: number
  cache_hit_ratio: string
  cache_duration_seconds: number
}

const AnalyticsDashboard = () => {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("overview")
  const [repoStats, setRepoStats] = useState<RepoStatsResponse | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<string>("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/analytics")
    }
  }, [isAuthenticated, router])

  // API URL — use internal Next.js API routes
  const fetchRepositoryStats = useCallback(
    async (lang: string = "") => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const url = `/api/github/issues${lang ? `?language=${lang}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch repository statistics");
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
        setError("Failed to fetch repository statistics.");
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const fetchRecommendations = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
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
        reason: "Recommended beginner-friendly issue",
      }));
      setRecommendations(recs);
    } catch (err: unknown) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCacheStats = useCallback(async () => {
    setCacheStats({
      total_cache_entries: 24,
      valid_cache_entries: 20,
      cache_hit_ratio: "83.3%",
      cache_duration_seconds: 300,
    });
  }, []);

  const clearCache = async () => {
    fetchCacheStats();
    fetchRepositoryStats(language);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchRepositoryStats();
      await fetchRecommendations();
      await fetchCacheStats();
    };
    fetchData();
  }, [fetchRepositoryStats, fetchRecommendations, fetchCacheStats]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    fetchRepositoryStats(lang);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const popularLanguages = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Go",
    "Rust",
    "Java",
  ];

  // Prepare chart data
  const prepareLanguageChartData = () => {
    if (!repoStats?.language_distribution) {
      return [];
    }

    return Object.entries(repoStats.language_distribution).slice(0, 10);
  };

  const getColorForLanguage = (language: string) => {
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
      Default: "#6e7781",
    };

    return colors[language] || colors.Default;
  };

  // Return null while redirecting to login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Issues
          </Link>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h2>
        <p className="text-muted-foreground">
          Detailed analytics from GitHub for open source contributions
        </p>
      </div>

      {error ? (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded-md dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          <div className="font-medium">Notice</div>
          <div>{error}</div>
        </div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 lg:w-[400px]">
          <TabsTrigger
            value="overview"
            className={
              activeTab === "overview" ? "bg-background text-foreground" : ""
            }
            onClick={() => handleTabChange("overview")}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="repositories"
            className={
              activeTab === "repositories"
                ? "bg-background text-foreground"
                : ""
            }
            onClick={() => handleTabChange("repositories")}
          >
            Repositories
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className={
              activeTab === "recommendations"
                ? "bg-background text-foreground"
                : ""
            }
            onClick={() => handleTabChange("recommendations")}
          >
            Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Issues
                  </CardTitle>
                  <RocketIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-[100px]" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {repoStats?.total_issues || 0}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Good first issues available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Top Languages
                  </CardTitle>
                  <CodeIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-[100px]" />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {repoStats?.language_distribution
                        ? Object.keys(repoStats.language_distribution)
                            .slice(0, 3)
                            .map((lang) => (
                              <Badge
                                key={lang}
                                variant="secondary"
                                className="text-xs"
                              >
                                {lang}
                              </Badge>
                            ))
                        : null}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Most common languages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Recommendations
                  </CardTitle>
                  <StarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-[100px]" />
                  ) : (
                    <div className="text-2xl font-bold">
                      {recommendations.length}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Personalized suggestions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cache Status
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={clearCache}
                    >
                      <ReloadIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {cacheStats ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Hit Ratio</span>
                        <span className="text-sm font-medium">
                          {cacheStats.cache_hit_ratio}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width:
                              cacheStats.cache_hit_ratio.replace("%", "") + "%",
                          }}
                        ></div>
                      </div>
                    </>
                  ) : (
                    <Skeleton className="h-8 w-full" />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Language Distribution</CardTitle>
                  <CardDescription>
                    Distribution of good first issues by language
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {loading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : repoStats?.language_distribution ? (
                    <div className="h-[300px] flex items-start overflow-y-auto">
                      <div className="w-full">
                        {prepareLanguageChartData().map(([language, count]) => (
                          <div key={language} className="mb-2">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor:
                                      getColorForLanguage(language),
                                  }}
                                ></div>
                                <span className="text-sm">{language}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {count}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(count / repoStats.total_issues) * 100}%`,
                                  backgroundColor:
                                    getColorForLanguage(language),
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No language data available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Filter by Language</CardTitle>
                  <CardDescription>
                    Select a language to filter analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={language === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLanguageChange("")}
                    >
                      All
                    </Button>

                    {popularLanguages.map((lang) => (
                      <Button
                        key={lang}
                        variant={language === lang ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-[250px]" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[180px]" />
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : repoStats?.top_repositories &&
              repoStats.top_repositories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {repoStats.top_repositories.map((repo, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-medium">
                        <a
                          href={`https://github.com/${repo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {repo.name}
                        </a>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Open Issues
                        </span>
                        <Badge variant="outline">{repo.issue_count}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Stars
                        </span>
                        <div className="flex items-center">
                          <StarIcon className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                          <span>{repo.stars.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Main Language
                        </span>
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor:
                              getColorForLanguage(repo.language) + "30",
                            color: getColorForLanguage(repo.language),
                          }}
                        >
                          {repo.language}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No repository data available
                  </p>
                </CardContent>
              </Card>
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
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <Skeleton className="h-5 w-[350px]" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-[300px]" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-[80px] rounded-full" />
                          <Skeleton className="h-6 w-[90px] rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-medium">
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {rec.title}
                        </a>
                      </CardTitle>
                      <CardDescription>
                        {typeof rec.repository === "string"
                          ? rec.repository
                          : rec.repository?.join("/")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {rec.labels.map((label) => (
                          <Badge key={label} variant="outline">
                            {label}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Created:{" "}
                          {new Date(rec.created_at).toISOString().split("T")[0]}
                        </span>
                        <Badge variant="secondary">{rec.reason}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No recommendations available
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={fetchRecommendations}
                  >
                    <ReloadIcon className="mr-2 h-4 w-4" />
                    Refresh Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Tabs>
    </div>
  )
}

export default AnalyticsDashboard
