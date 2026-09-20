import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Clock, Megaphone, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface CreatorCampaignItem {
  id: number;
  title: string;
  description?: string;
  goal_amount: number;
  current_amount: number;
  deadline: string;
  days_left?: number;
  status: string;
  pinned_at?: string | null;
  created_at?: string;
  media_url?: string | null;
  donations_count?: number;
  bookmarks_count?: number;
  progress_percent: number;
  is_funded?: boolean;
}

interface CreatorCampaignsComparisonChartProps {
  campaigns: CreatorCampaignItem[];
}

const CreatorCampaignsComparisonChart: React.FC<CreatorCampaignsComparisonChartProps> = ({
  campaigns = [],
}) => {
  const [filter, setFilter] = useState<"all" | "active" | "funded">("all");

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter === "active") return c.status === "active";
    if (filter === "funded") return c.progress_percent >= 100 || c.is_funded;
    return true;
  });

  return (
    <Card className="shadow-xs border-border bg-card flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-indigo-500" />
              Campaign Goals vs Raised Comparison
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              Graph 2
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Visual target vs progress comparison across your campaign portfolio
          </CardDescription>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "active"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Active ({campaigns.filter((c) => c.status === "active").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("funded")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === "funded"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Funded ({campaigns.filter((c) => c.progress_percent >= 100).length})
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        {filteredCampaigns.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold text-foreground">No campaigns found in this view</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Launch a new campaign to begin tracking live goal progress
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {filteredCampaigns.slice(0, 5).map((campaign) => {
              const percent = Math.min(campaign.progress_percent, 100);
              const isOverFunded = campaign.progress_percent >= 100;

              return (
                <div
                  key={campaign.id}
                  className="p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-all border border-border/70 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/campaigns/${campaign.id}`}
                          className="font-bold text-sm text-foreground hover:text-indigo-600 transition-colors truncate flex items-center gap-1"
                        >
                          {campaign.title}
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{campaign.donations_count || 0} backers</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {campaign.status === "ended"
                            ? "Ended"
                            : `${campaign.days_left ?? 0}d left`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-foreground">
                        ${campaign.current_amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        <span className="text-muted-foreground font-normal"> / ${campaign.goal_amount.toLocaleString()}</span>
                      </div>
                      <Badge
                        variant={isOverFunded ? "success" : campaign.status === "active" ? "default" : "secondary"}
                        className="text-[10px] font-bold mt-1 py-0 px-1.5"
                      >
                        {isOverFunded && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 inline" />}
                        {campaign.progress_percent}%
                      </Badge>
                    </div>
                  </div>

                  {/* Dual Progress Track (Goal vs Raised) */}
                  <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div
                      className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
                        isOverFunded
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "bg-gradient-to-r from-indigo-500 to-blue-500"
                      }`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/25" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Comparing active and completed targets</span>
          <span className="font-semibold text-foreground">
            {campaigns.filter((c) => c.progress_percent >= 100).length} of {campaigns.length} Fully Funded
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorCampaignsComparisonChart;
