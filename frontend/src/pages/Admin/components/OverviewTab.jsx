import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Megaphone,
  ShieldCheck,
  RotateCw,
  Award,
  CreditCard,
  PieChart,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatMetricCard from "./StatMetricCard";
import RevenueTrendChart from "./RevenueTrendChart";
import CampaignGoalLeaderboard from "./CampaignGoalLeaderboard";
import AdminDonationTiersChart from "./AdminDonationTiersChart";
import KycAndCommunityCard from "./KycAndCommunityCard";
import RecentDonationsTable from "./RecentDonationsTable";
import api from "@/lib/axiosInstance";

const OverviewTab = ({ users = [], campaigns = [], onNavigateTab }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.get("/admin/analytics");
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError(response.data.message || "Failed to load analytics");
      }
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
      setError("Using live calculating fallback");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Fallbacks if API data isn't returned
  const activeCampaignsCount = campaigns.filter((c) => {
    const now = new Date();
    const deadline = new Date(c.deadline);
    return c.status === "active" && deadline > now;
  }).length;

  const totalRaisedFallback = campaigns.reduce(
    (acc, c) => acc + (parseFloat(c.current_amount) || 0),
    0
  );

  const kycVerifiedFallback = users.filter((u) => u.kyc_verified).length;

  const data = analytics || {
    financials: {
      totalRaised: totalRaisedFallback,
      totalDonationsCount: 0,
      averageDonation: 0,
      totalRefunded: 0,
      refundedCount: 0,
      pendingCount: 0,
      totalGoal: campaigns.reduce((acc, c) => acc + (parseFloat(c.goal_amount) || 0), 0),
    },
    campaigns: {
      total: campaigns.length,
      active: activeCampaignsCount,
      ended: campaigns.length - activeCampaignsCount,
      funded: campaigns.filter((c) => (parseFloat(c.current_amount) || 0) >= (parseFloat(c.goal_amount) || 1)).length,
      successRate: campaigns.length > 0
        ? Math.round((campaigns.filter((c) => (parseFloat(c.current_amount) || 0) >= (parseFloat(c.goal_amount) || 1)).length / campaigns.length) * 100)
        : 0,
      topCampaigns: campaigns.slice(0, 5).map((c) => ({
        id: c.id,
        title: c.title,
        goal_amount: parseFloat(c.goal_amount) || 0,
        current_amount: parseFloat(c.current_amount) || 0,
        status: c.status,
        owner_name: c.owner_name || "Creator",
        owner_username: c.owner_username || "",
        donations_count: 0,
        progress_percent: c.goal_amount > 0 ? Math.min(Math.round(((c.current_amount || 0) / c.goal_amount) * 100), 100) : 0,
      })),
    },
    users: {
      total: users.length,
      kycVerified: kycVerifiedFallback,
      kycUnverified: Math.max(users.length - kycVerifiedFallback, 0),
      roles: {
        user: users.filter((u) => u.role === "user").length,
        fundraiser: users.filter((u) => u.role === "fundraiser").length,
        admin: users.filter((u) => u.role === "admin").length,
        moderator: users.filter((u) => u.role === "moderator").length,
      },
    },
    engagement: {
      posts: 0,
      comments: 0,
      likes: 0,
    },
    trends: [
      { name: "Month 1", month: "Oct", revenue: 0, donations: 0, campaigns: 0, users: 0 },
      { name: "Month 2", month: "Nov", revenue: 0, donations: 0, campaigns: 0, users: 0 },
      { name: "Month 3", month: "Dec", revenue: 0, donations: 0, campaigns: 0, users: 0 },
      { name: "Month 4", month: "Jan", revenue: 0, donations: 0, campaigns: 0, users: 0 },
      { name: "Month 5", month: "Feb", revenue: 0, donations: 0, campaigns: 0, users: 0 },
      { name: "Current", month: "Mar", revenue: totalRaisedFallback, donations: 0, campaigns: campaigns.length, users: users.length },
    ],
    donationTiers: [
      { label: "Micro ($1 - $25)", range: "1-25", count: 0, totalAmount: 0, color: "#38bdf8", percentageOfDonations: 0, percentageOfRevenue: 0 },
      { label: "Standard ($25 - $100)", range: "25-100", count: 0, totalAmount: 0, color: "#00aff0", percentageOfDonations: 0, percentageOfRevenue: 0 },
      { label: "Enthusiast ($100 - $500)", range: "100-500", count: 0, totalAmount: 0, color: "#018cf1", percentageOfDonations: 0, percentageOfRevenue: 0 },
      { label: "VIP ($500+)", range: "500+", count: 0, totalAmount: 0, color: "#0271c2", percentageOfDonations: 0, percentageOfRevenue: 0 },
    ],
    recentDonations: [],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Platform Analytics & Command Center
            </h2>
            <Badge variant="success" className="gap-1 text-xs py-0.5">
              <CheckCircle2 className="h-3 w-3" /> Live Database
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Holistic performance metrics across financial volume, campaigns, and user trust
          </p>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-amber-600 flex items-center gap-1 font-medium mr-2">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing || loading}
            className="cursor-pointer gap-1.5 rounded-xl"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Sync Data"}</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Premium Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatMetricCard
          title="Total Funds Raised"
          value={`$${data.financials.totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Net platform contributions"
          icon={DollarSign}
          badgeText="Verified"
          badgeVariant="success"
          accentColorClass="border-l-4 border-l-emerald-500"
          iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />

        <StatMetricCard
          title="Platform Donations"
          value={data.financials.totalDonationsCount.toLocaleString()}
          subtitle={`Avg. $${data.financials.averageDonation.toLocaleString()} per backer`}
          icon={CreditCard}
          badgeText={data.financials.pendingCount > 0 ? `${data.financials.pendingCount} pending` : "100% settled"}
          badgeVariant="info"
          accentColorClass="border-l-4 border-l-indigo-500"
          iconBgClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
        />

        <StatMetricCard
          title="Active Campaigns"
          value={data.campaigns.active.toLocaleString()}
          subtitle={`${data.campaigns.total} total raised (${data.campaigns.successRate}% funded)`}
          icon={Megaphone}
          badgeText={`${data.campaigns.funded} funded`}
          badgeVariant="warning"
          accentColorClass="border-l-4 border-l-amber-500"
          iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        />

        <StatMetricCard
          title="Verified Users"
          value={`${data.users.kycVerified.toLocaleString()}`}
          subtitle={`${data.users.total} accounts registered`}
          icon={ShieldCheck}
          badgeText={`${data.users.total > 0 ? Math.round((data.users.kycVerified / data.users.total) * 100) : 0}% KYC rate`}
          badgeVariant="outline"
          accentColorClass="border-l-4 border-l-purple-500"
          iconBgClass="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
        />
      </div>

      {/* 4 HIGH-IMPACT PLATFORM GRAPHS (2x2 Grid matching Studio layout) */}
      {/* Row 1: Graph 1 (6-Month Revenue Trend) + Graph 2 (Top Campaigns Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart data={data.trends} />
        <CampaignGoalLeaderboard campaigns={data.campaigns.topCampaigns} />
      </div>

      {/* Row 2: Graph 3 (Donation Tiers Distribution) + Graph 4 (Users, KYC & Trust Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminDonationTiersChart
          tiers={data.donationTiers}
          totalRaised={data.financials.totalRaised}
          totalDonationsCount={data.financials.totalDonationsCount}
        />
        <KycAndCommunityCard users={data.users} engagement={data.engagement} />
      </div>

      {/* Recent Platform Transactions Live Audit Table */}
      <div className="space-y-6">
        <RecentDonationsTable donations={data.recentDonations} />
      </div>
    </div>
  );
};

export default OverviewTab;
