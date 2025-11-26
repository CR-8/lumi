'use client';

import { AnalysisResult } from '@/lib/types';
import { StatsCard } from './StatsCard';
import { MetricCard } from './MetricCard';
import { CircularProgress } from './CircularProgress';
import { ProgressBar } from './ProgressBar';
import { AnalysisCard } from '@/components/custom/AnalysisCard';
import { PaletteSwatch } from '@/components/custom/PaletteSwatch';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  CheckCircle,
  Palette,
  Type,
  Monitor,
  Layers,
  Users,
  Sparkles
} from 'lucide-react';

interface OverviewTabProps {
  data: AnalysisResult;
}

export function OverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Overall Score"
          value={data.overallScore.score}
          icon={<TrendingUp className="w-5 h-5" />}
          badge={{
            label: data.overallScore.label,
            variant: data.overallScore.score >= 80 ? 'default' : 'destructive'
          }}
        />

        <StatsCard
          title="WCAG Compliance"
          value={data.wcag.score}
          icon={<CheckCircle className="w-5 h-5" />}
          badge={{
            label: `${data.wcag.errors.length} Errors`,
            variant: data.wcag.errors.length === 0 ? 'default' : 'destructive'
          }}
        />

        <StatsCard
          title="Contrast Ratio"
          value={`${data.contrast.lightMode.filter(c => c.ratio >= 4.5).length}/${data.contrast.lightMode.length}`}
          icon={<Palette className="w-5 h-5" />}
          badge={{
            label: 'Passing',
            variant: 'secondary'
          }}
        />

        {data.gemini && (
          <StatsCard
            title="AI Quality"
            value={`${data.gemini.overallQuality}%`}
            icon={<Sparkles className="w-5 h-5" />}
            className="bg-linear-to-br from-primary/5 to-transparent border-primary/20"
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Information Hierarchy - Large Card */}
        <AnalysisCard
          title="Information Hierarchy"
          icon={<Layers className="w-5 h-5" />}
          className="md:col-span-2"
        >
          <div className="flex items-center gap-8">
            <CircularProgress
              value={data.hierarchy.priorityScore}
              size={120}
              strokeWidth={8}
              color="text-primary"
            />
            <div className="space-y-3 flex-1">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Suggestions
              </h4>
              <ul className="space-y-2">
                {data.hierarchy.suggestions.slice(0, 3).map((suggestion, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnalysisCard>

        {/* Typography Card */}
        <MetricCard
          title="Typography"
          value={`${data.typography.readabilityScore}%`}
          subtitle={data.typography.pairings[0]?.primary || 'N/A'}
          icon={<Type className="w-5 h-5" />}
          trend={{
            value: 'Readability',
            label: 'Score'
          }}
        />

        {/* Color Palette */}
        <AnalysisCard title="Theme Palette" icon={<Palette className="w-5 h-5" />}>
          <div className="space-y-4">
            <PaletteSwatch colors={data.theme.basePalette} title="Base" />
            <PaletteSwatch colors={data.theme.accentColors} title="Accents" />
          </div>
        </AnalysisCard>

        {/* Target Audience */}
        <AnalysisCard title="Target Audience" icon={<Users className="w-5 h-5" />}>
          <div className="space-y-3">
            {data.audience.detected.slice(0, 3).map((aud, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-2 rounded-lg bg-secondary/30"
              >
                <span className="font-medium text-sm">{aud.category}</span>
                <Badge variant="outline" className="text-xs">
                  {aud.confidence}%
                </Badge>
              </div>
            ))}
          </div>
        </AnalysisCard>

        {/* Responsiveness */}
        <AnalysisCard title="Responsiveness" icon={<Monitor className="w-5 h-5" />}>
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div
              className={`text-lg font-semibold px-4 py-2 rounded-full mb-2 ${
                data.responsiveness.layoutShiftRisk === 'low'
                  ? 'bg-green-500/10 text-green-600'
                  : data.responsiveness.layoutShiftRisk === 'medium'
                  ? 'bg-yellow-500/10 text-yellow-600'
                  : 'bg-red-500/10 text-red-600'
              }`}
            >
              {data.responsiveness.layoutShiftRisk.toUpperCase()} RISK
            </div>
            <p className="text-xs text-muted-foreground text-center">Layout Shift Risk</p>
          </div>
        </AnalysisCard>
      </div>
    </div>
  );
}
