"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoChartCardProps {
  title: string;
  value?: string | number;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function BentoChartCard({
  title,
  value,
  description,
  children,
  className,
  headerAction,
}: BentoChartCardProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {value && <p className="text-2xl font-bold mt-1">{value}</p>}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {headerAction}
      </div>
      <div className="flex-1 flex items-center justify-center">{children}</div>
    </div>
  );
}
