import React, { useState } from "react";
import {
  Megaphone,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Pin,
  Pencil,
  Trash2,
  ExternalLink,
  Users,
  Bookmark,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CreatorCampaignItem } from "./CreatorCampaignsComparisonChart";

interface CreatorCampaignsTabProps {
  campaigns: CreatorCampaignItem[];
  loading: boolean;
  onCreateClick: () => void;
  onEditClick: (campaign: CreatorCampaignItem) => void;
  onDeleteClick: (campaignId: number) => void;
  onPinClick: (campaignId: number) => void;
}

const CreatorCampaignsTab: React.FC<CreatorCampaignsTabProps> = ({
  campaigns = [],
  loading = false,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onPinClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "funded" | "ended">("all");

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "active") return c.status === "active";
    if (statusFilter === "funded") return c.progress_percent >= 100 || c.is_funded;
    if (statusFilter === "ended") return c.status === "ended" || (c.days_left !== undefined && c.days_left <= 0);

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-500" />
            My Campaigns Management
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage, edit, monitor funding goals, and pin campaigns to your public profile
          </p>
        </div>

        <Button
          onClick={onCreateClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer gap-1.5 shadow-sm shadow-indigo-200 rounded-xl self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create New Campaign</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border overflow-x-auto">
          {(["all", "active", "funded", "ended"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {st} ({
                st === "all"
                  ? campaigns.length
                  : st === "active"
                  ? campaigns.filter((c) => c.status === "active").length
                  : st === "funded"
                  ? campaigns.filter((c) => c.progress_percent >= 100).length
                  : campaigns.filter((c) => c.status === "ended" || (c.days_left !== undefined && c.days_left <= 0)).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-16 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No campaigns found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "Try searching with different keywords or changing your active filters"
                : "You have not created any campaigns under this filter yet. Ready to launch your next idea?"}
            </p>
            <Button
              onClick={onCreateClick}
              className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer gap-1.5 rounded-xl text-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Launch Campaign</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map((c) => {
            const isFunded = c.progress_percent >= 100;
            const isPinned = !!c.pinned_at;

            return (
              <Card
                key={c.id}
                className="border-border bg-card shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Campaign Media Cover */}
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    {c.media_url ? (
                      <img
                        src={c.media_url}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-400">
                        <Megaphone className="h-10 w-10 opacity-40" />
                      </div>
                    )}

                    {/* Status & Pin Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge
                        variant={isFunded ? "success" : c.status === "active" ? "default" : "secondary"}
                        className="text-[10px] font-bold shadow-sm"
                      >
                        {isFunded && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                        {isFunded ? "Funded" : c.status === "active" ? "Active" : "Ended"}
                      </Badge>

                      {isPinned && (
                        <Badge variant="outline" className="text-[10px] font-bold bg-white/95 text-indigo-700 border-indigo-200 shadow-sm gap-0.5">
                          <Pin className="h-2.5 w-2.5 fill-indigo-600" /> Pinned
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-400" />
                        {c.status === "ended" ? "Ended" : `${c.days_left ?? 0}d left`}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <Link
                      to={`/campaigns/${c.id}`}
                      className="font-bold text-sm text-foreground hover:text-indigo-600 transition-colors line-clamp-1 flex items-center justify-between"
                    >
                      <span className="truncate">{c.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-indigo-600 shrink-0 ml-1" />
                    </Link>

                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}

                    {/* Progress Track */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground">
                          ${c.current_amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-muted-foreground font-normal">
                          Goal: ${c.goal_amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/60">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFunded
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                              : "bg-gradient-to-r from-indigo-500 to-blue-500"
                          }`}
                          style={{ width: `${Math.min(c.progress_percent, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                        <span className="font-bold text-indigo-600">{c.progress_percent}% Funded</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            <Users className="h-3 w-3" /> {c.donations_count || 0}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Bookmark className="h-3 w-3" /> {c.bookmarks_count || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Controls */}
                <div className="p-4 pt-2 border-t border-border flex items-center justify-between gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPinClick(c.id)}
                    className={`h-8 text-xs font-semibold rounded-lg cursor-pointer gap-1 flex-1 ${
                      isPinned ? "text-indigo-600 bg-indigo-50/60 border-indigo-200" : "text-muted-foreground"
                    }`}
                  >
                    <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-indigo-600" : ""}`} />
                    <span>{isPinned ? "Unpin" : "Pin"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClick(c)}
                    className="h-8 text-xs font-semibold rounded-lg cursor-pointer gap-1 flex-1 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClick(c.id)}
                    className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreatorCampaignsTab;
