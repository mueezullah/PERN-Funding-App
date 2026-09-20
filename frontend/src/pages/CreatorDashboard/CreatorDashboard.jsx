import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import api from "@/lib/axiosInstance";
import { handleSuccess, handleError } from "../../utils";
import CreatorSidebar from "./components/CreatorSidebar";
import CreatorHeader from "./components/CreatorHeader";
import CreatorOverviewTab from "./components/CreatorOverviewTab";
import CreatorCampaignsTab from "./components/CreatorCampaignsTab";
import CreatorDonationsTab from "./components/CreatorDonationsTab";
import CreatorCommunityTab from "./components/CreatorCommunityTab";
import CreateCampaignModal from "./CreateCampaignModal";

const CreatorDashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modal states for Create / Edit campaign
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const name = localStorage.getItem("name") || "";
  const username = localStorage.getItem("username") || "";
  const avatar = localStorage.getItem("avatar") || "";
  const userId = localStorage.getItem("userId");

  // Fetch creator analytics
  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.get("/campaigns/creator/analytics");
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError(response.data.message || "Failed to load creator analytics");
      }
    } catch (err) {
      console.error("Failed to load creator analytics:", err);
      setError("Using offline data calculation");

      // Fallback: fetch user's campaigns directly
      try {
        if (userId) {
          const fallbackRes = await api.get(`/campaigns/user/${userId}?limit=50`);
          if (fallbackRes.data.success) {
            const userCampaigns = fallbackRes.data.data.campaigns || [];
            const totalRaised = userCampaigns.reduce(
              (acc, c) => acc + (parseFloat(c.current_amount) || 0),
              0
            );
            const totalGoal = userCampaigns.reduce(
              (acc, c) => acc + (parseFloat(c.goal_amount) || 0),
              0
            );
            const activeCount = userCampaigns.filter((c) => {
              return c.status === "active" && new Date(c.deadline) > new Date();
            }).length;
            const fundedCount = userCampaigns.filter(
              (c) => (parseFloat(c.current_amount) || 0) >= (parseFloat(c.goal_amount) || 1)
            ).length;

            setAnalytics({
              financials: {
                totalRaised,
                totalGoal,
                totalDonationsCount: 0,
                averageDonation: 0,
                totalRefunded: 0,
                refundedCount: 0,
                pendingCount: 0,
                overallGoalReachedPercent:
                  totalGoal > 0 ? Math.min(Math.round((totalRaised / totalGoal) * 100), 100) : 0,
              },
              campaigns: {
                total: userCampaigns.length,
                active: activeCount,
                ended: userCampaigns.length - activeCount,
                funded: fundedCount,
                successRate: userCampaigns.length > 0 ? Math.round((fundedCount / userCampaigns.length) * 100) : 0,
                list: userCampaigns.map((c) => ({
                  id: c.id,
                  title: c.title,
                  description: c.description,
                  goal_amount: parseFloat(c.goal_amount) || 0,
                  current_amount: parseFloat(c.current_amount) || 0,
                  deadline: c.deadline,
                  status: c.status,
                  pinned_at: c.pinned_at,
                  media_url: c.media_url,
                  progress_percent:
                    c.goal_amount > 0
                      ? Math.min(Math.round(((c.current_amount || 0) / c.goal_amount) * 100), 100)
                      : 0,
                })),
              },
              community: {
                followersCount: 0,
                followingCount: 0,
                postsCount: 0,
                likesReceived: 0,
                commentsReceived: 0,
              },
              trends: [
                { name: "Month 1", month: "Oct", revenue: 0, donations: 0, campaigns: 0 },
                { name: "Month 2", month: "Nov", revenue: 0, donations: 0, campaigns: 0 },
                { name: "Month 3", month: "Dec", revenue: 0, donations: 0, campaigns: 0 },
                { name: "Month 4", month: "Jan", revenue: 0, donations: 0, campaigns: 0 },
                { name: "Month 5", month: "Feb", revenue: 0, donations: 0, campaigns: 0 },
                { name: "Current", month: "Mar", revenue: totalRaised, donations: 0, campaigns: userCampaigns.length },
              ],
              donationTiers: [
                { label: "Micro ($1 - $25)", range: "1-25", count: 0, totalAmount: 0, color: "#38bdf8", percentageOfDonations: 0, percentageOfRevenue: 0 },
                { label: "Standard ($25 - $100)", range: "25-100", count: 0, totalAmount: 0, color: "#00aff0", percentageOfDonations: 0, percentageOfRevenue: 0 },
                { label: "Enthusiast ($100 - $500)", range: "100-500", count: 0, totalAmount: 0, color: "#018cf1", percentageOfDonations: 0, percentageOfRevenue: 0 },
                { label: "VIP ($500+)", range: "500+", count: 0, totalAmount: 0, color: "#0271c2", percentageOfDonations: 0, percentageOfRevenue: 0 },
              ],
              recentDonations: [],
            });
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Handle Logout
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

  // Handle Pin Campaign
  const handlePinCampaign = async (campaignId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/campaigns/${campaignId}/pin`, {
        method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleSuccess(data.data?.is_pinned ? "Campaign pinned to profile" : "Campaign unpinned from profile");
        fetchAnalytics(true);
      } else {
        handleError(data.message || "Failed to update pin status");
      }
    } catch (err) {
      console.error(err);
      handleError("Network error pinning campaign");
    }
  };

  // Handle Delete Campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign? Backers will be refunded if active.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleSuccess("Campaign deleted successfully");
        fetchAnalytics(true);
      } else {
        handleError(data.message || "Failed to delete campaign");
      }
    } catch (err) {
      console.error(err);
      handleError("Network error deleting campaign");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background font-sans overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- SIDEBAR --- */}
      <CreatorSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onCreateCampaignClick={() => setCreateModalOpen(true)}
        username={username}
      />

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CreatorHeader
          activeView={activeView}
          name={name}
          avatar={avatar}
          handleFeedClick={() => navigate("/feed")}
          handleLogout={handleLogout}
          setSidebarOpen={setSidebarOpen}
          onCreateCampaignClick={() => setCreateModalOpen(true)}
        />

        {/* --- SCROLLABLE TAB CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeView === "dashboard" && (
            <CreatorOverviewTab
              analytics={analytics}
              loading={loading}
              refreshing={refreshing}
              error={error}
              onRefresh={() => fetchAnalytics(true)}
              onCreateCampaignClick={() => setCreateModalOpen(true)}
              onViewCampaignsClick={() => setActiveView("campaigns")}
            />
          )}

          {activeView === "campaigns" && (
            <CreatorCampaignsTab
              campaigns={analytics?.campaigns?.list || []}
              loading={loading}
              onCreateClick={() => setCreateModalOpen(true)}
              onEditClick={(campaign) => setEditingCampaign(campaign)}
              onDeleteClick={handleDeleteCampaign}
              onPinClick={handlePinCampaign}
            />
          )}

          {activeView === "backers" && (
            <CreatorDonationsTab
              donations={analytics?.recentDonations || []}
              totalRaised={analytics?.financials?.totalRaised || 0}
              totalDonationsCount={analytics?.financials?.totalDonationsCount || 0}
            />
          )}

          {activeView === "community" && (
            <CreatorCommunityTab
              community={
                analytics?.community || {
                  followersCount: 0,
                  followingCount: 0,
                  postsCount: 0,
                  likesReceived: 0,
                  commentsReceived: 0,
                }
              }
              username={username}
            />
          )}
        </main>
      </div>

      {/* --- CREATE CAMPAIGN MODAL OVERLAY --- */}
      {createModalOpen && (
        <CreateCampaignModal
          editMode={false}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            setCreateModalOpen(false);
            fetchAnalytics(true);
          }}
        />
      )}

      {/* --- EDIT CAMPAIGN MODAL OVERLAY --- */}
      {editingCampaign && (
        <CreateCampaignModal
          editMode={true}
          editCampaignId={editingCampaign.id}
          initialData={{
            title: editingCampaign.title,
            description: editingCampaign.description || "",
            goal_amount: editingCampaign.goal_amount,
            deadline: editingCampaign.deadline,
            media_url: editingCampaign.media_url,
          }}
          onClose={() => setEditingCampaign(null)}
          onSuccess={() => {
            setEditingCampaign(null);
            fetchAnalytics(true);
          }}
        />
      )}
    </div>
  );
};

export default CreatorDashboard;
