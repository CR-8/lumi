'use client';

import { AnalysisResult } from '@/lib/types';
import { AnalysisCard } from '@/components/custom/AnalysisCard';
import { PaletteSwatch } from '@/components/custom/PaletteSwatch';
import { Palette, FileText, Layout } from 'lucide-react';

interface DesignTabProps {
  data: AnalysisResult;
}

export function DesignTab({ data }: DesignTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Color Palette */}
        <AnalysisCard
          title="Color Palette"
          icon={<Palette className="w-5 h-5" />}
          className="md:col-span-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PaletteSwatch colors={data.theme.basePalette} title="Base Colors" />
            <PaletteSwatch colors={data.theme.accentColors} title="Accent Colors" />
          </div>
        </AnalysisCard>

        {/* Content Tone */}
        <AnalysisCard title="Content Tone" icon={<FileText className="w-5 h-5" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clarity Score</span>
              <span className="text-xl font-bold">{data.content.clarityScore}%</span>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Detected Tone</p>
              <p className="font-medium capitalize">{data.content.tone}</p>
            </div>
          </div>
        </AnalysisCard>

        {/* UI Scheme */}
        <AnalysisCard title="UI Scheme" icon={<Layout className="w-5 h-5" />} className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.schemes.suggestions.map((scheme, idx) => (
              <div
                key={idx}
                className="p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors"
              >
                <p className="font-semibold mb-1">{scheme.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Confidence</span>
                  <span className="text-sm font-medium text-primary">{scheme.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}
