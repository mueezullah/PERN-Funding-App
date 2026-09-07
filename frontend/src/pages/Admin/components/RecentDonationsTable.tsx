import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "@/utils";

interface RecentDonationItem {
  id: number;
  amount: number;
  created_at: string;
  donor_name: string;
  donor_username: string;
  donor_email: string;
  donor_avatar?: string;
  campaign_id?: number;
  campaign_title: string;
}

interface RecentDonationsTableProps {
  donations: RecentDonationItem[];
}

const RecentDonationsTable: React.FC<RecentDonationsTableProps> = ({ donations = [] }) => {
  return (
    <Card className="shadow-xs border-border bg-card">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Recent Donations
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Latest verified contributions across all campaigns
          </CardDescription>
        </div>
        <Badge variant="success" className="text-xs">
          Real-time
        </Badge>
      </CardHeader>

      <CardContent className="pt-0">
        {donations.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground">
            No completed donations recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Donor</th>
                  <th className="py-2.5 px-3 font-semibold">Campaign</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {donations.map((d) => {
                  const initial = (d.donor_name || "A").charAt(0).toUpperCase();

                  return (
                    <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                      {/* Donor info */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {d.donor_avatar ? (
                            <img
                              src={d.donor_avatar}
                              alt={d.donor_name}
                              className="h-7 w-7 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
                              {initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[160px]">
                              {d.donor_name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[120px] sm:max-w-[160px]">
                              {d.donor_email || `@${d.donor_username}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Campaign */}
                      <td className="py-3 px-3">
                        {d.campaign_id ? (
                          <Link
                            to={`/campaign/${d.campaign_id}`}
                            className="text-foreground hover:text-indigo-600 font-medium truncate max-w-[140px] sm:max-w-[200px] block transition-colors"
                          >
                            {d.campaign_title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">{d.campaign_title}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-emerald-600 text-sm">
                          +${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <Badge variant="success" className="text-[10px] gap-1 px-2 py-0.5 inline-flex items-center">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Completed
                        </Badge>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-3 text-right text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(d.created_at)}
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
  );
};

export default RecentDonationsTable;
