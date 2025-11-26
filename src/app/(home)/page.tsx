'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/custom/Sidebar';
import { Header } from '@/components/custom/Header';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UploadSection } from '@/components/dashboard/UploadSection';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { AccessibilityTab } from '@/components/dashboard/AccessibilityTab';
import { DesignTab } from '@/components/dashboard/DesignTab';
import { AIInsightsTab } from '@/components/dashboard/AIInsightsTab';
import { AnalysisResult } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';

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
      formData.append('file', file);
      formData.append('useGemini', useGemini.toString());

      const response = await fetch('/api/analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysisData(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze image. Please try again.');
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
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Header onUploadClick={handleNewAnalysis} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {showUpload || !analysisData ? (
            <UploadSection
              onFileSelected={handleFileSelected}
              isUploading={isAnalyzing}
              useGemini={useGemini}
              onGeminiToggle={setUseGemini}
            />
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <DashboardHeader
                title="Analysis Report"
                subtitle={`Generated on ${new Date().toLocaleDateString()}`}
                onRefresh={handleNewAnalysis}
                onExport={() => console.log('Export PDF')}
              />

              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-surface p-1 rounded-xl border border-border/50 inline-flex h-auto">
                  <TabsTrigger
                    value="overview"
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="accessibility"
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Accessibility
                  </TabsTrigger>
                  <TabsTrigger
                    value="design"
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Design System
                  </TabsTrigger>
                  {analysisData.gemini && (
                    <TabsTrigger
                      value="ai"
                      className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
                    >
                      <Sparkles className="w-3 h-3" /> AI Insights
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview">
                  <OverviewTab data={analysisData} />
                </TabsContent>

                <TabsContent value="accessibility">
                  <AccessibilityTab data={analysisData} />
                </TabsContent>

                <TabsContent value="design">
                  <DesignTab data={analysisData} />
                </TabsContent>

                {analysisData.gemini && (
                  <TabsContent value="ai">
                    <AIInsightsTab data={analysisData.gemini} />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
