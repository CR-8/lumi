'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PaletteSwatchProps {
  colors: string[];
  title?: string;
}

export function PaletteSwatch({ colors, title }: PaletteSwatchProps) {
  return (
    <div className="space-y-3">
      {title && <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h4>}
      <div className="flex flex-wrap gap-3">
        <TooltipProvider>
          {colors.map((color, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <div
                  className="w-12 h-12 rounded-xl border border-border/50 hover:border-primary/50 hover:scale-110 transition-all cursor-pointer shadow-sm hover:shadow-md"
                  style={{ backgroundColor: color }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">{color}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
