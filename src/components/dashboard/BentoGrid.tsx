"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[minmax(160px,auto)] grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  rowSpan?: number;
  hover?: boolean;
}

export function BentoCard({
  children,
  className,
  span = { mobile: 1, tablet: 1, desktop: 1 },
  rowSpan = 1,
  hover = true,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-xl border border-border/40 p-6 shadow-soft",
        hover && "hover:shadow-medium hover:scale-[1.02] hover:border-border/60 hover:bg-card/90",
        "transition-all duration-300 ease-out",
        "animate-in fade-in slide-in-from-bottom-4",
        span.mobile && `col-span-${span.mobile}`,
        span.tablet && `md:col-span-${span.tablet}`,
        span.desktop && `lg:col-span-${span.desktop}`,
        rowSpan && `row-span-${rowSpan}`,
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
