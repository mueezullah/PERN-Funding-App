import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface StatMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  accentColorClass?: string;
  iconBgClass?: string;
}

const StatMetricCard: React.FC<StatMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = "success",
  accentColorClass = "border-l-4 border-l-indigo-600",
  iconBgClass = "bg-indigo-50 text-indigo-600",
}) => {
  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 border-border bg-card overflow-hidden relative ${accentColorClass}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {value}
              </span>
              {badgeText && (
                <Badge variant={badgeVariant} className="text-[10px] font-semibold py-0.5 px-1.5">
                  {badgeText}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${iconBgClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatMetricCard;
