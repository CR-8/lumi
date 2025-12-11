"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BentoStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  description?: string;
  className?: string;
}

export function BentoStatsCard({
  title,
  value,
  change,
  icon,
  trend = "neutral",
  description,
  className,
}: BentoStatsCardProps) {
  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-3.5 h-3.5" />;
    if (trend === "down") return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-500 dark:text-green-400";
    if (trend === "down") return "text-red-500 dark:text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("flex flex-col h-full justify-between gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 font-semibold px-2 py-1 rounded-full",
                getTrendColor(),
                trend === "up" && "bg-green-500/10",
                trend === "down" && "bg-red-500/10",
                trend === "neutral" && "bg-muted"
              )}
            >
              {getTrendIcon()}
              <span>
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </span>
            </div>
          )}
          {description && (
            <span className="text-muted-foreground font-medium">{description}</span>
          )}
          {change?.label && (
            <span className="text-muted-foreground">{change.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
