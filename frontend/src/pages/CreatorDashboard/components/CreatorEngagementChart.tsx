import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, MessageSquare, Flame, Sparkles } from "lucide-react";

interface MonthlyEngagementItem {
  name: string;
  month: string;
  followers?: number;
  posts?: number;
  revenue?: number;
  donations?: number;
}

interface CreatorEngagementChartProps {
  data: MonthlyEngagementItem[];
  community: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
  };
}

const CreatorEngagementChart: React.FC<CreatorEngagementChartProps> = ({
  data = [],
  community = {
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    likesReceived: 0,
    commentsReceived: 0,
  },
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const followerValues = data.map((d) => d.followers || 0);
  const maxFollowers = Math.max(...followerValues, 5);

  return (
    <Card className="shadow-xs border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-indigo-500" />
              Community & Supporter Growth Velocity
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              Graph 4
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Tracking new follower acquisition and monthly audience engagement
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1 text-xs py-1 px-2.5">
            <Flame className="h-3 w-3" /> {community.followersCount} Followers
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Top 3 Quick Engagement Metric Pills */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-muted/40 border border-border text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5 text-indigo-500" /> Followers
            </div>
            <p className="text-xl font-extrabold text-foreground">{community.followersCount}</p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground mb-1">
              <Heart className="h-3.5 w-3.5 text-rose-500" /> Likes Received
            </div>
            <p className="text-xl font-extrabold text-foreground">{community.likesReceived}</p>
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground mb-1">
              <MessageSquare className="h-3.5 w-3.5 text-teal-500" /> Comments
            </div>
            <p className="text-xl font-extrabold text-foreground">{community.commentsReceived}</p>
          </div>
        </div>

        {/* 6-Month Follower Growth Trend Visual */}
        <div className="relative pt-4 pb-2">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3 sm:gap-6 h-40 px-2">
            {data.map((item, index) => {
              const val = item.followers || 0;
              const heightPercent = maxFollowers > 0 ? Math.max((val / maxFollowers) * 100, 8) : 8;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={item.name || item.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip on hover */}
                  <div
                    className={`absolute -top-3 transition-all duration-200 z-20 pointer-events-none ${
                      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                  >
                    <div className="bg-popover text-popover-foreground text-xs shadow-lg border border-border px-3 py-1.5 rounded-xl text-center font-semibold whitespace-nowrap">
                      <p className="text-indigo-600 font-extrabold">+{val} new followers</p>
                      <p className="text-[10px] text-muted-foreground">{item.posts || 0} updates posted</p>
                    </div>
                  </div>

                  {/* Gradient Pillar */}
                  <div className="w-full max-w-[36px] flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                        isHovered
                          ? "bg-gradient-to-t from-indigo-600 to-purple-500 ring-2 ring-indigo-400"
                          : "bg-gradient-to-t from-indigo-500 to-purple-400"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20" />
                    </div>
                  </div>

                  {/* X-axis Month Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs font-semibold block ${
                        isHovered ? "text-indigo-600" : "text-muted-foreground"
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Active post updates boost campaign conversion by over 40%</span>
          </div>
          <span className="font-semibold text-foreground">{community.postsCount} Published Posts</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorEngagementChart;
