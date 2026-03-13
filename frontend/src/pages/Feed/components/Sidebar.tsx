import React from "react";
import {
  Home,
  Bookmark,
  Users,
  Megaphone,
  Bell,
  User,
  Hash,
} from "lucide-react";
import { clsx } from "clsx";

export function Sidebar() {
  const items = [
    { name: "Home", icon: Home, active: true },
    { name: "Explore", icon: Hash },
    { name: "Bookmarks", icon: Bookmark },
    { name: "Communities", icon: Users },
    { name: "My Campaigns", icon: Megaphone },
    { name: "Notifications", icon: Bell },
    { name: "Profile", icon: User },

    { name: "Home", icon: Home, active: true },
    { name: "Explore", icon: Hash },
    { name: "Bookmarks", icon: Bookmark },
    { name: "Communities", icon: Users },
    { name: "My Campaigns", icon: Megaphone },
    { name: "Notifications", icon: Bell },
    { name: "Profile", icon: User },

  ];

  return (
    <div className="w-full h-full py-8 pr-2 pl-2">
      <nav className="space-y-1 pb-6">
        {items.map((item) => (
          <a
            key={item.name}
            href="#"
            className={clsx(
              "flex items-center space-x-4 px-3 py-3.5 rounded-2xl text-[15px] transition-all group",
              item.active
                ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60 font-semibold"
                : "text-slate-600 hover:bg-white hover:shadow-sm hover:border hover:border-slate-200/60 hover:text-slate-900 font-medium border border-transparent",
            )}
          >
            <item.icon
              className={clsx(
                "w-5 h-5 transition-transform group-hover:scale-110",
                item.active
                  ? "text-indigo-600"
                  : "text-slate-400 group-hover:text-indigo-500",
              )}
            />
            <span>{item.name}</span>
          </a>
        ))}
        
      </nav>
    </div>
  );
}