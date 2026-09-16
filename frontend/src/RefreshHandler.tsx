import { useEffect, type FC } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

interface RefreshHandlerProps {
  setIsAuthenticated: (val: boolean) => void;
  setIsLoading: (val: boolean) => void;
}

/**
 * Runs on every route change to keep isAuthenticated in sync.
 *
 * On initial load:
 * 1. If a token already exists in localStorage → mark as authenticated
 * 2. If no token → silently try POST /auth/refresh using the httpOnly cookie
 *    (this restores the session after the 15-min access token expires or the
 *    browser was closed, as long as the 30-day refresh token cookie is valid)
 * 3. If both fail → mark as unauthenticated, user must log in
 */
const RefreshHandler: FC<RefreshHandlerProps> = ({ setIsAuthenticated, setIsLoading }) => {
  const location = useLocation();

  useEffect(() => {
    const restoreSession = async () => {
      // ── Guard: if the user just explicitly logged out, skip all refresh
      // attempts. The logout handlers set this flag before clearing storage
      // so that the navigation-triggered re-run of this effect cannot
      // silently restore the session via the (possibly still-valid) cookie.
      if (sessionStorage.getItem("loggedOut") === "true") {
        sessionStorage.removeItem("loggedOut");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (token) {
        // Token present — trust it until an API call returns 401 (interceptor handles that)
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // No token in storage — try a silent refresh using the httpOnly cookie.
      // This is what lets users stay logged in for up to 30 days after closing the browser.
      try {
        const BASE_URL = import.meta.env.VITE_BASE_API_URL as string;
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (data.success && data.jwtToken) {
          localStorage.setItem("token", data.jwtToken);
          if (data.role)     localStorage.setItem("role",     data.role);
          if (data.name)     localStorage.setItem("name",     data.name);
          if (data.username) localStorage.setItem("username", data.username);
          if (data.userId)   localStorage.setItem("userId",   String(data.userId));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        // Cookie expired or missing — user needs to log in
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [location, setIsAuthenticated, setIsLoading]);

  return null;
};

export default RefreshHandler;
