import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import {
  Compass,
  Megaphone,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles,
  Loader2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatRelativeTime, handleError, handleSuccess } from "../../utils";
import { toggleBookmark } from "../../features/bookmarks/bookmarksAPI";
import { showMinimalToast } from "../../components/MinimalToast";

export default function ExplorePage({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "campaigns" | "posts">("all");

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
        `${import.meta.env.VITE_BASE_API_URL}/explore?page=${pageNum}&limit=12`,
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

  // Filter items based on active tab
  const filteredItems = items.filter((item) => {
    if (filterType === "campaigns") return item.type === "campaign";
    if (filterType === "posts") return item.type === "post";
    return true;
  });

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <main className="flex-1 mt-16 max-w-400 mx-auto w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-2 px-4 lg:px-8">
        {/* Left Sidebar */}
        <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          <Sidebar />
        </div>

        {/* Main Explore Content Grid */}
        <div className="bg-transparent border-l border-slate-200/60 h-[calc(100vh-64px)] overflow-y-auto w-full px-4 sm:px-6 lg:px-8 py-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Header Banner */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Compass className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Discover Community</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Explore Feed
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Trending fundraisers, innovative ideas, and discussions from creators everywhere
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center p-1 bg-white border border-slate-200/80 rounded-2xl shadow-xs self-start sm:self-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  All ({items.length})
                </span>
              </button>
              <button
                onClick={() => setFilterType("campaigns")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  filterType === "campaigns"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4" />
                  Campaigns
                </span>
              </button>
              <button
                onClick={() => setFilterType("posts")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  filterType === "posts"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Posts
                </span>
              </button>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-slate-200/70 p-5 shadow-xs animate-pulse flex flex-col space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-44 bg-slate-100 rounded-2xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                  <div className="h-8 bg-slate-100 rounded-full w-full mt-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl border border-rose-200/80 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Explore Feed</h3>
              <p className="text-sm text-slate-500 mb-6">{error}</p>
              <button
                onClick={() => fetchExploreFeed(1)}
                className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/70 p-16 text-center max-w-lg mx-auto my-12 shadow-xs">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
              <p className="text-sm text-slate-500">
                {filterType === "all"
                  ? "There are currently no active campaigns or posts to explore."
                  : `No ${filterType} available right now. Check back soon!`}
              </p>
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item, index) => {
                const isLast = index === filteredItems.length - 1;
                return (
                  <div key={`${item.type}-${item.id}`} ref={isLast ? lastItemRef : null}>
                    {item.type === "campaign" ? (
                      <ExploreCampaignCard item={item} navigate={navigate} />
                    ) : (
                      <ExplorePostCard item={item} navigate={navigate} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Infinite Scroll Loader */}
          {loadingMore && (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm font-medium">Loading more explore content...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Explore Campaign Card Component
 */
function ExploreCampaignCard({ item, navigate }: { item: any; navigate: any }) {
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);

  const goal = Number(item.goal_amount || 0);
  const raised = Number(item.current_amount || 0);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const isFullyFunded = raised >= goal && goal > 0;

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleBookmark({ campaignId: Number(item.id) });
      setIsSaved(res.bookmarked);
      showMinimalToast(res.bookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks");
    } catch (err: any) {
      handleError(err.message || "Failed to update bookmark");
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      handleError("Please sign in to like");
      return;
    }
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev: number) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType: "campaign", targetId: item.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLiked(!nextState);
        setLikesCount((prev: number) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch {
      setIsLiked(!nextState);
      setLikesCount((prev: number) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/campaigns/${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showMinimalToast("Link copied to clipboard!");
    }
  };

  const authorName = item.owner_name || item.author_name || "Creator";
  const authorUsername = item.owner_username || item.author_username || "";
  const authorAvatar = item.owner_avatar || item.author_avatar || item.user?.avatar_url || "";

  return (
    <div
      onClick={() => navigate(`/campaigns/${item.id}`)}
      className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
    >
      {/* Media Header / Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden shrink-0">
        {item.media_url ? (
          <img
            src={item.media_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 flex items-center justify-center">
            <Megaphone className="w-12 h-12 text-emerald-400 opacity-60" />
          </div>
        )}

        {/* Tag Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 backdrop-blur-md text-white shadow-sm">
            <Megaphone className="w-3 h-3" />
            Campaign
          </span>
          {isFullyFunded && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
              Funded
            </span>
          )}
        </div>

        {/* Bookmark quick button */}
        <button
          onClick={handleBookmarkClick}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all cursor-pointer"
          aria-label="Bookmark campaign"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white text-white" : ""}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Creator Info */}
        <div className="flex items-center space-x-3 mb-3.5">
          <div
            onClick={(e) => {
              if (authorUsername) {
                e.stopPropagation();
                navigate(`/user/${authorUsername}`);
              }
            }}
            className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 border border-slate-200/60 hover:ring-2 hover:ring-emerald-500/30 transition-all cursor-pointer"
          >
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              authorName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              onClick={(e) => {
                if (authorUsername) {
                  e.stopPropagation();
                  navigate(`/user/${authorUsername}`);
                }
              }}
              className="text-xs font-bold text-slate-900 truncate hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {authorName}
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {formatRelativeTime(item.created_at)}
            </p>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug mb-2">
          {item.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {item.description}
        </p>

        {/* Funding Progress */}
        <div className="space-y-2 pt-3 border-t border-slate-100 mt-auto">
          <div className="flex justify-between items-baseline text-xs">
            <span className="font-extrabold text-slate-900">
              ${raised.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              of ${goal.toLocaleString()} goal
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-slate-500 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLikeClick}
              className={`flex items-center space-x-1 hover:text-rose-500 transition-colors cursor-pointer ${
                isLiked ? "text-rose-500 font-bold" : ""
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center space-x-1 hover:text-indigo-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{item.comments_count || 0}</span>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            title="Share Campaign"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Explore Post Card Component
 */
function ExplorePostCard({ item, navigate }: { item: any; navigate: any }) {
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await toggleBookmark({ postId: Number(item.id) });
      setIsSaved(res.bookmarked);
      showMinimalToast(res.bookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks");
    } catch (err: any) {
      handleError(err.message || "Failed to update bookmark");
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      handleError("Please sign in to like");
      return;
    }
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev: number) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType: "post", targetId: item.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLiked(!nextState);
        setLikesCount((prev: number) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch {
      setIsLiked(!nextState);
      setLikesCount((prev: number) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${item.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showMinimalToast("Link copied to clipboard!");
    }
  };

  const authorName = item.author_name || item.user?.name || "Community Member";
  const authorUsername = item.author_username || item.user?.username || "";
  const authorAvatar = item.author_avatar || item.user?.avatar_url || "";
  const authorRole = item.author_role || item.user?.role || "Member";

  return (
    <div
      onClick={() => navigate(`/posts/${item.id}`)}
      className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
    >
      {/* Optional Media Image Header */}
      {item.media_url && (
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
          <img
            src={item.media_url}
            alt="Post media"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3.5 left-3.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/90 backdrop-blur-md text-white shadow-sm">
              <MessageSquare className="w-3 h-3" />
              Post
            </span>
          </div>
          <button
            onClick={handleBookmarkClick}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all cursor-pointer"
            aria-label="Bookmark post"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white text-white" : ""}`} />
          </button>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Creator Info & Tag */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-3 min-w-0">
            <div
              onClick={(e) => {
                if (authorUsername) {
                  e.stopPropagation();
                  navigate(`/user/${authorUsername}`);
                }
              }}
              className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 border border-slate-200/60 hover:ring-2 hover:ring-indigo-500/30 transition-all cursor-pointer"
            >
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                authorName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p
                  onClick={(e) => {
                    if (authorUsername) {
                      e.stopPropagation();
                      navigate(`/user/${authorUsername}`);
                    }
                  }}
                  className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {authorName}
                </p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                  {authorRole}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {formatRelativeTime(item.created_at)}
              </p>
            </div>
          </div>

          {!item.media_url && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 shrink-0">
              <MessageSquare className="w-3 h-3" />
              Post
            </span>
          )}
        </div>

        {/* Post Text Content */}
        <p className="text-sm font-medium text-slate-800 leading-relaxed line-clamp-4 mb-4 flex-1">
          {item.content || item.description}
        </p>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-100 text-slate-500 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLikeClick}
              className={`flex items-center space-x-1 hover:text-rose-500 transition-colors cursor-pointer ${
                isLiked ? "text-rose-500 font-bold" : ""
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{likesCount}</span>
            </button>
            <div className="flex items-center space-x-1 hover:text-indigo-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{item.comments_count || 0}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleBookmarkClick}
              className={`p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer ${
                isSaved ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
              title="Bookmark Post"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-indigo-600 text-indigo-600" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
              title="Share Post"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


