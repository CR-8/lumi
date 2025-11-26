'use client';

import { AnalysisResult } from '@/lib/types';
import { AnalysisCard } from '@/components/custom/AnalysisCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Keyboard, Target } from 'lucide-react';

interface AccessibilityTabProps {
  data: AnalysisResult;
}

export function AccessibilityTab({ data }: AccessibilityTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WCAG Issues */}
        <AnalysisCard
          title="WCAG Issues"
          icon={<AlertCircle className="w-5 h-5" />}
          className="md:col-span-2"
        >
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {data.wcag.errors.map((error, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Error</p>
                    <p className="text-sm text-foreground">{error}</p>
                  </div>
                </div>
              ))}
              {data.wcag.warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Warning</p>
                    <p className="text-sm text-foreground">{warning}</p>
                  </div>
                </div>
              ))}
              {data.wcag.errors.length === 0 && data.wcag.warnings.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>No major accessibility issues found!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </AnalysisCard>

        {/* Keyboard Navigation */}
        <AnalysisCard title="Keyboard Navigation" icon={<Keyboard className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge
                variant={data.keyboard.passOrWarn === 'pass' ? 'default' : 'destructive'}
              >
                {data.keyboard.passOrWarn === 'pass' ? 'Pass' : 'Needs Review'}
              </Badge>
            </div>
            <div className="p-4 bg-secondary/30 rounded-xl">
              <p className="text-2xl font-bold">{data.keyboard.interactiveElements.length}</p>
              <p className="text-xs text-muted-foreground">Interactive Elements Detected</p>
            </div>
          </div>
        </AnalysisCard>

        {/* Sizing & Touch Targets */}
        <AnalysisCard title="Sizing & Touch Targets" icon={<Target className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Feasibility</span>
              <span
                className={`text-sm font-bold ${
                  data.sizing.feasibility === 'Possible' ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                {data.sizing.feasibility}
              </span>
            </div>
            {data.sizing.problemAreas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Problem Areas:</p>
                {data.sizing.problemAreas.slice(0, 3).map((issue, idx) => (
                  <p key={idx} className="text-sm">
                    • {issue}
                  </p>
                ))}
              </div>
            )}
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}
