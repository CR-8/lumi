'use client';

import { ContrastCheck } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ContrastMeterProps {
  check: ContrastCheck;
}

export function ContrastMeter({ check }: ContrastMeterProps) {
  const { foreground, background, ratio, passes } = check;

  const getStatus = () => {
    if (passes.AAA) return { label: 'AAA', variant: 'default' as const, className: 'bg-green-500 hover:bg-green-600' };
    if (passes.AA) return { label: 'AA', variant: 'default' as const, className: 'bg-blue-500 hover:bg-blue-600' };
    return { label: 'FAIL', variant: 'destructive' as const, className: '' };
  };

  const status = getStatus();
  const progressValue = Math.min((ratio / 7) * 100, 100);

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex -space-x-3 shrink-0">
        <div
          className="w-8 h-8 rounded-full border-2 border-background shadow-sm z-10"
          style={{ backgroundColor: foreground }}
          title={`Foreground: ${foreground}`}
        />
        <div
          className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
          style={{ backgroundColor: background }}
          title={`Background: ${background}`}
        />
      </div>
      
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium font-mono">{ratio.toFixed(2)}:1</span>
          <Badge variant={status.variant} className={cn("text-[10px] px-1.5 h-5", status.className)}>
            {status.label}
          </Badge>
        </div>
        <Progress 
          value={progressValue} 
          className="h-1.5" 
          indicatorClassName={cn(
            passes.AAA ? 'bg-green-500' : passes.AA ? 'bg-blue-500' : 'bg-red-500'
          )}
        />
      </div>
    </div>
  );
}
