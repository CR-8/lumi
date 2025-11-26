'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  label: string;
  value: number;
  max?: number;
  showPercentage?: boolean;
  color?: 'primary' | 'green' | 'blue' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  label,
  value,
  max = 100,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colorStyles = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        {showPercentage && (
          <span className="text-muted-foreground font-mono">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <Progress
        value={percentage}
        className={sizeStyles[size]}
        indicatorClassName={colorStyles[color]}
      />
    </div>
  );
}
