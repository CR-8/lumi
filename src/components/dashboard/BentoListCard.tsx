"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BentoListItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  statusVariant?: "default" | "secondary" | "destructive" | "outline";
  icon?: ReactNode;
  action?: ReactNode;
}

interface BentoListCardProps {
  title: string;
  items: BentoListItem[];
  className?: string;
  headerAction?: ReactNode;
  emptyMessage?: string;
}

export function BentoListCard({
  title,
  items,
  className,
  headerAction,
  emptyMessage = "No items to display",
}: BentoListCardProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {headerAction}
      </div>

      <ScrollArea className="flex-1">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                {item.icon && (
                  <div className="mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                    {item.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium leading-tight">
                      {item.title}
                    </p>
                    {item.status && (
                      <Badge
                        variant={item.statusVariant || "secondary"}
                        className="shrink-0 text-[10px] h-4 px-1.5"
                      >
                        {item.status}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.action && <div className="shrink-0">{item.action}</div>}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
