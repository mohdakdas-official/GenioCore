import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "../ui/Card";
import { Sparkline } from "../charts/Sparkline";

export const StatCard = ({
  title,
  value,
  trend,
  trendDirection = "up",
  subtitle = "vs last cycle",
  icon: Icon,
  sparklineData,
  sparklineColor,
}) => {
  const isPositive = trendDirection === "up";

  return (
    <Card hover className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted">{title}</span>
        {Icon && (
          <div className="w-7 h-7 rounded-md bg-surface border border-border-subtle flex items-center justify-center text-muted">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between mt-3 mb-2">
        <span className="text-2xl font-bold font-mono text-text-primary tracking-tight">
          {value}
        </span>
        {sparklineData && (
          <Sparkline
            data={sparklineData}
            color={sparklineColor || "var(--primary)"}
            height={28}
            width={80}
          />
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-[11px]">
          <span
            className={`inline-flex items-center font-medium font-mono ${
              isPositive ? "text-success" : "text-error"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend}
          </span>
          <span className="text-muted">{subtitle}</span>
        </div>
      )}
    </Card>
  );
};
