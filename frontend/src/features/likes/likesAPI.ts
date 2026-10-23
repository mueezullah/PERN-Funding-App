import api from "@/lib/axiosInstance";

export const toggleLike = async (targetType: string, targetId: number) => {
  const res = await api.post("/likes/toggle", { targetType, targetId });
  const data = res.data;
  if (!data || !data.success) {
    throw new Error(data?.message || "Failed to toggle like");
  }
  return data.data as { liked: boolean; likesCount: number };
};

export const fetchLikeStatus = async (targetType: string, targetId: number) => {
  const res = await api.get(`/likes/status?targetType=${targetType}&targetId=${targetId}`);
  const data = res.data;
  if (!data || !data.success) {
    throw new Error(data?.message || "Failed to fetch like status");
  }
  return data.data as { liked: boolean; likesCount: number };
};
