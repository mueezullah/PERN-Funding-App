import React from "react";
import { Users, Heart, MessageSquare, Flame, Sparkles, PlusCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

interface CreatorCommunityTabProps {
  community: {
    followersCount: number;
    followingCount: number;
    postsCount: number;
    likesReceived: number;
    commentsReceived: number;
  };
  username: string;
}

const CreatorCommunityTab: React.FC<CreatorCommunityTabProps> = ({ community, username }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Supporter Community & Audience Reach
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your backer network, follower engagement, and project updates
          </p>
        </div>

        <Button
          onClick={() => navigate("/feed")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer gap-1.5 shadow-sm rounded-xl self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Publish Update to Feed</span>
        </Button>
      </div>

      {/* Community KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Followers</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{community.followersCount}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Direct supporters</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Likes Received</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{community.likesReceived}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Across posts & campaigns</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <Heart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Comments</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{community.commentsReceived}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Backer interactions</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <MessageSquare className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Published Posts</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{community.postsCount}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Updates on public profile</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Flame className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Action Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Tips for Maximizing Backer Retention
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Top creators maintain higher repeat funding rates by keeping their community informed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
            <div>
              <p className="font-bold text-foreground">Post weekly progress updates</p>
              <p className="text-muted-foreground mt-0.5">
                Keep backers in the loop with milestone photos, behind-the-scenes videos, and production updates.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <p className="font-bold text-foreground">Reply to comments promptly</p>
              <p className="text-muted-foreground mt-0.5">
                Engaging directly in the comments section signals transparency and increases donor trust.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              to={`/user/${username}`}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              View your public profile & posts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorCommunityTab;
