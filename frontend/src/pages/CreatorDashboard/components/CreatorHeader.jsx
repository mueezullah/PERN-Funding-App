import React from "react";
import { Menu, Home, LogOut, PlusCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CreatorHeader = ({
  activeView,
  name,
  avatar,
  handleFeedClick,
  handleLogout,
  setSidebarOpen,
  onCreateCampaignClick,
}) => {
  return (
    <header className="bg-card border-b border-border shadow-xs z-10 sticky top-0">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center gap-3">
        {/* Left: Mobile hamburger & Active Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              {activeView === "dashboard"
                ? "Creator Studio"
                : activeView === "campaigns"
                ? "My Campaigns"
                : activeView === "backers"
                ? "Backers & Ledger"
                : "Community & Updates"}
            </h1>
          </div>
        </div>

        {/* Right: Quick actions and Creator Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Creator Profile Chip */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border border-border">
            {avatar ? (
              <img
                src={avatar}
                alt={name || "Creator"}
                className="h-6 w-6 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                {(name || "C").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-bold text-foreground truncate max-w-[120px]">
              {name || "Creator"}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>

          {/* Quick Create CTA */}
          <button
            onClick={onCreateCampaignClick}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all cursor-pointer gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Campaign</span>
          </button>

          {/* Feed Navigation */}
          <button
            onClick={handleFeedClick}
            className="inline-flex items-center px-3 py-1.5 border border-border text-xs font-semibold rounded-xl text-foreground bg-background hover:bg-muted transition-colors cursor-pointer gap-1.5"
            title="Return to Public Feed"
          >
            <Home className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden md:inline">Feed</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center p-2 sm:px-3 sm:py-1.5 border border-transparent text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer gap-1.5"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default CreatorHeader;
