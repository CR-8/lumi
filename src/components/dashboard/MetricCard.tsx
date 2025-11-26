'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'gradient' | 'dark';
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-card',
    gradient: 'bg-linear-to-br from-primary/10 to-accent/10 border-primary/20',
    dark: 'bg-secondary/80 backdrop-blur-sm'
  };

  return (
    <Card className={cn(
      "p-6 border-none shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-4xl font-bold tracking-tight">{value}</div>
        {trend && (
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-semibold",
              trend.isPositive === undefined ? "text-muted-foreground" :
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive && "+"}{trend.value}
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
