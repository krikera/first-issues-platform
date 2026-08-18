"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth, api } from "@/contexts/AuthContext";

const STORAGE_KEY = "first-issues-bookmarks";

interface BookmarkData {
  issue_id: string;
  issue_url: string;
  issue_title: string;
  repository_name: string;
  notes?: string;
  tags?: string[];
}

const getLocalStorage = () => {
  if (typeof window !== "undefined") return window.localStorage;
  return null;
};

export function useBookmarks() {
  const { isAuthenticated, user } = useAuth();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cloudBookmarks, setCloudBookmarks] = useState<any[]>([]);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get("/api/bookmarks");
          const cloudData = response.data.bookmarks || [];
          setCloudBookmarks(cloudData);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const issueIds = cloudData.map((b: any) => b.issue_id);
          setBookmarks(issueIds);
        } catch (error) {
          console.error("Failed to load bookmarks from API:", error);
          toast.error("Failed to load bookmarks");
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };
    loadBookmarks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const loadFromLocalStorage = () => {
    const ls = getLocalStorage();
    if (ls) {
      const saved = ls.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
            setBookmarks(parsed);
          }
        } catch {
          ls.removeItem(STORAGE_KEY);
        }
      }
    }
  };

  useEffect(() => {
    const syncToCloud = async () => {
      if (isAuthenticated && bookmarks.length > 0 && !isSyncing) {
        setIsSyncing(true);
        try {
          const ls = getLocalStorage();
          const localBookmarks = bookmarks.map((issueId) => ({
            issue_id: issueId,
            issue_url: `https://github.com/${issueId.replace("#", "/issues/")}`,
            issue_title: "Bookmarked Issue",
            repository_name: issueId.split("#")[0] || "unknown",
          }));
          await api.post("/api/bookmarks/sync", { local_bookmarks: localBookmarks });
          const response = await api.get("/api/bookmarks");
          const cloudData = response.data.bookmarks || [];
          setCloudBookmarks(cloudData);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setBookmarks(cloudData.map((b: any) => b.issue_id));
          if (ls) ls.removeItem(STORAGE_KEY);
          if (localBookmarks.length > 0) toast.success(`Synced ${localBookmarks.length} bookmark(s) to cloud`);
        } catch (error) {
          console.error("Failed to sync bookmarks:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    syncToCloud();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      const ls = getLocalStorage();
      if (ls) {
        if (bookmarks.length > 0) {
          try {
            ls.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
          } catch (e) {
            console.error("Error saving bookmarks:", e);
          }
        } else {
          ls.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [bookmarks, isAuthenticated]);

  const toggleBookmark = useCallback(
    async (issueId: string, issueData?: BookmarkData) => {
      if (typeof issueId !== "string" || issueId.length === 0 || issueId.length > 200) return;

      let sanitizedId = issueId.replace(/[<>'"&]/g, "");
      if (sanitizedId.includes("github.com") && sanitizedId.includes("/issues/")) {
        sanitizedId = sanitizedId
          .replace("https://github.com/", "")
          .replace("http://github.com/", "")
          .replace("github.com/", "")
          .replace("/issues/", "#");
      }

      const isCurrentlyBookmarked = bookmarks.includes(sanitizedId);

      if (isAuthenticated) {
        try {
          if (isCurrentlyBookmarked) {
            const cloudBookmark = cloudBookmarks.find((b) => b.issue_id === sanitizedId);
            if (cloudBookmark) {
              await api.delete(`/api/bookmarks/${cloudBookmark.id}`);
              setCloudBookmarks((prev) => prev.filter((b) => b.id !== cloudBookmark.id));
              toast.success("Bookmark removed");
            }
            setBookmarks((prev) => prev.filter((id) => id !== sanitizedId));
          } else {
            const bookmarkPayload = issueData
              ? { ...issueData, issue_id: sanitizedId }
              : {
                  issue_id: sanitizedId,
                  issue_url: `https://github.com/${sanitizedId.replace("#", "/issues/")}`,
                  issue_title: "Bookmarked Issue",
                  repository_name: sanitizedId.split("#")[0] || "unknown",
                };
            const response = await api.post("/api/bookmarks", bookmarkPayload);
            setCloudBookmarks((prev) => [...prev, response.data.bookmark]);
            setBookmarks((prev) => [...prev, sanitizedId]);
            toast.success("Bookmark saved to cloud");
          }
        } catch (error) {
          console.error("Failed to toggle bookmark:", error);
          toast.error("Failed to save bookmark");
          setBookmarks((prev) =>
            prev.includes(sanitizedId)
              ? prev.filter((id) => id !== sanitizedId)
              : [...prev, sanitizedId]
          );
        }
      } else {
        setBookmarks((prev) =>
          prev.includes(sanitizedId)
            ? prev.filter((id) => id !== sanitizedId)
            : [...prev, sanitizedId]
        );
      }
    },
    [bookmarks, isAuthenticated, cloudBookmarks]
  );

  const isBookmarked = useCallback(
    (issueId: string) => {
      if (typeof issueId !== "string") return false;
      let sanitizedId = issueId.replace(/[<>'"&]/g, "");
      if (sanitizedId.includes("github.com") && sanitizedId.includes("/issues/")) {
        sanitizedId = sanitizedId
          .replace("https://github.com/", "")
          .replace("http://github.com/", "")
          .replace("github.com/", "")
          .replace("/issues/", "#");
      }
      return bookmarks.includes(sanitizedId);
    },
    [bookmarks]
  );

  return { toggleBookmark, isBookmarked };
}
