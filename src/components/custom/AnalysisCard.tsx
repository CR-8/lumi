'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function AnalysisCard({ title, children, className = '', icon }: AnalysisCardProps) {
  return (
    <Card className={cn(
      "border-none shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95",
      className
    )}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2 space-y-0">
        {icon && <div className="text-primary/70">{icon}</div>}
        <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
