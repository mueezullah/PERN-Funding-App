import { useState, useEffect } from "react";

export interface AuthState {
  role: string | null;
  username: string | null;
  userId: string | null;
  name: string | null;
  avatar: string | null;
  canAccessCreatorDashboard: boolean;
  canSeeMyCampaigns: boolean;
}

export function useAuth(): AuthState {
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("role"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("username"));
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem("userId"));
  const [name, setName] = useState<string | null>(() => localStorage.getItem("name"));
  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem("avatar"));

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role"));
      setUsername(localStorage.getItem("username"));
      setUserId(localStorage.getItem("userId"));
      setName(localStorage.getItem("name"));
      setAvatar(localStorage.getItem("avatar"));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("avatarChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("avatarChange", handleStorageChange);
    };
  }, []);

  const normalizedRole = (role || "").toLowerCase();
  const canAccessCreatorDashboard = normalizedRole === "fundraiser" || normalizedRole === "admin";
  const canSeeMyCampaigns = normalizedRole === "fundraiser" || normalizedRole === "admin";

  return {
    role: normalizedRole || null,
    username,
    userId,
    name,
    avatar,
    canAccessCreatorDashboard,
    canSeeMyCampaigns,
  };
}
