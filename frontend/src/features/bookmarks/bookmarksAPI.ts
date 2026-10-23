const API_BASE = `${import.meta.env.VITE_BASE_API_URL}/bookmarks`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  const authHeader = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";
  return {
    "Content-Type": "application/json",
    ...(authHeader && { Authorization: authHeader }),
  };
};

export const toggleBookmark = async (params: { postId?: number; campaignId?: number }) => {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to toggle bookmark");
  }
  return data.data as { bookmarked: boolean };
};

export const fetchBookmarks = async (page = 1, limit = 10) => {
  const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch bookmarks");
  }
  return {
    items: data.data?.items || data.data?.bookmarks || [],
    bookmarks: data.data?.items || data.data?.bookmarks || [],
    pagination: data.data?.pagination || null,
  };
};
