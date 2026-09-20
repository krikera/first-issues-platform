"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useAuth, api } from "@/contexts/AuthContext";

const STORAGE_KEY = "first-issues-bookmarks";

export interface BookmarkData {
  issue_id: string;
  issue_url: string;
  issue_title: string;
  repository_name: string;
  issue_number?: number;
  issue_state?: string;
  labels?: string[];
  stars_count?: number;
  language?: string | null;
  created_at?: string;
  notes?: string;
  tags?: string[];
}

export interface CloudBookmark {
  id: number;
  issue_id: string;
  issue_number: number;
  repo_owner: string;
  repo_name: string;
  issue_title: string | null;
  issue_state: string | null;
  issue_url: string | null;
  issue_labels: unknown;
  notes: string | null;
  tags: unknown;
  created_at: string;
}

interface BookmarkContextType {
  bookmarks: string[];
  cloudBookmarks: CloudBookmark[];
  localBookmarks: BookmarkData[];
  isLoading: boolean;
  isSyncing: boolean;
  toggleBookmark: (issueId: string, issueData?: BookmarkData) => Promise<void>;
  isBookmarked: (issueId: string) => boolean;
  refreshBookmarks: () => Promise<void>;
}

const BookmarkContext = createContext<BookmarkContextType>({
  bookmarks: [],
  cloudBookmarks: [],
  localBookmarks: [],
  isLoading: true,
  isSyncing: false,
  toggleBookmark: async () => {},
  isBookmarked: () => false,
  refreshBookmarks: async () => {},
});

export const sanitizeId = (issueId: string): string => {
  if (typeof issueId !== "string") return "";
  let sanitized = issueId.replace(/[<>'"&]/g, "").trim();
  if (sanitized.includes("github.com") && sanitized.includes("/issues/")) {
    sanitized = sanitized
      .replace(/^https?:\/\/github\.com\//, "")
      .replace("/issues/", "#");
  }
  return sanitized;
};

export const formatIssueUrl = (issueId: string, url?: string | null): string => {
  if (url && url.startsWith("http")) return url;
  const clean = sanitizeId(issueId);
  if (clean.startsWith("http")) return clean;
  return `https://github.com/${clean.replace("#", "/issues/")}`;
};

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [cloudBookmarks, setCloudBookmarks] = useState<CloudBookmark[]>([]);
  const [localBookmarks, setLocalBookmarks] = useState<BookmarkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSyncedRef = useRef(false);

  // Helper to read localStorage safely
  const readLocalStorage = useCallback((): BookmarkData[] => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (typeof item === "string") {
            const clean = sanitizeId(item);
            return {
              issue_id: clean,
              issue_url: formatIssueUrl(clean),
              issue_title: "Bookmarked Issue",
              repository_name: clean.split("#")[0] || "unknown",
            };
          }
          return {
            ...item,
            issue_id: sanitizeId(item.issue_id || ""),
          };
        });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    return [];
  }, []);

  const saveLocalStorage = useCallback((items: BookmarkData[]) => {
    if (typeof window === "undefined") return;
    try {
      if (items.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error saving local bookmarks:", e);
    }
  }, []);

  // Fetch bookmarks from API
  const refreshBookmarks = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get("/api/bookmarks");
        const cloudData: CloudBookmark[] = response.data.bookmarks || [];
        setCloudBookmarks(cloudData);
        setBookmarks(cloudData.map((b) => sanitizeId(b.issue_id)));
      } catch (error) {
        console.error("Failed to load bookmarks from API:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      const local = readLocalStorage();
      setLocalBookmarks(local);
      setBookmarks(local.map((b) => sanitizeId(b.issue_id)));
      setIsLoading(false);
    }
  }, [isAuthenticated, readLocalStorage]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    refreshBookmarks();
  }, [refreshBookmarks]);

  // Cloud sync for unauthenticated -> authenticated transition
  useEffect(() => {
    const syncUnsavedLocalToCloud = async () => {
      if (!isAuthenticated || hasSyncedRef.current) return;

      const local = readLocalStorage();
      if (local.length === 0) return;

      hasSyncedRef.current = true;
      setIsSyncing(true);

      try {
        // Sync to cloud
        await api.post("/api/bookmarks/sync", { local_bookmarks: local });
        await refreshBookmarks();
        // Clear local storage after successful sync and refresh
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
        setLocalBookmarks([]);
        toast.success(`Synced ${local.length} local bookmark(s) to cloud`);
      } catch (err) {
        console.error("Bookmark sync error:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    if (isAuthenticated) {
      syncUnsavedLocalToCloud();
    } else {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated, readLocalStorage, refreshBookmarks]);

  const toggleBookmark = useCallback(
    async (issueId: string, issueData?: BookmarkData) => {
      const cleanId = sanitizeId(issueId);
      if (!cleanId) return;

      const currentlyBookmarked = bookmarks.includes(cleanId);

      if (isAuthenticated) {
        // Optimistic update
        if (currentlyBookmarked) {
          const target = cloudBookmarks.find((b) => sanitizeId(b.issue_id) === cleanId);
          setBookmarks((prev) => prev.filter((id) => id !== cleanId));
          setCloudBookmarks((prev) => prev.filter((b) => sanitizeId(b.issue_id) !== cleanId));

          try {
            if (target) {
              await api.delete(`/api/bookmarks/${target.id}`);
            } else {
              // Fallback query delete
              const res = await api.get("/api/bookmarks");
              const fresh: CloudBookmark[] = res.data.bookmarks || [];
              const match = fresh.find((b) => sanitizeId(b.issue_id) === cleanId);
              if (match) await api.delete(`/api/bookmarks/${match.id}`);
            }
            toast.success("Bookmark removed");
          } catch (err) {
            console.error("Failed to remove bookmark:", err);
            toast.error("Failed to remove bookmark");
            await refreshBookmarks();
          }
        } else {
          setBookmarks((prev) => [...prev, cleanId]);

          const payload = {
            issue_id: cleanId,
            issue_url: formatIssueUrl(cleanId, issueData?.issue_url),
            issue_title: issueData?.issue_title || "Bookmarked Issue",
            repository_name: issueData?.repository_name || cleanId.split("#")[0] || "unknown",
            notes: issueData?.notes || null,
            tags: issueData?.tags || [],
          };

          try {
            const res = await api.post("/api/bookmarks", payload);
            if (res.data?.bookmark) {
              setCloudBookmarks((prev) => [...prev, res.data.bookmark]);
            }
            toast.success("Bookmark saved to cloud");
          } catch (err) {
            console.error("Failed to save bookmark:", err);
            toast.error("Failed to save bookmark");
            await refreshBookmarks();
          }
        }
      } else {
        // LocalStorage flow
        let updated: BookmarkData[];
        if (currentlyBookmarked) {
          updated = localBookmarks.filter((b) => sanitizeId(b.issue_id) !== cleanId);
          toast.success("Bookmark removed");
        } else {
          const newEntry: BookmarkData = issueData || {
            issue_id: cleanId,
            issue_url: formatIssueUrl(cleanId),
            issue_title: "Bookmarked Issue",
            repository_name: cleanId.split("#")[0] || "unknown",
          };
          updated = [...localBookmarks, newEntry];
          toast.success("Bookmark saved locally");
        }

        setLocalBookmarks(updated);
        setBookmarks(updated.map((b) => sanitizeId(b.issue_id)));
        saveLocalStorage(updated);
      }
    },
    [bookmarks, cloudBookmarks, isAuthenticated, localBookmarks, refreshBookmarks, saveLocalStorage]
  );

  const isBookmarked = useCallback(
    (issueId: string) => {
      const cleanId = sanitizeId(issueId);
      return bookmarks.includes(cleanId);
    },
    [bookmarks]
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        cloudBookmarks,
        localBookmarks,
        isLoading,
        isSyncing,
        toggleBookmark,
        isBookmarked,
        refreshBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
