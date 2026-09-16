import React, { useState, useRef, useMemo } from "react";
import { Send, MessageSquare, Trash2, Reply, X, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import { useComments } from "../../features/comments/useComments";
import { formatRelativeTime, handleError } from "../../utils";

interface CommentSectionProps {
  id?: number;
  content?: string;
  created_at?: string;
  targetType: "campaign" | "post";
  targetId: string | number;
}

interface CommentItem {
  id: number | string;
  user_id: number;
  target_type: string;
  target_id: number;
  parent_id?: number | null;
  content: string;
  created_at: string;
  author_name?: string;
  author_username?: string;
  author_role?: string;
  author_avatar?: string;
  reply_to_name?: string;
  reply_to_username?: string;
}

interface ReplyingTarget {
  id: number;
  author_name: string;
  author_username?: string;
  rootId?: number;
}

export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { comments, loading, error, addComment, removeComment } = useComments(
    targetType,
    targetId
  ) as {
    comments: CommentItem[];
    loading: boolean;
    error: string | null;
    addComment: (content: string, parentId?: number | null) => Promise<void>;
    removeComment: (commentId: number) => Promise<void>;
  };

  const currentUserId = localStorage.getItem("userId")
    ? parseInt(localStorage.getItem("userId")!, 10)
    : null;
  const userRole = localStorage.getItem("role");

  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ReplyingTarget | null>(null);
  const [collapsedReplies, setCollapsedReplies] = useState<Record<number, boolean>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  // Group comments into root comments and their child replies
  const { rootComments, repliesMap, totalCount } = useMemo(() => {
    const roots: CommentItem[] = [];
    const replies: Record<number, CommentItem[]> = {};

    comments.forEach((c) => {
      if (!c.parent_id) {
        roots.push(c);
      } else {
        const pId = Number(c.parent_id);
        if (!replies[pId]) replies[pId] = [];
        replies[pId].push(c);
      }
    });

    return {
      rootComments: roots,
      repliesMap: replies,
      totalCount: comments.length,
    };
  }, [comments]);

  const toggleReplies = (commentId: number) => {
    setCollapsedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const startReply = (comment: CommentItem, rootId?: number) => {
    const targetRootId = rootId || (typeof comment.id === "number" ? comment.id : undefined);
    setReplyingTo({
      id: typeof comment.id === "number" ? comment.id : 0,
      author_name: comment.author_name || "User",
      author_username: comment.author_username,
      rootId: targetRootId,
    });

    // Automatically expand replies for this root comment
    if (targetRootId) {
      setCollapsedReplies((prev) => ({
        ...prev,
        [targetRootId]: false,
      }));
    }

    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this comment?")) return;
    try {
      await removeComment(commentId);
    } catch (err: any) {
      handleError(err.message || "Failed to delete comment");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // If replying, send the parent_id
      const parentIdToSend = replyingTo ? replyingTo.id : null;
      await addComment(trimmed, parentIdToSend);
      setInputText("");
      setReplyingTo(null);
    } catch (err: any) {
      handleError(err.message || "Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-[560px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
          Comments ({totalCount})
        </h3>
        {totalCount > 0 && (
          <span className="text-xs text-slate-400 font-medium">
            {rootComments.length} {rootComments.length === 1 ? "thread" : "threads"}
          </span>
        )}
      </div>

      {/* Comment & Reply List */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/30">
        {loading && comments.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded-md w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 font-medium text-sm">{error}</div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
            <MessageSquare className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-[14px] font-semibold">No comments yet</p>
            <p className="text-[12px] mt-1 text-slate-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          rootComments.map((root) => {
            const rootNumId = typeof root.id === "number" ? root.id : 0;
            const isRootTemp = String(root.id).startsWith("temp_");
            const replies = repliesMap[rootNumId] || [];
            const isCollapsed = collapsedReplies[rootNumId];
            const canDeleteRoot =
              !isRootTemp && (currentUserId === root.user_id || userRole === "admin");

            return (
              <div key={root.id} className="space-y-3">
                {/* ─── ROOT COMMENT ─────────────────────────────────────────── */}
                <div
                  className={`flex gap-3 text-left transition-opacity duration-300 ${
                    isRootTemp ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-slate-100 shadow-xs">
                    {root.author_avatar ? (
                      <img
                        src={root.author_avatar}
                        alt={root.author_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (root.author_name ? root.author_name.charAt(0).toUpperCase() : "U")
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-[13.5px]">
                          {root.author_name}
                        </span>
                        {root.author_username && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            @{root.author_username}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium select-none">
                          • {formatRelativeTime(root.created_at)}
                        </span>
                      </div>

                      {/* Delete button if comment owner or admin */}
                      {canDeleteRoot && (
                        <button
                          onClick={() => handleDelete(Number(root.id))}
                          className="text-slate-400 hover:text-rose-500 transition-colors duration-150 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-[13.5px] text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">
                      {root.content}
                    </p>

                    {/* Actions bar: Reply button & Show/Hide replies toggle */}
                    <div className="flex items-center gap-4 mt-2">
                      {!isRootTemp && (
                        <button
                          type="button"
                          onClick={() => startReply(root, rootNumId)}
                          className="flex items-center gap-1.5 text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer active:scale-95"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          Reply
                        </button>
                      )}

                      {replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleReplies(rootNumId)}
                          className="flex items-center gap-1 text-[11.5px] font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          {isCollapsed ? (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              View {replies.length} {replies.length === 1 ? "reply" : "replies"}
                            </>
                          ) : (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Hide {replies.length === 1 ? "reply" : "replies"}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── NESTED REPLIES ───────────────────────────────────────── */}
                {replies.length > 0 && !isCollapsed && (
                  <div className="ml-5 sm:ml-7 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-3 pt-1">
                    {replies.map((reply) => {
                      const isReplyTemp = String(reply.id).startsWith("temp_");
                      const canDeleteReply =
                        !isReplyTemp &&
                        (currentUserId === reply.user_id || userRole === "admin");

                      return (
                        <div
                          key={reply.id}
                          className={`flex gap-3 text-left transition-opacity duration-300 ${
                            isReplyTemp ? "opacity-60" : "opacity-100"
                          }`}
                        >
                          {/* Reply Avatar */}
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[11px] shrink-0 border border-slate-100 shadow-xs">
                            {reply.author_avatar ? (
                              <img
                                src={reply.author_avatar}
                                alt={reply.author_name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              (reply.author_name ? reply.author_name.charAt(0).toUpperCase() : "U")
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 text-[13px]">
                                  {reply.author_name}
                                </span>
                                {reply.author_username && (
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    @{reply.author_username}
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400 font-medium select-none">
                                  • {formatRelativeTime(reply.created_at)}
                                </span>
                              </div>

                              {/* Delete button if reply owner or admin */}
                              {canDeleteReply && (
                                <button
                                  onClick={() => handleDelete(Number(reply.id))}
                                  className="text-slate-400 hover:text-rose-500 transition-colors duration-150 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                                  title="Delete reply"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Reply mention context */}
                            {reply.reply_to_username && (
                              <p className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                                <CornerDownRight className="w-3 h-3 text-slate-400" />
                                Replying to @{reply.reply_to_username}
                              </p>
                            )}

                            <p className="text-[13px] text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">
                              {reply.content}
                            </p>

                            {/* Reply to this reply */}
                            {!isReplyTemp && (
                              <button
                                type="button"
                                onClick={() => startReply(reply, rootNumId)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer mt-1.5 active:scale-95"
                              >
                                <Reply className="w-3 h-3" />
                                Reply
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Replying banner indicator */}
      {replyingTo && (
        <div className="bg-indigo-50 border-t border-indigo-100 px-5 py-2 flex items-center justify-between text-xs text-indigo-900 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">
              Replying to{" "}
              <strong className="text-indigo-700">
                {replyingTo.author_name} {replyingTo.author_username ? `(@${replyingTo.author_username})` : ""}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={cancelReply}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-indigo-100/60 transition-colors cursor-pointer ml-2 shrink-0"
            title="Cancel reply"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sticky Comment / Reply input bar */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white border-t border-slate-200/80 p-4 shrink-0 flex items-center gap-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            replyingTo
              ? `Write a reply to @${replyingTo.author_username || replyingTo.author_name}...`
              : "Add a comment..."
          }
          className="
            flex-1 h-10 px-4 rounded-full
            bg-slate-50 border border-slate-200/80
            text-[13.5px] text-slate-800 placeholder-slate-400
            outline-none
            focus:border-indigo-500/50 focus:bg-white
            transition-all duration-200
          "
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className={`
            h-10 px-5 flex items-center justify-center gap-2 rounded-full font-bold text-[13px]
            transition-all duration-200
            cursor-pointer
            ${
              inputText.trim() && !isSubmitting
                ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-sm"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>{replyingTo ? "Reply" : "Post"}</span>
              <Send size={12} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
