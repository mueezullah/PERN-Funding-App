import React from "react";
import {
  Home,
  Bookmark,
  Megaphone,
  User,
  Hash,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { clsx } from "clsx";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export function Sidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { username, canAccessCreatorDashboard, canSeeMyCampaigns } = useAuth();
  const currentUsername = username || localStorage.getItem("username") || "";

  const role = (localStorage.getItem("role") || "").toLowerCase();
  const isAdmin = role === "admin";

  const items = [
    { name: "Home", icon: Home, path: "/feed" },
    { name: "Explore", icon: Hash, path: "/explore" },
    { name: "Bookmarks", icon: Bookmark, path: `/user/${currentUsername}?tab=Saved` },
    ...(canSeeMyCampaigns
      ? [{ name: "My Campaigns", icon: Megaphone, path: `/user/${currentUsername}?tab=Campaigns` }]
      : []),
    { name: "Profile", icon: User, path: `/user/${currentUsername}` },
    ...(canAccessCreatorDashboard
      ? [{ name: "Creator Dashboard", icon: LayoutDashboard, path: "/creator/dashboard" }]
      : []),
    ...(isAdmin
      ? [{ name: "Admin Dashboard", icon: Shield, path: "/admin/dashboard" }]
      : []),
  ];

  return (
    <div className="w-full h-full py-8 pr-2 pl-2 flex flex-col justify-between">
      <nav className="space-y-1 pb-6">
        {items.map((item) => {
          const isProfileTab = item.path.includes("?tab=");
          const isActive = isProfileTab
            ? currentPath + location.search === item.path
            : item.name === "Profile"
            ? currentPath.startsWith("/user/") && !location.search
            : currentPath === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onMobileClose}
              className={clsx(
                "flex items-center space-x-4 px-3 py-3.5 rounded-2xl text-[15px] transition-all group",
                isActive
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60 font-semibold"
                  : "text-slate-600 hover:bg-white hover:shadow-sm hover:border hover:border-slate-200/60 hover:text-slate-900 font-medium border border-transparent"
              )}
            >
              <item.icon
                className={clsx(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-indigo-500"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Copyright & Footer */}
      <div className="pt-4 px-3 border-t border-slate-200/60 text-xs text-slate-400 space-y-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition-colors">About</Link>
          <span>•</span>
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
          © {new Date().getFullYear()} OnlyFunds.
          <br />
          All rights reserved.
        </p>
      </div>
    </div>
  );
}