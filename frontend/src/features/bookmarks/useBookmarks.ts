import { useState, useEffect, useCallback } from "react";
import { fetchBookmarks, toggleBookmark } from "./bookmarksAPI";

export function useBookmarks(page = 1, limit = 10) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookmarks(p, limit);
      if (p === 1) {
        setBookmarks(data.bookmarks || []);
      } else {
        setBookmarks((prev) => [...prev, ...(data.bookmarks || [])]);
      }
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadBookmarks(page);
  }, [loadBookmarks, page]);

  const toggle = async (params: { postId?: number; campaignId?: number }) => {
    const res = await toggleBookmark(params);
    // If we're viewing bookmarks and an item is unbookmarked, remove it from list
    if (!res.bookmarked) {
      setBookmarks((prev) =>
        prev.filter((b) => {
          if (params.postId && b.post_id === params.postId) return false;
          if (params.campaignId && b.campaign_id === params.campaignId) return false;
          return true;
        })
      );
    }
    return res;
  };

  return {
    bookmarks,
    pagination,
    loading,
    error,
    refetch: () => loadBookmarks(1),
    loadMore: (nextPage: number) => loadBookmarks(nextPage),
    toggleBookmark: toggle,
  };
}
