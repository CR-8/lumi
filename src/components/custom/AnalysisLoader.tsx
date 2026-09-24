"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

const steps = ["Uploading image", "Analyzing colors", "Checking contrast", "Evaluating layout"];

export function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div role="status" className="frosted fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <LoaderCircle className="size-8 animate-spin text-ink-80" aria-hidden />
      <p className="text-tagline" aria-hidden>
        {steps[currentStep]}…
      </p>
      <p className="text-caption text-ink-80">
        <span className="sr-only">Analyzing your design. </span>
        This usually takes a few seconds.
      </p>
    </div>
  );
}
