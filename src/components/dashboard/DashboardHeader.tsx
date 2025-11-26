'use client';

import { Button } from '@/components/ui/button';
import { Download, Share2, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  showActions?: boolean;
  onRefresh?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  showActions = true,
  onRefresh,
  onShare,
  onExport
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {showActions && (
        <div className="flex items-center gap-3">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
          {onExport && (
            <Button
              size="sm"
              className="gap-2"
              onClick={onExport}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
