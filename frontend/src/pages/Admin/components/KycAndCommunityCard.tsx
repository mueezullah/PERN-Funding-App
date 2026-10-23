import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, UserCheck } from "lucide-react";

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

interface KycAndCommunityCardProps {
  users: UsersData;
}

const KycAndCommunityCard: React.FC<KycAndCommunityCardProps> = ({ users }) => {
  const verifiedPercent = users.total > 0 ? Math.round((users.kycVerified / users.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-5">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="text-xs font-medium text-foreground">Users</span>
                </div>
                <span className="text-sm font-bold text-foreground">{users.roles?.user || 0}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Fundraisers</span>
                </div>
                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{users.roles?.fundraiser || 0}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/50">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Admins</span>
                </div>
                <span className="text-sm font-bold text-purple-900 dark:text-purple-100">{users.roles?.admin || 0}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-foreground">Moderators</span>
                </div>
                <span className="text-sm font-bold text-foreground">{users.roles?.moderator || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KycAndCommunityCard;
