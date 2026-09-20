import React, { useState } from "react";
import { CreditCard, Search, DollarSign, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AdminDonationsTabProps {
  donations: any[];
  totalRaised: number;
  totalDonationsCount: number;
  averageDonation: number;
}

const AdminDonationsTab: React.FC<AdminDonationsTabProps> = ({
  donations = [],
  totalRaised = 0,
  totalDonationsCount = 0,
  averageDonation = 0,
}) => {
  const [search, setSearch] = useState("");

  const filtered = donations.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.donor_name && d.donor_name.toLowerCase().includes(q)) ||
      (d.donor_username && d.donor_username.toLowerCase().includes(q)) ||
      (d.donor_email && d.donor_email.toLowerCase().includes(q)) ||
      (d.campaign_title && d.campaign_title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            Global Financial Audit & Stripe Ledger
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Platform-wide transaction history, donor details, and Stripe settlement statuses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Net Volume</span>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card shadow-xs p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{totalDonationsCount.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Completed Stripe checkouts</p>
        </Card>

        <Card className="border-border bg-card shadow-xs p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Average Contribution</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">${averageDonation.toFixed(2)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Mean ticket size across campaigns</p>
        </Card>

        <Card className="border-border bg-card shadow-xs p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Settlement Rate</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">100%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Direct to creator Stripe accounts</p>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by donor name, email, or campaign title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Global Table */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-xs">
              No transactions matching your search query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Donor Profile</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Campaign Target</th>
                    <th className="py-3 px-4">Amount</th>
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
                              className="w-8 h-8 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {(d.donor_name || "A").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground">{d.donor_name || "Anonymous"}</p>
                            {d.donor_username && (
                              <p className="text-[10px] text-muted-foreground">@{d.donor_username}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">{d.donor_email || "N/A"}</td>

                      <td className="py-3.5 px-4 font-semibold text-foreground max-w-[220px] truncate">
                        {d.campaign_title}
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
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1 inline" /> Settled
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

export default AdminDonationsTab;
