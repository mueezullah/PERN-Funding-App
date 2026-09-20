import React, { useState } from "react";
import {
  Megaphone,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { handleSuccess, handleError } from "../../../utils";

const CampaignsTab = ({ campaigns = [], campaignsLoading = false, campaignsError = null, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionId, setActionId] = useState(null);

  const handleDelete = async (campaignId) => {
    if (!window.confirm("Admin Action: Are you sure you want to delete this campaign? All active backers will be automatically refunded.")) {
      return;
    }

    setActionId(campaignId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: { Authorization: token || "" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleSuccess("Campaign deleted and refunds initiated");
        if (onRefresh) onRefresh();
      } else {
        handleError(data.message || "Failed to delete campaign");
      }
    } catch (err) {
      console.error(err);
      handleError("Network error deleting campaign");
    } finally {
      setActionId(null);
    }
  };

  const filtered = campaigns.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.user?.name && c.user.name.toLowerCase().includes(q)) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(q));

    const isFunded = (parseFloat(c.current_amount) || 0) >= (parseFloat(c.goal_amount) || 1);
    const isEnded = c.status === "ended" || new Date(c.deadline) < new Date();
    const isActive = c.status === "active" && !isEnded;

    if (!matchesSearch) return false;
    if (statusFilter === "active") return isActive;
    if (statusFilter === "funded") return isFunded;
    if (statusFilter === "ended") return isEnded;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-500" />
            Platform Campaigns Moderation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit creator goals, monitor funding thresholds, and enforce platform trust guidelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-bold py-1 px-3 bg-muted">
            Total Campaigns: {campaigns.length}
          </Badge>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns by title, description, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border overflow-x-auto">
          {["all", "active", "funded", "ended"].map((st) => (
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
                  ? campaigns.filter((c) => c.status === "active" && new Date(c.deadline) > new Date()).length
                  : st === "funded"
                  ? campaigns.filter((c) => (parseFloat(c.current_amount) || 0) >= (parseFloat(c.goal_amount) || 1)).length
                  : campaigns.filter((c) => c.status === "ended" || new Date(c.deadline) < new Date()).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-0">
          {campaignsLoading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Loading platform campaigns...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No campaigns found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Campaign Title</th>
                    <th className="py-3 px-4">Creator</th>
                    <th className="py-3 px-4">Funding Progress</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((c) => {
                    const current = parseFloat(c.current_amount) || 0;
                    const goal = parseFloat(c.goal_amount) || 1;
                    const percent = Math.min(Math.round((current / goal) * 100), 1000);
                    const isFunded = current >= goal;
                    const isEnded = c.status === "ended" || new Date(c.deadline) < new Date();
                    const isActive = c.status === "active" && !isEnded;

                    return (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-foreground max-w-[220px]">
                          <Link
                            to={`/campaigns/${c.id}`}
                            className="hover:text-indigo-600 transition-colors flex items-center gap-1 truncate"
                          >
                            <span>{c.title}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                          </Link>
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground">
                          {c.user?.name || c.owner_name || "Creator"}
                          {(c.user?.username || c.owner_username) && (
                            <span className="block text-[10px] text-muted-foreground">@{c.user?.username || c.owner_username}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1 w-36">
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-foreground">${current.toLocaleString()}</span>
                              <span className="text-muted-foreground">/ ${goal.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                              <div
                                className={`h-full rounded-full ${
                                  isFunded ? "bg-emerald-500" : "bg-indigo-500"
                                }`}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-indigo-600">{percent}% Funded</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(c.deadline).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={isFunded ? "success" : isActive ? "default" : "secondary"}
                            className="text-[10px] font-bold py-0.5 px-2"
                          >
                            {isFunded ? "Funded" : !isEnded ? "Active" : "Ended"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(c.id)}
                            disabled={actionId === c.id}
                            className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                            title="Delete Campaign (Refunds Backers)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignsTab;
