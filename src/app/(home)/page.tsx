"use client";

import { useState } from "react";
import { GlobalNav, Footer } from "@/components/custom/SiteChrome";
import { Landing } from "@/components/custom/Landing";
import { Results } from "@/components/dashboard/Results";
import { AnalysisLoader } from "@/components/custom/AnalysisLoader";
import { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [analysis, setAnalysis] = useState<{ data: AnalysisResult; file: File; image: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(false);

  const handleFileSelected = async (file: File) => {
    setIsAnalyzing(true);
    setError(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setAnalysis({ data: data.analysis, file, image: URL.createObjectURL(file) });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Analysis error:", error);
      setError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    if (analysis) URL.revokeObjectURL(analysis.image);
    setAnalysis(null);
    window.scrollTo(0, 0);
  };

  return (
    <div id="top">
      {isAnalyzing && <AnalysisLoader />}
      <GlobalNav />
      {analysis ? (
        <Results data={analysis.data} file={analysis.file} image={analysis.image} onNewAnalysis={handleNewAnalysis} />
      ) : (
        <Landing onFileSelected={handleFileSelected} isAnalyzing={isAnalyzing} error={error} />
      )}
      <Footer />
    </div>
  );
}
