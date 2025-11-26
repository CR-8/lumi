'use client';

import { GeminiAnalysis } from '@/lib/types';
import { AnalysisCard } from '@/components/custom/AnalysisCard';
import { Sparkles, CheckCircle, AlertCircle, Lightbulb, Users } from 'lucide-react';

interface AIInsightsTabProps {
  data: GeminiAnalysis;
}

export function AIInsightsTab({ data }: AIInsightsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Strengths */}
        <AnalysisCard title="AI Strengths" icon={<Sparkles className="w-5 h-5 text-green-500" />}>
          <ul className="space-y-3">
            {data.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </AnalysisCard>

        {/* AI Weaknesses */}
        <AnalysisCard title="AI Weaknesses" icon={<AlertCircle className="w-5 h-5 text-yellow-500" />}>
          <ul className="space-y-3">
            {data.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </AnalysisCard>

        {/* Strategic Recommendations */}
        <AnalysisCard
          title="Strategic Recommendations"
          icon={<Lightbulb className="w-5 h-5 text-primary" />}
          className="md:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </AnalysisCard>

        {/* UX Analysis */}
        <AnalysisCard
          title="UX Analysis"
          icon={<Users className="w-5 h-5" />}
          className="md:col-span-2"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.userExperience}
          </p>
        </AnalysisCard>
      </div>
    </div>
  );
}
