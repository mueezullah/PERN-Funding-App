import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { RightSidebar } from "./components/RightSidebar";
import { FeedCard } from "./components/FeedCard";
import { Hash, Loader2 } from "lucide-react";
import { formatRelativeTime } from "../../utils";

export default function ExplorePage({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExploreFeed = useCallback(async (pageNum: number) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/explore?page=${pageNum}&limit=10`,
        { headers }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load explore feed");
      }

      const newItems = data.data.items || [];
      if (pageNum === 1) {
        setItems(newItems);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }
      setPagination(data.data.pagination || null);
    } catch (err: any) {
      setError(err.message || "Failed to load explore feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreFeed(1);
  }, [fetchExploreFeed]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => {
            const next = prev + 1;
            fetchExploreFeed(next);
            return next;
          });
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, fetchExploreFeed]
  );

  const mapItemToFeedCard = (item: any) => {
    const isCampaign = item.type === "campaign";
    const createdAt = item.created_at || new Date().toISOString();

    return {
      id: `${item.type}-${item.id}`,
      type: (isCampaign ? "campaign" : "post") as "campaign" | "post",
      user: {
        id: item.user_id,
        name: isCampaign ? item.owner_name : item.author_name,
        username: isCampaign ? item.owner_username : item.author_username,
        avatar: item.author_avatar || item.owner_avatar || item.user?.avatar_url || item.avatar || "",
        role: item.author_role || (isCampaign ? "Fundraiser" : "Member"),
        time: formatRelativeTime(createdAt),
      },
      content: {
        title: item.title,
        description: item.description || item.content || "",
        image: item.media_url || undefined,
      },
      stats: {
        likes: item.likes_count ?? 0,
        comments: item.comments_count ?? 0,
        raised: isCampaign ? Number(item.current_amount || 0) : undefined,
        goal: isCampaign ? Number(item.goal_amount || 0) : undefined,
      },
      deadline: item.deadline,
      campaignStatus: item.status,
    };
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
        <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          <Sidebar />
        </div>
        <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-275 mx-auto flex gap-8">
            <div className="flex-1 max-w-175 py-6">
              {/* Explore Header */}
              <div className="flex items-center space-x-3 mb-6 px-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                  <Hash className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Explore</h1>
                  <p className="text-sm text-slate-500">
                    Discover trending campaigns and discussions across the community
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                  <p className="text-sm font-medium">Loading explore feed...</p>
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center text-rose-600">
                  {error}
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/70 bg-white p-12 text-center text-slate-500">
                  No content found to explore yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const cardProps = mapItemToFeedCard(item);
                    const isLast = index === items.length - 1;
                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        ref={isLast ? lastItemRef : null}
                      >
                        <FeedCard {...cardProps} />
                      </div>
                    );
                  })}
                  {loadingMore && (
                    <div className="flex justify-center py-6 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="hidden xl:block w-75 shrink-0">
              <RightSidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
