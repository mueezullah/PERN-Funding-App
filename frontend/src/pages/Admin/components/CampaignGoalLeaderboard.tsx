import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Users, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface TopCampaignItem {
  id: number;
  title: string;
  goal_amount: number;
  current_amount: number;
  status: string;
  owner_name: string;
  owner_username: string;
  donations_count: number;
  progress_percent: number;
}

interface CampaignGoalLeaderboardProps {
  campaigns: TopCampaignItem[];
}

const CampaignGoalLeaderboard: React.FC<CampaignGoalLeaderboardProps> = ({ campaigns = [] }) => {
  return (
    <Card className="shadow-xs border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Top Funded Campaigns
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            Leaderboard
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Highest performing campaigns by total funds raised
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No campaigns have received funding yet.
          </div>
        ) : (
          campaigns.map((c, index) => {
            const isFunded = c.current_amount >= c.goal_amount && c.goal_amount > 0;
            const progress = c.progress_percent;

            return (
              <div
                key={c.id}
                className="group p-3 rounded-lg border border-border hover:border-indigo-300 hover:bg-muted/40 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        #{index + 1}
                      </span>
                      <Link
                        to={`/campaign/${c.id}`}
                        className="text-sm font-semibold text-foreground hover:text-indigo-600 truncate transition-colors flex items-center gap-1"
                      >
                        <span className="truncate">{c.title}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </Link>
                    </div>
                    <p className="text-[11px] text-muted-foreground pl-6">
                      by {c.owner_name} {c.owner_username ? `(@${c.owner_username})` : ""}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge
                      variant={isFunded ? "success" : c.status === "active" ? "info" : "outline"}
                      className="text-[10px] uppercase font-bold"
                    >
                      {isFunded ? "Goal Met" : c.status}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar and metrics */}
                <div className="pl-6 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">
                      ${c.current_amount.toLocaleString()}{" "}
                      <span className="text-muted-foreground font-normal">
                        of ${c.goal_amount.toLocaleString()}
                      </span>
                    </span>
                    <span className="font-semibold text-indigo-600">{progress}%</span>
                  </div>

                  <Progress
                    value={progress}
                    indicatorClassName={isFunded ? "bg-emerald-500" : "bg-indigo-600"}
                  />

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {c.donations_count} backers
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignGoalLeaderboard;
