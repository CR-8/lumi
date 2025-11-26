'use client';

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { UploadDropzone } from '@/components/custom/UploadDropzone';

interface UploadSectionProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  useGemini: boolean;
  onGeminiToggle: (enabled: boolean) => void;
}

export function UploadSection({
  onFileSelected,
  isUploading,
  useGemini,
  onGeminiToggle
}: UploadSectionProps) {
  return (
    <div className="max-w-2xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Analyze Your UI
        </h2>
        <p className="text-lg text-muted-foreground">
          Get comprehensive WCAG, design, and accessibility insights instantly.
        </p>
      </div>
      
      <Card className="rounded-3xl p-8 shadow-sm border border-border/50 mb-8">
        <div className="flex items-center justify-between mb-6 p-4 bg-secondary/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${useGemini ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <Label htmlFor="gemini-mode" className="font-semibold text-base cursor-pointer">
                Gemini AI Analysis
              </Label>
              <p className="text-xs text-muted-foreground">
                Enhanced insights using Google's Gemini 1.5 Flash
              </p>
            </div>
          </div>
          <Switch
            id="gemini-mode"
            checked={useGemini}
            onCheckedChange={onGeminiToggle}
          />
        </div>
        
        <UploadDropzone
          onFileSelected={onFileSelected}
          isUploading={isUploading}
        />
      </Card>

      {isUploading && (
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary animate-spin-slow" />
          </div>
          <p className="text-muted-foreground font-medium">
            Analyzing UI structure, contrast, and accessibility...
          </p>
        </div>
      )}
    </div>
  );
}
