import React from "react";
import {
  DollarSign,
  Users,
  Megaphone,
  Heart,
  TrendingUp,
  RotateCw,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import CreatorStatCard from "./CreatorStatCard";
import CreatorRevenueTrendChart from "./CreatorRevenueTrendChart";
import CreatorCampaignsComparisonChart from "./CreatorCampaignsComparisonChart";
import CreatorDonationTiersChart from "./CreatorDonationTiersChart";
import CreatorEngagementChart from "./CreatorEngagementChart";

interface CreatorOverviewTabProps {
  analytics: any;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onCreateCampaignClick: () => void;
  onViewCampaignsClick: () => void;
}

const CreatorOverviewTab: React.FC<CreatorOverviewTabProps> = ({
  analytics,
  loading,
  refreshing,
  error,
  onRefresh,
  onCreateCampaignClick,
  onViewCampaignsClick,
}) => {
  if (loading && !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-muted/60 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted/60 rounded-2xl" />
          <div className="h-80 bg-muted/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    financials = {
      totalRaised: 0,
      totalGoal: 0,
      totalDonationsCount: 0,
      averageDonation: 0,
      totalRefunded: 0,
      refundedCount: 0,
      pendingCount: 0,
      overallGoalReachedPercent: 0,
    },
    campaigns = {
      total: 0,
      active: 0,
      ended: 0,
      funded: 0,
      successRate: 0,
      list: [],
    },
    community = {
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      likesReceived: 0,
      commentsReceived: 0,
    },
    trends = [],
    donationTiers = [],
    recentDonations = [],
  } = analytics || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Command Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Creator Studio & Performance Command
            </h2>
            <Badge variant="success" className="gap-1 text-xs py-0.5">
              <CheckCircle2 className="h-3 w-3" /> Verified Creator
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time analytics, funding growth, backer tiers, and campaign health
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {error && (
            <span className="text-xs text-amber-600 flex items-center gap-1 font-medium mr-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing || loading}
            className="cursor-pointer gap-1.5 rounded-xl"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Data"}</span>
          </Button>

          <Button
            size="sm"
            onClick={onCreateCampaignClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer gap-1.5 shadow-sm shadow-indigo-200 rounded-xl"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Campaign</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <CreatorStatCard
          title="Total Funds Raised"
          value={`$${financials.totalRaised.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle={`${financials.overallGoalReachedPercent}% of overall targets raised`}
          icon={DollarSign}
          badgeText="Completed"
          badgeVariant="success"
          accentColorClass="border-l-4 border-l-emerald-500"
          iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />

        <CreatorStatCard
          title="Total Backers"
          value={financials.totalDonationsCount.toLocaleString()}
          subtitle={`Avg. $${financials.averageDonation.toLocaleString()} per contribution`}
          icon={Users}
          badgeText={financials.pendingCount > 0 ? `${financials.pendingCount} pending` : "100% settled"}
          badgeVariant="info"
          accentColorClass="border-l-4 border-l-indigo-500"
          iconBgClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
        />

        <CreatorStatCard
          title="Active Campaigns"
          value={campaigns.active.toLocaleString()}
          subtitle={`${campaigns.total} total created (${campaigns.successRate}% success rate)`}
          icon={Megaphone}
          badgeText={`${campaigns.funded} funded`}
          badgeVariant="warning"
          accentColorClass="border-l-4 border-l-amber-500"
          iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        />

        <CreatorStatCard
          title="Community Reach"
          value={community.followersCount.toLocaleString()}
          subtitle={`${community.likesReceived} likes · ${community.postsCount} updates`}
          icon={Heart}
          badgeText={`${community.commentsReceived} comments`}
          badgeVariant="outline"
          accentColorClass="border-l-4 border-l-purple-500"
          iconBgClass="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
        />
      </div>

      {/* 4 HIGH-IMPACT INTERACTIVE GRAPHS */}
      {/* Row 1: Graph 1 (6-Month Funding Trend) & Graph 2 (Goals vs Raised Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreatorRevenueTrendChart data={trends} />
        <CreatorCampaignsComparisonChart campaigns={campaigns.list} />
      </div>

      {/* Row 2: Graph 3 (Backer Donation Tiers) & Graph 4 (Supporter Growth Velocity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreatorDonationTiersChart
          tiers={donationTiers}
          totalRaised={financials.totalRaised}
          totalDonationsCount={financials.totalDonationsCount}
        />
        <CreatorEngagementChart data={trends} community={community} />
      </div>

      {/* Recent Backers Live Feed Table */}
      <Card className="shadow-xs border-border bg-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Recent Supporter Contributions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live audit of the latest backers contributing to your campaigns
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewCampaignsClick}
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs font-semibold cursor-pointer gap-1"
          >
            Manage All Campaigns
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>

        <CardContent>
          {recentDonations.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No contributions received yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share your campaign link on social media to attract your first backer!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-3 px-2">Backer</th>
                    <th className="pb-3 px-2">Campaign</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentDonations.map((donation: any) => (
                    <tr key={donation.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          {donation.donor_avatar ? (
                            <img
                              src={donation.donor_avatar}
                              alt={donation.donor_name}
                              className="w-7 h-7 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {(donation.donor_name || "A").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground">{donation.donor_name}</p>
                            {donation.donor_username && (
                              <p className="text-[10px] text-muted-foreground">@{donation.donor_username}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2 font-medium text-foreground max-w-[200px] truncate">
                        {donation.campaign_title}
                      </td>

                      <td className="py-3 px-2 font-bold text-indigo-600">
                        ${donation.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(donation.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-2 text-right">
                        <Badge variant="success" className="text-[10px] font-bold py-0 px-2">
                          Settled
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorOverviewTab;
