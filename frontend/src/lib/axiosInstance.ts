import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_API_URL as string;

/**
 * Centralized Axios instance for all API calls.
 *
 * Features:
 * - Automatically attaches the Authorization header from localStorage
 * - On 401 → silently calls POST /auth/refresh using the httpOnly cookie
 * - If refresh succeeds → retries the original request with the new token
 * - If refresh fails → clears localStorage and redirects to /login
 */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // CRITICAL: sends the httpOnly refresh token cookie cross-origin
});

// ─── Request interceptor ─────────────────────────────────────────────────────
// Attach the access token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
// On 401 → try a silent token refresh before giving up
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

// If multiple requests fail at once, queue them and replay after refresh
const processQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 errors that haven't already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh endpoint — the httpOnly cookie is sent automatically
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken: string = data.jwtToken;
        localStorage.setItem("token", newToken);
        if (data.role)     localStorage.setItem("role",     data.role);
        if (data.name)     localStorage.setItem("name",     data.name);
        if (data.username) localStorage.setItem("username", data.username);
        if (data.userId)   localStorage.setItem("userId",   String(data.userId));

        // Update the Authorization header and replay the queue
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        // Retry the original failed request
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token is also expired/invalid → force re-login
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("avatar");
        window.dispatchEvent(new Event("avatarChange"));
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
