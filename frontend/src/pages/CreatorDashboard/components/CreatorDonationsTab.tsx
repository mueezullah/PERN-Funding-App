import React, { useState } from "react";
import { DollarSign, Search, Users, Sparkles, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface CreatorDonationsTabProps {
  donations: any[];
  totalRaised: number;
  totalDonationsCount: number;
}

const CreatorDonationsTab: React.FC<CreatorDonationsTabProps> = ({
  donations = [],
  totalRaised = 0,
  totalDonationsCount = 0,
}) => {
  const [search, setSearch] = useState("");

  const filtered = donations.filter((d) => {
    const query = search.toLowerCase();
    return (
      (d.donor_name && d.donor_name.toLowerCase().includes(query)) ||
      (d.donor_username && d.donor_username.toLowerCase().includes(query)) ||
      (d.campaign_title && d.campaign_title.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Backers & Contributions Ledger
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified Stripe contributions and donor audit log across all campaigns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Settled</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by backer name, username, or campaign title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Ledger Table */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">No contributions match your criteria</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {search ? "Try searching for a different backer or campaign name" : "Backer contributions will appear here in real-time"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Backer Profile</th>
                    <th className="py-3 px-4">Campaign Target</th>
                    <th className="py-3 px-4">Contribution</th>
                    <th className="py-3 px-4">Processed Date</th>
                    <th className="py-3 px-4 text-right">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {d.donor_avatar ? (
                            <img
                              src={d.donor_avatar}
                              alt={d.donor_name}
                              className="w-8 h-8 rounded-full object-cover border border-border shadow-xs"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {(d.donor_name || "A").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground">{d.donor_name || "Anonymous Supporter"}</p>
                            {d.donor_username && (
                              <p className="text-[10px] text-muted-foreground">@{d.donor_username}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-foreground max-w-[220px] truncate">
                        {d.campaign_title || "Direct Contribution"}
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-indigo-600 text-sm">
                        ${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Badge variant="success" className="text-[10px] font-bold py-0.5 px-2">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1 inline" /> Completed
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

export default CreatorDonationsTab;
