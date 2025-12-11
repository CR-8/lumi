"use client";

import { Card } from "@/components/ui/card";
import { Sparkles, Eye, Palette, Layers } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  { icon: Sparkles, label: "Uploading image...", color: "text-purple-500" },
  { icon: Palette, label: "Analyzing colors...", color: "text-blue-500" },
  { icon: Eye, label: "Checking contrast...", color: "text-green-500" },
  { icon: Layers, label: "Evaluating layout...", color: "text-orange-500" },
];

export function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-primary/20 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center animate-spin-slow">
              <CurrentIcon className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>

          {/* Progress Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{steps[currentStep].label}</h3>
            <p className="text-sm text-muted-foreground">
              AI is working its magic
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary/30"
                }`}
              />
            ))}
          </div>

          {/* Loading Bar */}
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-primary via-accent to-primary animate-[shimmer_2s_ease-in-out_infinite] bg-size-[200%_100%]" />
          </div>
        </div>
      </Card>
    </div>
  );
}
