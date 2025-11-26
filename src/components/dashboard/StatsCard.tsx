'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  className?: string;
}

export function StatsCard({ title, value, icon, trend, badge, className }: StatsCardProps) {
  return (
    <Card className={cn("border-none shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {trend && (
              <p className={cn(
                "text-xs font-medium mt-1",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}
              </p>
            )}
          </div>
          {badge && (
            <Badge variant={badge.variant || 'default'} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
