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
  Percent,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatMetricCard from "./StatMetricCard";
import RevenueTrendChart from "./RevenueTrendChart";
import CampaignGoalLeaderboard from "./CampaignGoalLeaderboard";
import RecentDonationsTable from "./RecentDonationsTable";
import KycAndCommunityCard from "./KycAndCommunityCard";
import api from "@/lib/axiosInstance";

const OverviewTab = ({ users = [], campaigns = [] }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

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
      // Fallback: generate calculated fallback from props
      setError("Using offline data calculation");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // If analytics API hasn't loaded or failed, fallback to computing from props
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
    recentDonations: [],
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar with Refresh & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Platform Analytics & Command Center
            </h2>
            <Badge variant="success" className="gap-1 text-xs py-0.5">
              <CheckCircle2 className="h-3 w-3" /> Real-time
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
            className="cursor-pointer gap-1.5"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Sync Data"}</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Premium Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatMetricCard
          title="Total Funds Raised"
          value={`$${data.financials.totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Net completed contributions"
          icon={DollarSign}
          badgeText="Verified"
          badgeVariant="success"
          accentColorClass="border-l-4 border-l-emerald-500"
          iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />

        <StatMetricCard
          title="Total Donations"
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

      {/* Segmented Sub-Dashboards via Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="border-b border-border pb-2">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Executive Overview
            </TabsTrigger>
            <TabsTrigger value="financials" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Audit
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Award className="h-4 w-4" />
              Campaign Performance
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="h-4 w-4" />
              Users & Trust
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── TAB 1: EXECUTIVE OVERVIEW ────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Main Visual Row: 6-Month Performance Chart + Top Campaigns Leaderboard */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <RevenueTrendChart data={data.trends} />
            <CampaignGoalLeaderboard campaigns={data.campaigns.topCampaigns} />
          </div>

          {/* Second Row: Recent Donations Table + KYC & Community Health */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RecentDonationsTable donations={data.recentDonations} />
            </div>
            <div className="space-y-6">
              <KycAndCommunityCard users={data.users} engagement={data.engagement} />
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 2: FINANCIAL AUDIT ───────────────────────────────────────────── */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold">Total Target Goal Volume</CardDescription>
                <CardTitle className="text-2xl font-bold text-foreground">
                  ${data.financials.totalGoal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Sum of target goals across all active and concluded campaigns
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold">Average Donation Size</CardDescription>
                <CardTitle className="text-2xl font-bold text-indigo-600">
                  ${data.financials.averageDonation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Average transaction ticket size across verified Stripe checkouts
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase font-semibold">Refunded Volume</CardDescription>
                <CardTitle className="text-2xl font-bold text-rose-600">
                  ${data.financials.totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {data.financials.refundedCount} donations refunded due to campaign cancellations
              </CardContent>
            </Card>
          </div>

          <RecentDonationsTable donations={data.recentDonations} />
        </TabsContent>

        {/* ─── TAB 3: CAMPAIGN PERFORMANCE ──────────────────────────────────────── */}
        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">Funding Success Rate</CardTitle>
                  <Percent className="h-4 w-4 text-indigo-600" />
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Percentage of campaigns that met or exceeded goal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-foreground">{data.campaigns.successRate}%</span>
                  <Badge variant="success">{data.campaigns.funded} of {data.campaigns.total} funded</Badge>
                </div>
                <Progress value={data.campaigns.successRate} indicatorClassName="bg-indigo-600" />
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">Active vs Ended</CardTitle>
                  <Megaphone className="h-4 w-4 text-amber-500" />
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Campaign lifecycle status distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Fundraising</span>
                  <span className="font-bold text-emerald-600">{data.campaigns.active}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Concluded / Ended</span>
                  <span className="font-bold text-muted-foreground">{data.campaigns.ended}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-1">
                  <span className="font-semibold text-foreground">Total Raised</span>
                  <span className="font-bold text-foreground">{data.campaigns.total}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">Goal Completion Index</CardTitle>
                  <PieChart className="h-4 w-4 text-emerald-600" />
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Overall capital captured vs total targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {(() => {
                  const percent = data.financials.totalGoal > 0
                    ? Math.min(Math.round((data.financials.totalRaised / data.financials.totalGoal) * 100), 100)
                    : 0;
                  return (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-extrabold text-foreground">{percent}%</span>
                        <span className="text-xs text-muted-foreground">
                          ${data.financials.totalRaised.toLocaleString()} / ${data.financials.totalGoal.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={percent} indicatorClassName="bg-emerald-500" />
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          <CampaignGoalLeaderboard campaigns={data.campaigns.topCampaigns} />
        </TabsContent>

        {/* ─── TAB 4: USERS & TRUST ────────────────────────────────────────────── */}
        <TabsContent value="community" className="space-y-6">
          <KycAndCommunityCard users={data.users} engagement={data.engagement} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OverviewTab;
