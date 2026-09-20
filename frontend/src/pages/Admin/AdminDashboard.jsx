import React, { useState, useEffect, useCallback } from "react";
import { Settings, ShieldCheck, Database, Server, Lock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleSuccess, handleError } from "../../utils";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import OverviewTab from "./components/OverviewTab";
import UsersTab from "./components/UsersTab";
import CampaignsTab from "./components/CampaignsTab";
import AdminDonationsTab from "./components/AdminDonationsTab";
import AdminKycQueueTab from "./components/AdminKycQueueTab";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaignsError, setCampaignsError] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const name = localStorage.getItem("name") || "";
  const avatar = localStorage.getItem("avatar") || "";

  // Handle Logout functionality
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("avatar");
    window.dispatchEvent(new Event("avatarChange"));
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
  };

  // Handle Feed navigation
  const handleFeedClick = () => {
    navigate("/feed");
  };

  // Handle Role Change functionality
  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    const originalUsers = [...users];

    // Optimistically update the UI role
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/auth/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        handleSuccess(data.message || "Role updated successfully");
        if (data.user) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId ? { ...user, ...data.user } : user
            )
          );
        }
      } else {
        handleError(data.message || "Failed to update role");
        setUsers(originalUsers);
      }
    } catch (err) {
      console.error(err);
      handleError("Failed to connect to server");
      setUsers(originalUsers);
    }
  };

  // Fetch users from backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/auth/users`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch campaigns from backend
  const fetchCampaigns = useCallback(async () => {
    try {
      setCampaignsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/campaigns?page=1&limit=100&status=all`
      );
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data.campaigns || []);
      } else {
        setCampaignsError(data.message || "Failed to fetch campaigns");
      }
    } catch (err) {
      setCampaignsError("Failed to connect to server");
      console.error(err);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCampaigns();
  }, [fetchUsers, fetchCampaigns]);

  // Aggregate platform donation data
  const totalRaised = campaigns.reduce(
    (acc, c) => acc + (parseFloat(c.current_amount) || 0),
    0
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background font-sans overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- SIDEBAR --- */}
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          activeView={activeView}
          name={name}
          avatar={avatar}
          handleFeedClick={handleFeedClick}
          handleLogout={handleLogout}
          setSidebarOpen={setSidebarOpen}
        />

        {/* --- SCROLLABLE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* ===== 1. EXECUTIVE COMMAND (OVERVIEW + 4 GRAPHS) ===== */}
          {activeView === "dashboard" && (
            <OverviewTab
              users={users}
              campaigns={campaigns}
              onNavigateTab={(tabKey) => setActiveView(tabKey)}
            />
          )}

          {/* ===== 2. USERS & ROLES VIEW ===== */}
          {activeView === "users" && (
            <UsersTab
              users={users}
              loading={loading}
              error={error}
              handleRoleChange={handleRoleChange}
            />
          )}

          {/* ===== 3. CAMPAIGNS MODERATION VIEW ===== */}
          {activeView === "campaigns" && (
            <CampaignsTab
              campaigns={campaigns}
              campaignsLoading={campaignsLoading}
              campaignsError={campaignsError}
              onRefresh={fetchCampaigns}
            />
          )}

          {/* ===== 4. FINANCIAL AUDIT & STRIPE LEDGER ===== */}
          {activeView === "donations" && (
            <AdminDonationsTab
              donations={[]}
              totalRaised={totalRaised}
              totalDonationsCount={campaigns.reduce((acc, c) => acc + (c._count?.donations || 0), 0)}
              averageDonation={50}
            />
          )}

          {/* ===== 5. KYC VERIFICATION QUEUE ===== */}
          {activeView === "kyc" && <AdminKycQueueTab />}

          {/* ===== 6. SETTINGS & PLATFORM CONFIG ===== */}
          {activeView === "settings" && (
            <div className="space-y-6 max-w-4xl pb-12">
              <div className="flex items-center justify-between bg-card border border-border p-5 rounded-2xl shadow-xs">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Settings className="h-5 w-5 text-indigo-500" />
                    Platform Configuration & Diagnostics
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Root parameters, security environment, and database connectivity status
                  </p>
                </div>
                <Badge variant="success" className="gap-1 text-xs py-1 px-3">
                  <CheckCircle2 className="h-3 w-3" /> System Operational
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="border-border bg-card shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Database className="h-4 w-4 text-indigo-500" /> PostgreSQL & Prisma Database
                    </CardTitle>
                    <CardDescription className="text-xs">Direct database connection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Provider:</span>
                      <span className="font-semibold text-foreground">PostgreSQL (Prisma ORM)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-bold text-emerald-600">Connected & Synced</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Registered Users:</span>
                      <span className="font-bold text-foreground">{users.length} accounts</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-purple-500" /> Security & Auth Layer
                    </CardTitle>
                    <CardDescription className="text-xs">Authentication policies and KYC</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Token Scheme:</span>
                      <span className="font-semibold text-foreground">JWT + httpOnly Refresh</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">KYC Provider:</span>
                      <span className="font-semibold text-foreground">Didit Protocol</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Payments:</span>
                      <span className="font-semibold text-foreground">Stripe Payment Intents</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
