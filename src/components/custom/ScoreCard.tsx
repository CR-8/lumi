'use client';

import { cn } from '@/lib/utils';

interface ScoreCardProps {
  score: number;
  label: string;
  breakdown?: Record<string, number>;
}

export function ScoreCard({ score, label, breakdown }: ScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 90) return 'text-green-500';
    if (value >= 75) return 'text-blue-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (value: number) => {
    if (value >= 90) return 'bg-green-500/10 text-green-600';
    if (value >= 75) return 'bg-blue-500/10 text-blue-600';
    if (value >= 60) return 'bg-yellow-500/10 text-yellow-600';
    return 'bg-red-500/10 text-red-600';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-40 h-40 group">
        <svg className="w-full h-full transform -rotate-90 transition-all duration-700 ease-out group-hover:scale-105" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-secondary"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            className={cn("transition-all duration-1000 ease-out", getScoreColor(score))}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
          <span className={cn("text-5xl font-bold tracking-tighter", getScoreColor(score))}>{score}</span>
          <span className="text-sm text-muted-foreground font-medium">/ 100</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className={cn("inline-flex px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm", getScoreBg(score))}>
          {label}
        </div>
      </div>

      {breakdown && (
        <div className="w-full space-y-3 mt-2">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm group hover:bg-secondary/30 p-2 rounded-lg transition-colors">
              <span className="capitalize text-muted-foreground font-medium">{key}</span>
              <span className={cn("font-bold", getScoreColor(value))}>{value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
