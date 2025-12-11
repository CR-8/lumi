"use client";

import { Card } from "@/components/ui/card";
import { UploadDropzone } from "@/components/custom/UploadDropzone";

interface UploadSectionProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  useGemini: boolean;
  onGeminiToggle: (enabled: boolean) => void;
}

export function UploadSection({
  onFileSelected,
  isUploading,
}: UploadSectionProps) {

  return (
    <div id="upload" className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
      {/* Main Showcase Card with Blue Browser Design */}
      <Card className="rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl bg-linear-to-br from-primary via-primary to-accent hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-shadow duration-500">
        <div className="p-8 pb-0">
          {/* Browser-like header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 ml-4">
              <div className="h-7 bg-primary-foreground/10 rounded-full px-4 flex items-center">
                <span className="text-xs text-primary-foreground/60">lumi.ai/analyze</span>
              </div>
            </div>
          </div>

          {/* Wavy divider */}
          <div className="relative -mx-8">
            <svg 
              viewBox="0 0 1200 30" 
              preserveAspectRatio="none" 
              className="w-full h-8 fill-background"
            >
              <path d="M0,15 Q150,0 300,15 T600,15 T900,15 T1200,15 L1200,30 L0,30 Z" />
            </svg>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-background px-8 pb-8 pt-4">
          <div className="text-center mb-8 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient leading-tight">
              A tool that doesn't just analyze your design — it elevates it.
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Smart and intuitive, Lumi adapts to your accessibility needs.
            </p>
          </div>

          {/* Upload Area */}
          <Card className="rounded-2xl p-8 shadow-sm border border-border/50 hover:border-primary/30 transition-colors duration-300">
            <UploadDropzone
              onFileSelected={onFileSelected}
              isUploading={isUploading}
            />
          </Card>
        </div>
      </Card>
    </div>
  );
}
