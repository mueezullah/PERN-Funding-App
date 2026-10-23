import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Sparkles } from "lucide-react";

interface MonthlyTrendItem {
  name: string;
  month: string;
  revenue: number;
  donations: number;
  campaigns: number;
  followers?: number;
  posts?: number;
}

interface CreatorRevenueTrendChartProps {
  data: MonthlyTrendItem[];
}

const CreatorRevenueTrendChart: React.FC<CreatorRevenueTrendChartProps> = ({ data = [] }) => {
  const [activeMetric, setActiveMetric] = useState<"revenue" | "donations">("revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const values = data.map((d) => (activeMetric === "revenue" ? d.revenue : d.donations));
  const maxValue = Math.max(...values, 10);

  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalDonations = data.reduce((acc, curr) => acc + curr.donations, 0);

  return (
    <Card className="shadow-xs border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              6-Month Funding & Backer Growth
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
              Graph 1
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {activeMetric === "revenue"
              ? `Total raised across all campaigns: $${totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : `Total backer contributions received: ${totalDonations} donations`}
          </CardDescription>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-muted p-1 rounded-xl self-start sm:self-auto border border-border">
          <button
            type="button"
            onClick={() => setActiveMetric("revenue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === "revenue"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-indigo-500" />
            Funds ($)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("donations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMetric === "donations"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5 text-indigo-500" />
            Backers
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Custom Interactive Responsive Bar / Area Visual */}
        <div className="relative pt-6 pb-2">
          {/* Background grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
            <div className="border-b border-border w-full" />
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3 sm:gap-6 h-56 px-2">
            {data.map((item, index) => {
              const val = activeMetric === "revenue" ? item.revenue : item.donations;
              const heightPercent = maxValue > 0 ? Math.max((val / maxValue) * 100, 6) : 6;
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
                    className={`absolute -top-4 transition-all duration-200 z-20 pointer-events-none ${
                      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                  >
                    <div className="bg-popover text-popover-foreground text-xs shadow-lg border border-border px-3 py-2 rounded-xl text-center font-medium whitespace-nowrap">
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-indigo-600 font-extrabold text-sm mt-0.5">
                        {activeMetric === "revenue"
                          ? `$${val.toLocaleString()}`
                          : `${val} backers`}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.campaigns} campaigns active
                      </p>
                    </div>
                  </div>

                  {/* Visual Bar with vibrant signature brand gradient */}
                  <div className="w-full max-w-[48px] flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                        isHovered
                          ? "bg-indigo-600 ring-2 ring-indigo-400 shadow-md shadow-indigo-200"
                          : "bg-indigo-500 hover:bg-indigo-600"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Gloss shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20" />
                    </div>
                  </div>

                  {/* X Axis label */}
                  <div className="mt-3 text-center">
                    <span
                      className={`text-xs font-semibold block transition-colors ${
                        isHovered ? "text-indigo-600 font-bold" : "text-muted-foreground"
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

        {/* Footer Summary Insight */}
        <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Monthly aggregated metrics for your verified campaigns</span>
          </div>
          <div className="font-semibold text-foreground">
            Peak: {activeMetric === "revenue" ? `$${maxValue.toLocaleString()}` : `${maxValue} contributions`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorRevenueTrendChart;
