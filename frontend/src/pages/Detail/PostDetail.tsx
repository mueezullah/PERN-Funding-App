import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Edit2,
  Pin,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { Navbar } from "../Feed/components/Navbar";
import { Sidebar } from "../Feed/components/Sidebar";
import { fetchPostById } from "../../features/Posts/postsAPI";
import { formatRelativeTime, handleError, handleSuccess } from "../../utils";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import { CommentSection } from "./CommentSection";
import { useLike } from "../../features/likes/useLike";
import { CreateThreadModal } from "../Feed/components/CreateThreadModal";
import { showMinimalToast } from "../../components/MinimalToast";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? parseInt(id, 10) : 0;
  const { liked, likesCount, toggleLike } = useLike("post", numericId);
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPostById(id);
        setPost(data);
      } catch (err: any) {
        setError(err.message || "Failed to load post details");
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
        <Navbar />
        <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
          <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative border-r border-slate-200/60">
            <Sidebar />
          </div>
          <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full p-8 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
        <Navbar />
        <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
          <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative border-r border-slate-200/60">
            <Sidebar />
          </div>
          <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full p-8 text-center flex flex-col justify-center items-center gap-4">
            <p className="text-rose-500 font-bold text-lg">{error || "Post not found"}</p>
            <button
              onClick={() => navigate("/feed")}
              className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm cursor-pointer"
            >
              Back to Feed
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentUserId = localStorage.getItem("userId");
  const isOwner = !!(currentUserId && post.user_id && String(post.user_id) === String(currentUserId));

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsMenuOpen(false);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showMinimalToast("Post Deleted");
        navigate("/feed");
      } else {
        handleError(data.message || "Failed to delete post");
      }
    } catch (err: any) {
      handleError(err.message || "Failed to delete post");
    }
  };

  const handleEditSuccess = (updatedPost: any) => {
    setIsEditModalOpen(false);
    setPost((prev: any) => ({
      ...prev,
      content: updatedPost.content,
      media_url: updatedPost.media_url,
    }));
    showMinimalToast("Post Updated");
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <Navbar />
      <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
        <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          <Sidebar />
        </div>
        <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 sm:p-8">
          <div className="w-full max-w-220 mx-auto space-y-6">
            
            {/* Header Back Link */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm cursor-pointer select-none mb-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {/* Post details card */}
            <article className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 text-left">
              
              {/* Author details & 3-dots menu */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      if (post.author_username) {
                        navigate(`/user/${post.author_username}`, { state: { name: post.author_name } });
                      }
                    }}
                  >
                    {post.author_avatar || post.user?.avatar_url ? (
                      <img
                        src={post.author_avatar || post.user?.avatar_url}
                        alt={post.author_name || "Author"}
                        className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg border border-slate-100 shadow-sm">
                        {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3
                        className="font-bold text-[16px] text-slate-900 cursor-pointer hover:underline"
                        onClick={() => {
                          if (post.author_username) {
                            navigate(`/user/${post.author_username}`, { state: { name: post.author_name } });
                          }
                        }}
                      >
                        {post.author_name}
                      </h3>
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium">
                      {post.author_username ? `@${post.author_username}` : (post.author_role || "User")} • {formatRelativeTime(post.created_at)}
                    </p>
                  </div>
                </div>

                {/* 3-dots Action Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`cursor-pointer p-2 rounded-full transition-all duration-200 ${
                      isMenuOpen
                        ? "text-indigo-600 bg-indigo-50/80 scale-105"
                        : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                    aria-label="Post actions"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-[#1a1a1b] border border-slate-700/50 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] py-2 z-50 text-[#d7dadc] animate-in fade-in slide-in-from-top-3 duration-250">
                      {isOwner ? (
                        <>
                          <button
                            onClick={handleDelete}
                            className="flex cursor-pointer items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                            <span>Delete</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsEditModalOpen(true);
                            }}
                            className="flex cursor-pointer items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-medium text-[#d7dadc] hover:bg-[#272729] transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-[#d7dadc]" />
                            <span>Edit Details</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              handleSuccess("Post pinned to your profile!");
                            }}
                            className="flex cursor-pointer items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-medium text-[#d7dadc] hover:bg-[#272729] transition-colors"
                          >
                            <Pin className="w-4 h-4 text-[#d7dadc]" />
                            <span>Pin to profile</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              handleSuccess("Thank you! This content has been reported for review.");
                            }}
                            className="flex cursor-pointer items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            <span>Report Content</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              handleSuccess(`You are now following ${post.author_name}!`);
                            }}
                            className="flex cursor-pointer items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-medium text-[#d7dadc] hover:bg-[#272729] transition-colors"
                          >
                            <UserPlus className="w-4 h-4 text-[#d7dadc]" />
                            <span>Follow Owner</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description / Content */}
              <div className="mb-6">
                <p className="text-slate-600 leading-relaxed text-[15px] sm:text-[16px] whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Post media */}
              {post.media_url && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-xs border border-slate-200/60 bg-slate-50">
                  <ImageWithFallback
                    src={post.media_url}
                    alt="Post media visual"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center space-x-2 transition-colors group px-2 py-1.5 rounded-full cursor-pointer ${
                      liked
                        ? "text-rose-500 hover:bg-rose-50"
                        : "text-slate-500 hover:text-rose-500 hover:bg-rose-50"
                    }`}
                  >
                    <Heart
                      className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90 ${
                        liked ? "fill-current" : ""
                      }`}
                    />
                    <span className="font-semibold text-[13px] sm:text-sm">
                      {likesCount}
                    </span>
                  </button>
                  <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-indigo-50">
                    <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
                  </button>
                  <button className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-emerald-50">
                    <Share2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
                  </button>
                  <button className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-amber-50">
                    <Bookmark className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
                  </button>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            {id && (
              <CommentSection targetType="post" targetId={id} />
            )}

            {/* Edit Post Modal */}
            {isEditModalOpen && (
              <CreateThreadModal
                isOpen={true}
                onClose={() => setIsEditModalOpen(false)}
                editMode={true}
                editPostId={id}
                initialContent={post.content}
                initialImage={post.media_url}
                onSuccess={handleEditSuccess}
              />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
