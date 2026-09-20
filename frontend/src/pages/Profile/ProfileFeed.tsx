import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  User,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Camera,
  Loader2,
  MoreHorizontal,
  Trash2,
  Edit2,
  Pin,
  AlertTriangle,
  UserPlus,
  EyeOff,
  Bookmark,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { formatRelativeTime, handleError, handleSuccess } from "../../utils";
import { showMinimalToast } from "../../components/MinimalToast";
import { CreateThreadModal } from "../Feed/components/CreateThreadModal";
import CreateCampaignModal from "../CreatorDashboard/CreateCampaignModal";
import { useLike } from "../../features/likes/useLike";
import { toggleBookmark } from "../../features/bookmarks/bookmarksAPI";
import { EditProfileModal } from "../../components/EditProfileModal";

function ProfileLikeButton({
  type,
  id,
  initialLikes = 0,
}: {
  type: "post" | "campaign";
  id: number;
  initialLikes: number;
}) {
  const { liked, likesCount, loading, toggleLike } = useLike(type, id);
  const displayCount = loading ? initialLikes : likesCount;

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        toggleLike();
      }}
      className={`inline-flex items-center gap-2 text-sm transition-colors cursor-pointer ${
        liked ? "text-rose-500 font-semibold" : "text-slate-500 hover:text-slate-900"
      }`}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      <span>{displayCount}</span>
    </span>
  );
}

const POSTS_PAGE_SIZE = 4;
const CAMPAIGNS_PAGE_SIZE = 3;

const getPaginationPage = (pagination: { page?: number; currentPage?: number } | null) =>
  pagination?.page ?? pagination?.currentPage ?? 1;

const hasMorePages = (pagination: { page?: number; currentPage?: number; totalPages?: number } | null) => {
  if (!pagination?.totalPages) {
    return false;
  }
  return getPaginationPage(pagination) < pagination.totalPages;
};

export function ProfileFeed({
  name,
  username,
  isOwnProfile = true,
}: {
  name?: string;
  username?: string;
  isOwnProfile?: boolean;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "Posts";

  const sectionData = [
    { key: "Posts", title: "Posts" },
    { key: "Campaigns", title: "Campaigns" },
    ...(isOwnProfile
      ? [
          { key: "Donations", title: "Donations" },
          { key: "Saved", title: "Saved" },
        ]
      : []),
    { key: "About", title: "About" },
  ];

  const [activeTab, setActiveTab] = useState(
    sectionData.some((s) => s.key.toLowerCase() === initialTab.toLowerCase())
      ? sectionData.find((s) => s.key.toLowerCase() === initialTab.toLowerCase())!.key
      : "Posts"
  );

  const [posts, setPosts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userProfileData, setUserProfileData] = useState<any | null>(null);

  const [postsPagination, setPostsPagination] = useState<any | null>(null);
  const [campaignsPagination, setCampaignsPagination] = useState<any | null>(null);
  const [savedPagination, setSavedPagination] = useState<any | null>(null);
  const [donationsPagination, setDonationsPagination] = useState<any | null>(null);

  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [avatarState, setAvatarState] = useState<string | null>(
    isOwnProfile ? localStorage.getItem("avatar") : null
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [localName, setLocalName] = useState(name || "");
  const [localUsername, setLocalUsername] = useState(username || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Sync tab with URL query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && sectionData.some((s) => s.key.toLowerCase() === tabParam.toLowerCase())) {
      const matchedKey = sectionData.find((s) => s.key.toLowerCase() === tabParam.toLowerCase())!.key;
      setActiveTab(matchedKey);
    }
  }, [searchParams, isOwnProfile]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Sync name/username with props
  useEffect(() => {
    if (name) setLocalName(name);
  }, [name]);
  useEffect(() => {
    if (username) setLocalUsername(username);
  }, [username]);

  // Listen for profileUpdate events from EditProfileModal
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.name) setLocalName(detail.name);
      if (detail?.username) setLocalUsername(detail.username);
    };
    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdate", handleProfileUpdate);
  }, []);

  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  const currentUserId = localStorage.getItem("userId");
  const isItemOwner = (itemUserId?: string | number) => {
    if (isOwnProfile) return true;
    return Boolean(currentUserId && itemUserId && String(itemUserId) === String(currentUserId));
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setActiveMenuId(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showMinimalToast("Post Deleted");
      } else {
        handleError(data.message || "Failed to delete post");
      }
    } catch (err: any) {
      handleError(err.message || "Failed to delete post");
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    setActiveMenuId(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        showMinimalToast("Campaign Deleted");
      } else {
        handleError(data.message || "Failed to delete campaign");
      }
    } catch (err: any) {
      handleError(err.message || "Failed to delete campaign");
    }
  };

  const sortWithPinned = (items: any[]) => {
    return [...items].sort((a, b) => {
      const aPinned = a.pinned_at ? 1 : 0;
      const bPinned = b.pinned_at ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  };

  const handleTogglePinPost = async (postId: number) => {
    setActiveMenuId(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/posts/${postId}/pin`, {
        method: "PATCH",
        headers: {
          Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const isPinned = data.data.pinned;
        setPosts((prev) => {
          const updated = prev.map((p) =>
            p.id === postId ? { ...p, pinned_at: isPinned ? (data.data.pinned_at || new Date().toISOString()) : null } : p
          );
          return sortWithPinned(updated);
        });
        showMinimalToast(isPinned ? "Post Pinned to Profile" : "Post Unpinned");
      } else {
        handleError(data.message || "Failed to toggle pin");
      }
    } catch (err: any) {
      handleError(err.message || "Failed to toggle pin");
    }
  };

  const handleTogglePinCampaign = async (campaignId: number) => {
    setActiveMenuId(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/campaigns/${campaignId}/pin`, {
        method: "PATCH",
        headers: {
          Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const isPinned = data.data.pinned;
        setCampaigns((prev) => {
          const updated = prev.map((c) =>
            c.id === campaignId ? { ...c, pinned_at: isPinned ? (data.data.pinned_at || new Date().toISOString()) : null } : c
          );
          return sortWithPinned(updated);
        });
        showMinimalToast(isPinned ? "Campaign Pinned to Profile" : "Campaign Unpinned");
      } else {
        handleError(data.message || "Failed to toggle pin");
      }
    } catch (err: any) {
      handleError(err.message || "Failed to toggle pin");
    }
  };

  const handleRemoveBookmark = async (item: any) => {
    try {
      const isPost = item.type === "post" || !!item.post;
      const targetPostId = item.post_id || (isPost ? (item.post?.id || item.id) : undefined);
      const targetCampaignId = item.campaign_id || (!isPost ? (item.campaign?.id || item.id) : undefined);

      await toggleBookmark({
        postId: targetPostId ? Number(targetPostId) : undefined,
        campaignId: targetCampaignId ? Number(targetCampaignId) : undefined,
      });
      setSavedItems((prev) =>
        prev.filter((b) => (b.bookmarkId || b.id) !== (item.bookmarkId || item.id))
      );
      showMinimalToast("Removed from Saved");
    } catch (err: any) {
      handleError(err.message || "Failed to remove bookmark");
    }
  };

  const handleEditPostSuccess = (updatedPost: any) => {
    setEditingPost(null);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === updatedPost.id
          ? {
              ...p,
              content: updatedPost.content,
              media_url: updatedPost.media_url,
            }
          : p
      )
    );
    showMinimalToast("Post Updated");
  };

  const handleEditCampaignSuccess = (updatedCampaign: any) => {
    setEditingCampaign(null);
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === updatedCampaign.id
          ? {
              ...c,
              title: updatedCampaign.title,
              description: updatedCampaign.description,
              goal_amount: updatedCampaign.goal_amount,
              deadline: updatedCampaign.deadline,
              media_url: updatedCampaign.media_url,
            }
          : c
      )
    );
    showMinimalToast("Campaign Updated");
  };

  const displayName =
    localName ||
    (isOwnProfile ? localStorage.getItem("name") : null) ||
    localUsername ||
    "User";

  const avatar = isOwnProfile
    ? avatarState || localStorage.getItem("avatar")
    : avatarState;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to update your avatar.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload avatar");
      }

      const newAvatarUrl = data.avatar_url;
      setAvatarState(newAvatarUrl);
      if (isOwnProfile) {
        localStorage.setItem("avatar", newAvatarUrl);
        window.dispatchEvent(new Event("avatarChange"));
      }
    } catch (err: any) {
      alert(err.message || "Error uploading profile picture to S3");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    async function loadProfileContent() {
      setLoading(true);
      setError(null);
      setPosts([]);
      setCampaigns([]);
      setSavedItems([]);
      setDonations([]);
      setPostsPagination(null);
      setCampaignsPagination(null);
      setSavedPagination(null);
      setDonationsPagination(null);
      setUserId(null);

      try {
        if (!username) {
          throw new Error("Username required");
        }

        const token = localStorage.getItem("token");
        const authHeader = token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : "";

        const profileRes = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/users/${username}`
        );
        const profileData = await profileRes.json();
        if (!profileRes.ok || !profileData.success) {
          throw new Error(profileData.message || "Unable to load profile");
        }

        const nextUserId = profileData.data.id;
        setUserId(nextUserId);
        setUserProfileData(profileData.data);
        const resolvedAvatar = profileData.data.avatar_url || profileData.data.avatarUrl || profileData.data.avatar || null;
        if (resolvedAvatar) {
          setAvatarState(resolvedAvatar);
          if (isOwnProfile) {
            localStorage.setItem("avatar", resolvedAvatar);
            window.dispatchEvent(new Event("avatarChange"));
          }
        }

        const fetchPromises: Promise<any>[] = [
          fetch(
            `${import.meta.env.VITE_BASE_API_URL}/posts/user/${nextUserId}?page=1&limit=${POSTS_PAGE_SIZE}`
          ),
          fetch(
            `${import.meta.env.VITE_BASE_API_URL}/campaigns/user/${nextUserId}?page=1&limit=${CAMPAIGNS_PAGE_SIZE}`
          ),
        ];

        if (isOwnProfile && authHeader) {
          fetchPromises.push(
            fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks?page=1&limit=10`, {
              headers: { Authorization: authHeader },
            })
          );
          fetchPromises.push(
            fetch(`${import.meta.env.VITE_BASE_API_URL}/users/me/donations?page=1&limit=10`, {
              headers: { Authorization: authHeader },
            })
          );
        }

        const responses = await Promise.all(fetchPromises);
        const postsData = await responses[0].json();
        const campaignsData = await responses[1].json();

        if (postsData.success) {
          setPosts(sortWithPinned(postsData.data.posts || []));
          setPostsPagination(postsData.data.pagination || null);
        }
        if (campaignsData.success) {
          setCampaigns(sortWithPinned(campaignsData.data.campaigns || []));
          setCampaignsPagination(campaignsData.data.pagination || null);
        }

        if (isOwnProfile && responses.length > 2) {
          const bookmarksData = await responses[2].json();
          if (bookmarksData.success) {
            setSavedItems(bookmarksData.data.items || bookmarksData.data.bookmarks || []);
            setSavedPagination(bookmarksData.data.pagination || null);
          }
          const donationsData = await responses[3].json();
          if (donationsData.success) {
            setDonations(donationsData.data.donations || []);
            setDonationsPagination(donationsData.data.pagination || null);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile content");
      } finally {
        setLoading(false);
      }
    }

    loadProfileContent();
  }, [username, isOwnProfile]);

  const loadMoreItems = useCallback(async () => {
    if (loadingMore || !userId || !username) {
      return;
    }

    let currentPagination = null;
    if (activeTab === "Posts") currentPagination = postsPagination;
    else if (activeTab === "Campaigns") currentPagination = campaignsPagination;
    else if (activeTab === "Saved") currentPagination = savedPagination;
    else if (activeTab === "Donations") currentPagination = donationsPagination;

    if (!hasMorePages(currentPagination)) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = getPaginationPage(currentPagination) + 1;
      const token = localStorage.getItem("token");
      const authHeader = token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : "";

      if (activeTab === "Posts") {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/posts/user/${userId}?page=${nextPage}&limit=${POSTS_PAGE_SIZE}`
        );
        const data = await res.json();
        if (data.success) {
          setPosts((prev) => sortWithPinned([...prev, ...(data.data.posts || [])]));
          setPostsPagination(data.data.pagination || null);
        }
      } else if (activeTab === "Campaigns") {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/campaigns/user/${userId}?page=${nextPage}&limit=${CAMPAIGNS_PAGE_SIZE}`
        );
        const data = await res.json();
        if (data.success) {
          setCampaigns((prev) => sortWithPinned([...prev, ...(data.data.campaigns || [])]));
          setCampaignsPagination(data.data.pagination || null);
        }
      } else if (activeTab === "Saved" && isOwnProfile) {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/bookmarks?page=${nextPage}&limit=10`,
          { headers: { Authorization: authHeader } }
        );
        const data = await res.json();
        if (data.success) {
          setSavedItems((prev) => [...prev, ...(data.data.items || data.data.bookmarks || [])]);
          setSavedPagination(data.data.pagination || null);
        }
      } else if (activeTab === "Donations" && isOwnProfile) {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/users/me/donations?page=${nextPage}&limit=10`,
          { headers: { Authorization: authHeader } }
        );
        const data = await res.json();
        if (data.success) {
          setDonations((prev) => [...prev, ...(data.data.donations || [])]);
          setDonationsPagination(data.data.pagination || null);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load more content");
    } finally {
      setLoadingMore(false);
    }
  }, [
    activeTab,
    campaignsPagination,
    donationsPagination,
    isOwnProfile,
    loadingMore,
    postsPagination,
    savedPagination,
    userId,
    username,
  ]);

  useEffect(() => {
    return () => {
      observer.current?.disconnect();
    };
  }, []);

  const getActiveItems = () => {
    if (activeTab === "Posts") return posts;
    if (activeTab === "Campaigns") return campaigns;
    if (activeTab === "Saved") return savedItems;
    if (activeTab === "Donations") return donations;
    return [];
  };

  const getActivePagination = () => {
    if (activeTab === "Posts") return postsPagination;
    if (activeTab === "Campaigns") return campaignsPagination;
    if (activeTab === "Saved") return savedPagination;
    if (activeTab === "Donations") return donationsPagination;
    return null;
  };

  const activeItems = getActiveItems();
  const hasMoreItems = hasMorePages(getActivePagination());

  const lastItemElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore || !hasMoreItems) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMoreItems();
          }
        },
        {
          rootMargin: "200px",
          threshold: 0.1,
        }
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMoreItems, loadMoreItems, loading, loadingMore]
  );

  const activeTabTitle =
    sectionData.find((item) => item.key === activeTab)?.title || activeTab;

  const getInitials = (n: string | undefined) => {
    if (!n) return "U";
    return n
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const getCampaignProgress = (item: any) => {
    const raised =
      Number(item.current_amount ?? item.raised_amount ?? item.amount_raised ?? 0) || 0;
    const goal = Number(item.goal_amount ?? item.goal ?? 0) || 0;
    const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    const deadline = item.deadline ? new Date(item.deadline) : null;
    const now = new Date();
    const daysLeft = deadline
      ? Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;
    const statusLabel =
      item.status === "completed" || raised >= goal ? "Fully funded" : "Funding";

    return { raised, goal, progress, daysLeft, statusLabel };
  };

  const role = localStorage.getItem("role");

  const handleCampaignClick = () => {
    if (role === "admin" || role === "fundraiser") {
      navigate("/create-campaign", { state: { returnTo: window.location.pathname } });
    } else {
      navigate(`/kyc-verification`, { state: { returnTo: window.location.pathname } });
    }
  };

  const renderPostItem = (item: any) => {
    const isPinned = !!item.pinned_at;

    return (
      <div
        onClick={() => navigate(`/posts/${item.id}`)}
        className="cursor-pointer rounded-3xl px-4 py-4 transition-colors hover:bg-slate-100"
      >
        <div className="space-y-3">
          {/* Pinned Indicator */}
          {isPinned && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <Pin className="w-3.5 h-3.5 fill-indigo-600" />
              <span>Pinned Post</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
                {item.author_avatar || avatar ? (
                  <img
                    src={item.author_avatar || avatar}
                    alt={item.author_name || displayName || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-slate-700">
                    {getInitials(item.author_name || displayName)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  <span>{item.author_name || displayName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-dots Action Menu */}
            <div
              ref={activeMenuId === `post-${item.id}` ? menuContainerRef : null}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === `post-${item.id}` ? null : `post-${item.id}`);
                }}
                className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                  activeMenuId === `post-${item.id}`
                    ? "text-indigo-600 bg-indigo-50/80 scale-105"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Post actions"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {activeMenuId === `post-${item.id}` && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1b] border border-slate-700/50 rounded-xl shadow-2xl py-1.5 z-50 text-[#d7dadc] animate-in fade-in slide-in-from-top-2 duration-200">
                  {isItemOwner(item.user_id) ? (
                    <>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          handleDeletePost(item.id);
                        }}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          setEditingPost(item);
                        }}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-[#d7dadc] hover:bg-[#272729] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 text-[#d7dadc]" />
                        <span>Edit Details</span>
                      </button>
                      <button
                        onClick={() => handleTogglePinPost(item.id)}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-[#d7dadc] hover:bg-[#272729] transition-colors cursor-pointer"
                      >
                        <Pin className="w-4 h-4 text-[#d7dadc]" />
                        <span>{isPinned ? "Unpin from profile" : "Pin to profile"}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          handleSuccess("Content reported for review.");
                        }}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Report Content</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 text-slate-900">
            {item.content && <p className="text-base leading-7">{item.content}</p>}
            {item.media_url && (
              <img
                src={item.media_url}
                alt="Post"
                className="w-full rounded-2xl object-cover max-h-96"
              />
            )}
          </div>
        </div>
        <div className="flex items-center justify-start gap-4 pt-3 text-slate-500">
          <ProfileLikeButton
            type="post"
            id={item.id}
            initialLikes={item.likes_count ?? item.likes ?? 0}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/posts/${item.id}`);
            }}
            className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{item.comments_count ?? item.comments ?? 0}</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    );
  };

  const renderCampaignItem = (item: any) => {
    const isPinned = !!item.pinned_at;
    const { raised, goal, progress, daysLeft, statusLabel } = getCampaignProgress(item);

    return (
      <div
        onClick={() => navigate(`/campaigns/${item.id}`)}
        className="cursor-pointer rounded-3xl px-4 py-4 transition-colors hover:bg-slate-100"
      >
        <div className="space-y-3">
          {/* Pinned Indicator */}
          {isPinned && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <Pin className="w-3.5 h-3.5 fill-indigo-600" />
              <span>Pinned Campaign</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
                {item.owner_avatar || avatar ? (
                  <img
                    src={item.owner_avatar || avatar}
                    alt={item.owner_name || item.author_name || displayName || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-slate-700">
                    {getInitials(item.owner_name || item.author_name || displayName)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  <span>{item.owner_name || item.author_name || displayName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
                <div className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Campaign
                </div>
              </div>
            </div>

            {/* 3-dots Action Menu */}
            <div
              ref={activeMenuId === `campaign-${item.id}` ? menuContainerRef : null}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(
                    activeMenuId === `campaign-${item.id}` ? null : `campaign-${item.id}`
                  );
                }}
                className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                  activeMenuId === `campaign-${item.id}`
                    ? "text-indigo-600 bg-indigo-50/80 scale-105"
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                }`}
                aria-label="Campaign actions"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {activeMenuId === `campaign-${item.id}` && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1b] border border-slate-700/50 rounded-xl shadow-2xl py-1.5 z-50 text-[#d7dadc] animate-in fade-in slide-in-from-top-2 duration-200">
                  {isItemOwner(item.user_id) ? (
                    <>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          handleDeleteCampaign(item.id);
                        }}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          setEditingCampaign(item);
                        }}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-[#d7dadc] hover:bg-[#272729] transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 text-[#d7dadc]" />
                        <span>Edit Details</span>
                      </button>
                      <button
                        onClick={() => handleTogglePinCampaign(item.id)}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-[#d7dadc] hover:bg-[#272729] transition-colors cursor-pointer"
                      >
                        <Pin className="w-4 h-4 text-[#d7dadc]" />
                        <span>{isPinned ? "Unpin from profile" : "Pin to profile"}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          handleSuccess("Campaign reported for review.");
                        }}
                        className="flex items-center space-x-2.5 w-full px-4 py-2 text-left text-[13px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Report Content</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 text-slate-900">
            <h3 className="text-base font-semibold leading-7">
              {item.title || "Untitled campaign"}
            </h3>
            {item.description && <p className="text-base leading-7">{item.description}</p>}
            {item.media_url && (
              <img
                src={item.media_url}
                alt="Campaign"
                className="w-full rounded-2xl object-cover max-h-96"
              />
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Funding progress
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(raised)} raised
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-xs text-slate-500">of {formatCurrency(goal)}</p>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {daysLeft !== null
                    ? daysLeft === 0
                      ? "Deadline reached"
                      : `${daysLeft} days left`
                    : "No deadline"}
                </span>
                <span className="font-medium text-slate-700">{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4 pt-3 text-slate-500">
          <ProfileLikeButton
            type="campaign"
            id={item.id}
            initialLikes={item.likes_count ?? item.likes ?? 0}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/campaigns/${item.id}`);
            }}
            className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{item.comments_count ?? item.comments ?? 0}</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSavedItem = (bookmark: any) => {
    const isPost = bookmark.type === "post" || !!bookmark.post;
    const item = bookmark.post || bookmark.campaign || bookmark;
    if (!item) return null;

    const savedDate = bookmark.bookmarkedAt || bookmark.created_at || item.created_at;

    return (
      <div key={bookmark.bookmarkId || bookmark.id} className="relative group">
        <div className="flex items-center justify-between px-4 pt-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
            Saved on {savedDate ? new Date(savedDate).toLocaleDateString() : "recent"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveBookmark(bookmark);
            }}
            className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Remove
          </button>
        </div>
        {isPost ? renderPostItem(item) : renderCampaignItem(item)}
      </div>
    );
  };

  const renderDonationItem = (donation: any) => {
    const campaign = donation.campaign;
    const amountNum = parseFloat(donation.amount || 0);

    return (
      <div
        key={donation.id}
        onClick={() => campaign?.id && navigate(`/campaigns/${campaign.id}`)}
        className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md cursor-pointer hover:border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 line-clamp-1">
              {campaign?.title || `Campaign #${donation.campaign_id}`}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
              <span>Donated on {new Date(donation.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span
                className={clsx(
                  "px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]",
                  donation.status === "completed"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : donation.status === "refunded"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                )}
              >
                {donation.status}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <p className="text-lg font-extrabold text-slate-900">
            ${amountNum.toFixed(2)}
          </p>
          <span className="text-xs text-slate-400">Total Contribution</span>
        </div>
      </div>
    );
  };

  const renderAboutTab = () => {
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">About {displayName}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {userProfileData?.bio || `${displayName} is a valued member of the OnlyFunds community.`}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400 font-medium">Username</span>
            <p className="font-semibold text-slate-900">@{username}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Account Type</span>
            <p className="font-semibold text-slate-900 capitalize">
              {userProfileData?.role || role || "Member"}
            </p>
          </div>
          {userProfileData?.created_at && (
            <div>
              <span className="text-slate-400 font-medium">Joined</span>
              <p className="font-semibold text-slate-900">
                {new Date(userProfileData.created_at).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
          <div>
            <span className="text-slate-400 font-medium">KYC Status</span>
            <p className="font-semibold text-slate-900 flex items-center gap-1">
              {userProfileData?.kyc_verified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Verified</span>
                </>
              ) : (
                <span className="text-slate-500">Unverified</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-175 mx-auto py-8 flex flex-col">
      <div className="flex items-center space-x-4 mb-6 px-4">
        {/* Profile Avatar */}
        <div className="relative group">
          <button
            onClick={() => isOwnProfile && fileInputRef.current?.click()}
            className="hover:ring-2 hover:ring-indigo-500/30 transition-all overflow-hidden rounded-full border border-slate-200 block shrink-0"
          >
            {uploadingAvatar ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
              </div>
            ) : avatar ? (
              <img
                src={avatar}
                alt={displayName || "Profile"}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-full cursor-pointer"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <User className="h-8 w-8 text-slate-500 sm:h-10 sm:w-10" />
              </div>
            )}
          </button>
          {isOwnProfile && !uploadingAvatar && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Change profile picture"
            >
              <Camera className="h-3 w-3 text-slate-600" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
        </div>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {displayName}
            </h1>
            {localUsername && (
              <p className="text-md font-bold text-slate-800 mt-1">@{localUsername}</p>
            )}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="ml-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-sm font-semibold transition-colors cursor-pointer xl:hidden"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 px-4 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {sectionData.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={clsx(
              "px-4 py-2 cursor-pointer rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap",
              activeTab === tab.key
                ? "bg-slate-200/70 text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {tab.key}
          </button>
        ))}
      </div>

      {/* Action Header */}
      <div className="flex items-center space-x-3 px-4 pb-4 border-b border-slate-200 mb-6">
        {isOwnProfile && (activeTab === "Posts" || activeTab === "Campaigns") && (
          <button
            onClick={() =>
              activeTab === "Posts" ? setIsThreadModalOpen(true) : handleCampaignClick()
            }
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-300 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-700" />
            <span className="text-[14px] font-semibold text-slate-700">
              {activeTab === "Posts" ? "Create Post" : "Create Campaign"}
            </span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="px-4 py-24 text-center text-slate-500">
          Loading profile activity…
        </div>
      ) : error ? (
        <div className="px-4 py-24 text-center text-rose-500">{error}</div>
      ) : activeTab === "About" ? (
        <div className="px-4">{renderAboutTab()}</div>
      ) : (
        <div className="px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{activeTabTitle}</h2>
          </div>

          {activeItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-12 text-center text-slate-500">
              No {activeTab.toLowerCase()} found.
            </div>
          ) : (
            <div className="flex flex-col gap-4 pr-2">
              {activeTab === "Posts" &&
                posts.map((item, index) => (
                  <div
                    ref={index === posts.length - 1 ? lastItemElementRef : null}
                    key={`post-${item.id}`}
                    className="border-b border-slate-200/70 pb-4 last:border-b-0"
                  >
                    {renderPostItem(item)}
                  </div>
                ))}

              {activeTab === "Campaigns" &&
                campaigns.map((item, index) => (
                  <div
                    ref={index === campaigns.length - 1 ? lastItemElementRef : null}
                    key={`campaign-${item.id}`}
                    className="border-b border-slate-200/70 pb-4 last:border-b-0"
                  >
                    {renderCampaignItem(item)}
                  </div>
                ))}

              {activeTab === "Saved" &&
                savedItems.map((item, index) => (
                  <div
                    ref={index === savedItems.length - 1 ? lastItemElementRef : null}
                    key={`saved-${item.id}`}
                    className="border-b border-slate-200/70 pb-4 last:border-b-0"
                  >
                    {renderSavedItem(item)}
                  </div>
                ))}

              {activeTab === "Donations" &&
                donations.map((item, index) => (
                  <div
                    ref={index === donations.length - 1 ? lastItemElementRef : null}
                    key={`donation-${item.id}`}
                  >
                    {renderDonationItem(item)}
                  </div>
                ))}

              {loadingMore && (
                <div className="py-4 text-center text-sm text-slate-500">
                  Loading more...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Thread Modal for creating new posts — only on own profile */}
      {isOwnProfile && (
        <CreateThreadModal
          isOpen={isThreadModalOpen}
          onClose={() => setIsThreadModalOpen(false)}
          onSuccess={(newPost: any) => {
            setIsThreadModalOpen(false);
            setPosts((prevPosts) => [
              {
                ...newPost,
                created_at:
                  newPost?.created_at || newPost?.createdAt || new Date().toISOString(),
                author_name: localStorage.getItem("name"),
                author_role: localStorage.getItem("role"),
              },
              ...prevPosts,
            ]);
          }}
        />
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <CreateThreadModal
          isOpen={true}
          onClose={() => setEditingPost(null)}
          editMode={true}
          editPostId={String(editingPost.id)}
          initialContent={editingPost.content || ""}
          initialImage={editingPost.media_url}
          onSuccess={handleEditPostSuccess}
        />
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <CreateCampaignModal
          editMode={true}
          editCampaignId={String(editingCampaign.id)}
          initialData={{
            title: editingCampaign.title || "",
            description: editingCampaign.description || "",
            goal_amount: editingCampaign.goal_amount || editingCampaign.goal || 0,
            deadline: editingCampaign.deadline || "",
            media_url: editingCampaign.media_url || "",
          }}
          onClose={() => setEditingCampaign(null)}
          onSuccess={handleEditCampaignSuccess}
        />
      )}

      {/* Edit Profile Modal — for mobile (xl:hidden shows Edit button above) */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentName={localName || displayName}
          currentUsername={localUsername || ""}
          onSuccess={(data) => {
            setLocalName(data.name);
            setLocalUsername(data.username);
          }}
        />
      )}
    </div>
  );
}
