import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Loader2,
  User as UserIcon,
  Megaphone,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Heart,
  MessageCircle,
} from "lucide-react";

interface SearchUser {
  id: number;
  name: string;
  username: string;
  avatar_url?: string | null;
  role: string;
  kyc_verified?: boolean;
}

interface SearchCampaign {
  id: number;
  title: string;
  description: string;
  goal_amount: string | number;
  current_amount?: string | number;
  media_url?: string | null;
  user?: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string | null;
  };
}

interface SearchPost {
  id: number;
  content: string;
  media_url?: string | null;
  likes_count?: number;
  comments_count?: number;
  user?: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string | null;
    role?: string;
  };
}

interface SearchResults {
  users: SearchUser[];
  campaigns: SearchCampaign[];
  posts: SearchPost[];
  totalCount: number;
}

const RECENT_SEARCHES_KEY = "pern_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function SearchBar({
  isMobileOpen = false,
  onCloseMobile,
}: {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "campaigns" | "posts" | "users">("all");
  const [results, setResults] = useState<SearchResults>({
    users: [],
    campaigns: [],
    posts: [],
    totalCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Keyboard shortcut (Ctrl+K / Cmd+K) to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], campaigns: [], posts: [], totalCount: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/search?q=${encodeURIComponent(
            query.trim()
          )}&type=${activeTab}&limit=6`,
          {
            headers,
            signal: controller.signal,
          }
        );

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setResults(json.data);
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search query failed:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, activeTab]);

  // Flattened results for keyboard navigation
  const getFlattenedItems = () => {
    const items: Array<{ type: "campaign" | "post" | "user"; data: any }> = [];
    if (activeTab === "all" || activeTab === "campaigns") {
      results.campaigns.forEach((c) => items.push({ type: "campaign", data: c }));
    }
    if (activeTab === "all" || activeTab === "users") {
      results.users.forEach((u) => items.push({ type: "user", data: u }));
    }
    if (activeTab === "all" || activeTab === "posts") {
      results.posts.forEach((p) => items.push({ type: "post", data: p }));
    }
    return items;
  };

  const handleSelect = (type: "campaign" | "post" | "user", item: any) => {
    saveRecentSearch(query || (type === "campaign" ? item.title : type === "user" ? item.username : ""));
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();

    if (type === "campaign") {
      navigate(`/campaigns/${item.id}`);
    } else if (type === "post") {
      navigate(`/posts/${item.id}`);
    } else if (type === "user") {
      navigate(`/user/${item.username}`);
    }
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const flattened = getFlattenedItems();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setSelectedIndex((prev) => (prev < flattened.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flattened.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < flattened.length) {
        e.preventDefault();
        const selected = flattened[selectedIndex];
        handleSelect(selected.type, selected.data);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const hasResults =
    results.campaigns.length > 0 || results.users.length > 0 || results.posts.length > 0;

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/80 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${
        isMobileOpen ? "w-full" : "w-full max-w-xl"
      }`}
    >
      {/* Search Input Box */}
      <div className="relative flex items-center group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search campaigns, posts, and people..."
          className="w-full h-10 pl-10 pr-20 bg-slate-100/90 hover:bg-slate-100 rounded-full text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-slate-200/60 focus:border-indigo-500/40 focus:bg-white transition-all shadow-sm"
        />

        {/* Left Icon (Search or Spinner) */}
        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        {/* Right Actions (Clear button & Keyboard Badge) */}
        <div className="absolute right-3 flex items-center space-x-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
              Ctrl K
            </kbd>
          )}

          {isMobileOpen && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Dropdown Results Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col max-h-[75vh]">
          {/* Category Filter Pills (When query is entered) */}
          {query.trim().length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/80 text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "hover:bg-slate-200/70 text-slate-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("campaigns")}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  activeTab === "campaigns"
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "hover:bg-slate-200/70 text-slate-600"
                }`}
              >
                <Megaphone className="w-3 h-3" />
                Campaigns {results.campaigns.length > 0 && `(${results.campaigns.length})`}
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  activeTab === "users"
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "hover:bg-slate-200/70 text-slate-600"
                }`}
              >
                <UserIcon className="w-3 h-3" />
                People {results.users.length > 0 && `(${results.users.length})`}
              </button>
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  activeTab === "posts"
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "hover:bg-slate-200/70 text-slate-600"
                }`}
              >
                <FileText className="w-3 h-3" />
                Posts {results.posts.length > 0 && `(${results.posts.length})`}
              </button>
            </div>
          )}

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-100/80">
            {/* Empty Query State: Recent searches & suggestions */}
            {!query.trim() && (
              <div className="p-3 space-y-3">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Recent Searches
                      </span>
                      <button
                        onClick={clearAllRecent}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors lowercase"
                      >
                        clear all
                      </button>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {recentSearches.map((term, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setQuery(term);
                            inputRef.current?.focus();
                          }}
                          className="flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            <span>{term}</span>
                          </div>
                          <button
                            onClick={(e) => removeRecentSearch(e, term)}
                            className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 rounded-full transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    Quick Categories
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 px-2">
                    {["Medical", "Technology", "Education", "Disaster Relief", "Community", "Startups"].map(
                      (tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setQuery(tag);
                            inputRef.current?.focus();
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          #{tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {query.trim() && loading && !hasResults && (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
                <span className="text-xs">Searching database...</span>
              </div>
            )}

            {/* No Results Found */}
            {query.trim() && !loading && !hasResults && (
              <div className="py-10 px-4 text-center">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  No matching results found for "{query}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try searching by different keywords, username, or campaign title.
                </p>
              </div>
            )}

            {/* SECTION: Campaigns */}
            {(activeTab === "all" || activeTab === "campaigns") && results.campaigns.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
                  Campaigns ({results.campaigns.length})
                </div>
                <div className="mt-1 space-y-0.5">
                  {results.campaigns.map((camp) => {
                    const goal = Number(camp.goal_amount) || 0;
                    const current = Number(camp.current_amount) || 0;
                    const percent = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

                    return (
                      <div
                        key={`camp-${camp.id}`}
                        onClick={() => handleSelect("campaign", camp)}
                        className="px-4 py-2.5 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {camp.media_url ? (
                            <img
                              src={camp.media_url}
                              alt={camp.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                              <Megaphone className="w-5 h-5 text-indigo-600" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                              {highlightMatch(camp.title, query)}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              by @{camp.user?.username || "creator"} • ${current.toLocaleString()} raised of ${goal.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 text-right">
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {percent}%
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION: Users */}
            {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                  People ({results.users.length})
                </div>
                <div className="mt-1 space-y-0.5">
                  {results.users.map((usr) => (
                    <div
                      key={`user-${usr.id}`}
                      onClick={() => handleSelect("user", usr)}
                      className="px-4 py-2.5 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {usr.avatar_url ? (
                          <img
                            src={usr.avatar_url}
                            alt={usr.username}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                            {usr.name ? usr.name.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                              {highlightMatch(usr.name || usr.username, query)}
                            </span>
                            {usr.kyc_verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded capitalize">
                              {usr.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            @{highlightMatch(usr.username, query)}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: Posts */}
            {(activeTab === "all" || activeTab === "posts") && results.posts.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Posts & Threads ({results.posts.length})
                </div>
                <div className="mt-1 space-y-0.5">
                  {results.posts.map((post) => (
                    <div
                      key={`post-${post.id}`}
                      onClick={() => handleSelect("post", post)}
                      className="px-4 py-2.5 hover:bg-indigo-50/50 cursor-pointer flex items-start justify-between group transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 pr-2">
                        {post.user?.avatar_url ? (
                          <img
                            src={post.user.avatar_url}
                            alt={post.user.username}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 mt-0.5">
                            {post.user?.name ? post.user.name.charAt(0).toUpperCase() : "P"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500">
                            @{post.user?.username || "anonymous"}
                          </p>
                          <p className="text-sm text-slate-800 line-clamp-2 mt-0.5 group-hover:text-indigo-600 transition-colors">
                            {highlightMatch(post.content, query)}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-500" /> {post.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-indigo-500" /> {post.comments_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
