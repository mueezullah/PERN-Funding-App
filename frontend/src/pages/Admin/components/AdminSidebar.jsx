import React from "react";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CreditCard,
  ShieldCheck,
  Settings,
  Home,
  X,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";

const sidebarItems = [
  { key: "dashboard", label: "Executive Command", icon: LayoutDashboard },
  { key: "users", label: "Users & Roles", icon: Users },
  { key: "campaigns", label: "Campaigns Moderation", icon: Megaphone },
  { key: "donations", label: "Financial Ledger", icon: CreditCard },
  { key: "kyc", label: "KYC Queue", icon: ShieldCheck },
  { key: "settings", label: "Settings & Config", icon: Settings },
];

const SidebarNav = ({ activeView, setActiveView, setSidebarOpen }) => (
  <div className="flex flex-col h-full justify-between">
    <div>
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 shrink-0 px-5 bg-indigo-950 text-white border-b border-indigo-900/50">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tight text-white">
            OnlyFunds<span className="text-indigo-400">.</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 border border-purple-700/50">
            Admin
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white hover:text-indigo-300 cursor-pointer p-1"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="px-3 py-4 space-y-1.5">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveView(item.key);
              setSidebarOpen(false);
            }}
            className={`w-full group flex items-center px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeView === item.key
                ? "bg-indigo-800 text-white shadow-sm shadow-indigo-950"
                : "text-indigo-200 hover:bg-indigo-800/50 hover:text-white"
            }`}
          >
            <item.icon
              className={`mr-3 h-4 w-4 ${
                activeView === item.key ? "text-indigo-300" : "text-indigo-400 group-hover:text-indigo-200"
              }`}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>

    {/* Bottom Section */}
    <div className="p-3 border-t border-indigo-900/40 space-y-1">
      <Link
        to="/feed"
        className="w-full flex items-center px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-800/40 hover:text-white rounded-xl transition-colors"
      >
        <Home className="mr-3 h-4 w-4 text-indigo-400" />
        <span>Return to Feed</span>
      </Link>

      <div className="pt-2 px-2 flex items-center gap-2 text-[11px] text-indigo-300/70">
        <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
        <span>Root Admin Permissions</span>
      </div>
    </div>
  </div>
);

const AdminSidebar = ({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
}) => {
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-64 h-full bg-indigo-950 shadow-2xl z-50 animate-slide-in">
            <SidebarNav
              activeView={activeView}
              setActiveView={setActiveView}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <div className="flex flex-col w-64 bg-indigo-950 border-r border-indigo-900/40">
          <SidebarNav
            activeView={activeView}
            setActiveView={setActiveView}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
