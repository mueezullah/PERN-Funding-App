import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, MessageSquare, ThumbsUp, FileText, UserCheck } from "lucide-react";

interface UsersData {
  total: number;
  kycVerified: number;
  kycUnverified: number;
  roles: {
    user: number;
    fundraiser: number;
    admin: number;
    moderator: number;
    [key: string]: number;
  };
}

interface EngagementData {
  posts: number;
  comments: number;
  likes: number;
}

interface KycAndCommunityCardProps {
  users: UsersData;
  engagement: EngagementData;
}

const KycAndCommunityCard: React.FC<KycAndCommunityCardProps> = ({ users, engagement }) => {
  const verifiedPercent = users.total > 0 ? Math.round((users.kycVerified / users.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* KYC & Role Verification Breakdown */}
      <Card className="shadow-xs border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              KYC & Identity Verification
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {verifiedPercent}% Verified
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Platform trust, user verification, and account role splits
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified ({users.kycVerified})
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <ShieldAlert className="h-3.5 w-3.5" />
                Unverified ({users.kycUnverified})
              </span>
            </div>
            <Progress value={verifiedPercent} indicatorClassName="bg-emerald-500" />
          </div>

          {/* User Roles distribution */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Role Distribution
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-base font-bold text-foreground mt-0.5">{users.roles?.user || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-center">
                <p className="text-xs text-indigo-700 dark:text-indigo-300">Fundraisers</p>
                <p className="text-base font-bold text-indigo-900 dark:text-indigo-100 mt-0.5">{users.roles?.fundraiser || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-center">
                <p className="text-xs text-purple-700 dark:text-purple-300">Admins</p>
                <p className="text-base font-bold text-purple-900 dark:text-purple-100 mt-0.5">{users.roles?.admin || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-xs text-muted-foreground">Moderators</p>
                <p className="text-base font-bold text-foreground mt-0.5">{users.roles?.moderator || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Engagement Metrics */}
      <Card className="shadow-xs border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Community Engagement
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              Social Pulse
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Feed interactions, updates, and community conversation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 flex flex-col items-center justify-center text-center">
              <FileText className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-lg font-bold text-foreground">{engagement?.posts?.toLocaleString() || 0}</span>
              <span className="text-[11px] text-muted-foreground">Feed Posts</span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex flex-col items-center justify-center text-center">
              <MessageSquare className="h-5 w-5 text-indigo-600 mb-1" />
              <span className="text-lg font-bold text-foreground">{engagement?.comments?.toLocaleString() || 0}</span>
              <span className="text-[11px] text-muted-foreground">Comments</span>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 flex flex-col items-center justify-center text-center">
              <ThumbsUp className="h-5 w-5 text-rose-600 mb-1" />
              <span className="text-lg font-bold text-foreground">{engagement?.likes?.toLocaleString() || 0}</span>
              <span className="text-[11px] text-muted-foreground">Appreciations</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 border border-border">
            💡 <strong className="text-foreground">Activity Insights:</strong> Campaigns that post regular updates achieve an average of 4x more engagement and faster donation velocity.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KycAndCommunityCard;
