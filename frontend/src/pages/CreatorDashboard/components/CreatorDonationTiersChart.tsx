import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, DollarSign, Users, Award } from "lucide-react";

export interface DonationTierItem {
  label: string;
  range: string;
  count: number;
  totalAmount: number;
  color: string;
  percentageOfDonations: number;
  percentageOfRevenue: number;
}

interface CreatorDonationTiersChartProps {
  tiers: DonationTierItem[];
  totalRaised: number;
  totalDonationsCount: number;
}

const CreatorDonationTiersChart: React.FC<CreatorDonationTiersChartProps> = ({
  tiers = [],
  totalRaised = 0,
  totalDonationsCount = 0,
}) => {
  return (
    <Card className="shadow-xs border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Backer Contribution Tier Distribution
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              Graph 3
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Breakdown of supporter contributions across ticket size brackets
          </CardDescription>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-muted-foreground">Total Backers: </span>
          <span className="text-xs font-bold text-foreground">{totalDonationsCount} contributions</span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Segmented Distribution Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Volume Share by Tier</span>
            <span>100% Backer Base</span>
          </div>

          <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted p-0.5 border border-border">
            {tiers.map((tier) => {
              const widthPct = Math.max(tier.percentageOfDonations, tier.count > 0 ? 5 : 0);
              return (
                <div
                  key={tier.label}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 relative group cursor-pointer"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: tier.color,
                  }}
                  title={`${tier.label}: ${tier.count} backers (${tier.percentageOfDonations}%) - $${tier.totalAmount.toLocaleString()}`}
                />
              );
            })}
          </div>
        </div>

        {/* Tier Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className="p-3.5 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-xs font-bold text-foreground">{tier.label}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold py-0.5 px-2">
                  {tier.percentageOfDonations}% of backers
                </Badge>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <p className="text-lg font-extrabold text-foreground">
                    ${tier.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-indigo-500" />
                    {tier.percentageOfRevenue}% of total revenue
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-foreground flex items-center justify-end gap-1">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {tier.count}
                  </p>
                  <p className="text-[10px] text-muted-foreground">backers</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-indigo-500" />
            <span>Highest tier backers drive high-velocity campaign momentum</span>
          </div>
          <span className="font-semibold text-foreground">
            Avg. Ticket: ${totalDonationsCount > 0 ? (totalRaised / totalDonationsCount).toFixed(2) : "0.00"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorDonationTiersChart;
