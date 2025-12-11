"use client";

import { useState } from "react";
import { Sidebar } from "@/components/custom/Sidebar";
import { BentoDashboard } from "@/components/dashboard/BentoDashboard";
import { UploadSection } from "@/components/dashboard/UploadSection";
import { FeatureGrid } from "@/components/custom/FeatureGrid";
import { AnalysisLoader } from "@/components/custom/AnalysisLoader";
import { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Twitter, Github, FileText } from "lucide-react";

export default function Home() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [useGemini, setUseGemini] = useState(true);

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setShowUpload(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("useGemini", useGemini.toString());

      const response = await fetch("/api/analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysisData(data.analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze image. Please try again.");
      setShowUpload(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setShowUpload(true);
    setAnalysisData(null);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Analysis Loader Overlay */}
      {isAnalyzing && <AnalysisLoader />}
      
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          {showUpload || !analysisData ? (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Hero Section */}
              <div className="text-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight">
                  Best UI Accessibility
                  <br />
                  <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                    Analysis Platform
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Find the best WCAG compliance insights for your design.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-8 hover:scale-105 transition-transform"
                    onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Get Started
                  </Button>
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-transform shadow-lg"
                    onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Analyze Now
                  </Button>
                </div>
              </div>

              {/* Showcase Card */}
              <UploadSection
                onFileSelected={handleFileSelected}
                isUploading={isAnalyzing}
                useGemini={useGemini}
                onGeminiToggle={setUseGemini}
              />

              {/* Feature Grid */}
              <FeatureGrid />

              {/* Stats Section */}
              <div className="grid grid-cols-3 gap-8 py-12 mt-12 border-t border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Designs Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">&lt;2s</div>
                  <div className="text-sm text-muted-foreground">Analysis Time</div>
                </div>
              </div>
            </div>
          ) : (
            <BentoDashboard data={analysisData} />
          )}
        </main>
      </div>
    </div>
  );
}
