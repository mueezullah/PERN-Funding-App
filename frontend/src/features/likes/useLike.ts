import { useState, useEffect, useCallback } from "react";
import * as likesAPI from "./likesAPI";
import { showMinimalToast } from "../../components/MinimalToast";

export function useLike(targetType: string, targetId: number) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch initial like status on mount
  useEffect(() => {
    if (!targetId || targetId <= 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const data = await likesAPI.fetchLikeStatus(targetType, targetId);
        if (!cancelled) {
          setLiked(data.liked);
          setLikesCount(data.likesCount);
        }
      } catch (err) {
        console.error("Failed to load like status:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  // Toggle like with optimistic update
  const toggleLike = useCallback(async () => {
    if (!targetId || targetId <= 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showMinimalToast(`Please log in to like this ${targetType}`);
      return;
    }

    const prevLiked = liked;
    const prevCount = likesCount;

    // Optimistic update
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const data = await likesAPI.toggleLike(targetType, targetId);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err: any) {
      // Revert on failure
      setLiked(prevLiked);
      setLikesCount(prevCount);
      console.error("Failed to toggle like:", err);
      showMinimalToast(err?.response?.data?.message || err?.message || "Failed to update like");
    }
  }, [liked, likesCount, targetType, targetId]);

  return { liked, likesCount, loading, toggleLike };
}
