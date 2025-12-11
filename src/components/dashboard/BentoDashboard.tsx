"use client";

import { AnalysisResult } from "@/lib/types";
import { BentoGrid, BentoCard } from "./BentoGrid";
import { BentoStatsCard } from "./BentoStatsCard";
import { BentoListCard } from "./BentoListCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Sparkles,
  Activity,
  Smartphone,
  Grid3x3,
  MousePointer,
  Brain,
  Target,
  Eye,
  Download,
  Share2,
  Check,
} from "lucide-react";

interface BentoDashboardProps {
  data: AnalysisResult;
}

export function BentoDashboard({ data }: BentoDashboardProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Calculate scores - prioritize Gemini data
  const wcagScore = data.gemini?.wcagComplianceScore ?? 0;
  const contrastScore = data.gemini?.contrastScore ?? 0;
  const overallScore = data.gemini?.overallQuality ?? data.overallScore.score;

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getTrend = (score: number): "up" | "down" | "neutral" => {
    if (score >= 80) return "up";
    if (score >= 60) return "neutral";
    return "down";
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    const shareData = {
      title: "UI Analysis Results - Lumi",
      text: `Check out my UI analysis results! Overall Score: ${overallScore}/100`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Error sharing:", error);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        } catch (clipboardError) {
          console.error("Clipboard error:", clipboardError);
        }
      }
    } finally {
      setTimeout(() => setIsSharing(false), 2000);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Create a comprehensive export object
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          appName: "Lumi - UI Accessibility Analyzer",
          version: "1.0.0",
        },
        scores: {
          overall: overallScore,
          wcag: wcagScore,
          contrast: contrastScore,
          cognitive: data.gemini?.cognitiveLoad?.score,
          mobile: data.gemini?.mobileFriendliness?.score,
          interaction: data.gemini?.interactionClarity?.score,
        },
        analysis: {
          uiType: data.gemini?.uiType,
          designSystem: data.gemini?.designSystem,
          targetAudience: data.gemini?.targetAudienceMatch,
          industries: data.gemini?.industryPrediction,
        },
        insights: {
          summary: data.gemini?.summary,
          strengths: data.gemini?.strengths,
          weaknesses: data.gemini?.weaknesses,
          recommendations: data.gemini?.recommendations,
        },
        technical: {
          colorPalette: data.gemini?.colorPalette,
          layoutStructure: data.gemini?.layoutStructure,
          componentAnalysis: data.gemini?.componentAnalysis,
          accessibilityIssues: data.gemini?.accessibilityIssues,
        },
      };

      // Convert to JSON and create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `lumi-analysis-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setTimeout(() => setIsExporting(false), 2000);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* iOS-style Header */}
      <div className="flex items-center justify-between p-5 glass-strong rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Analysis Results</h1>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 font-medium">
              {data.gemini?.uiType || "UI Design"}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground font-medium">
              {data.gemini?.designSystem || "Custom Design"}
            </span>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-9 px-4 shadow-soft hover:shadow-medium transition-shadow"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? (
              <>
                <Check className="w-3.5 h-3.5 mr-2" />
                Shared
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 mr-2" />
                Share
              </>
            )}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-full h-9 px-4 shadow-medium hover:shadow-lg transition-shadow"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Check className="w-3.5 h-3.5 mr-2" />
                Exported
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Compact Bento Grid */}
      <BentoGrid>
        {/* Overall Score - Hero Card with Gradient */}
        <BentoCard 
          className={`col-span-1 row-span-2 ${
            overallScore >= 85 
              ? "bg-gradient-to-br from-green-500 via-green-500/95 to-green-500/90" 
              : overallScore >= 60 
              ? "bg-gradient-to-br from-yellow-500 via-yellow-500/95 to-yellow-500/90" 
              : "bg-gradient-to-br from-red-500 via-red-500/95 to-red-500/90"
          } text-white border-0 shadow-lg hover:shadow-xl`}
          hover={false}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wide">
                <Activity className="w-3.5 h-3.5" />
                Overall Score
              </div>
              <div className="space-y-2">
                <div className="text-6xl font-bold tracking-tight">{overallScore}</div>
              </div>

              <div className="space-y-2">
                <div className="space-y-2 flex flex-col mt-28">              
                  <p className="text-white/90 text-sm font-medium">
                    {overallScore >= 90 ? "✨ Excellent" : overallScore >= 75 ? "👍 Good" : overallScore >= 50 ? "👌 Fair" : "⚠️ Needs Work"}
                  </p>
                <div className="flex justify-between text-xs font-medium text-white/70">
                <span>Quality</span>
                <span>{overallScore}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
                </div>
            </div>
            </div>
          </div>
        </BentoCard>

        {/* WCAG Compliance */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="WCAG"
            value={`${wcagScore}%`}
            icon={<CheckCircle className="w-4 h-4" />}
            trend={getTrend(wcagScore)}
            description={`${data.gemini?.accessibilityIssues?.length || 0} issues`}
          />
        </BentoCard>

        {/* Contrast Score */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="Contrast"
            value={`${contrastScore}%`}
            icon={<Eye className="w-4 h-4" />}
            trend={getTrend(contrastScore)}
            description="Color analysis"
          />
        </BentoCard>

        {/* Cognitive Load */}
        {data.gemini?.cognitiveLoad && (
          <BentoCard className="col-span-1">
            <BentoStatsCard
              title="Cognitive"
              value={data.gemini.cognitiveLoad.level}
              icon={<Brain className="w-4 h-4" />}
              trend={getTrend(data.gemini.cognitiveLoad.score)}
              description={`${data.gemini.cognitiveLoad.score}/100`}
            />
          </BentoCard>
        )}

        {/* Mobile Score */}
        {data.gemini?.mobileFriendliness && (
          <BentoCard className="col-span-1">
            <BentoStatsCard
              title="Mobile"
              value={`${data.gemini.mobileFriendliness.score}%`}
              icon={<Smartphone className="w-4 h-4" />}
              trend={getTrend(data.gemini.mobileFriendliness.score)}
              description="Friendliness"
            />
          </BentoCard>
        )}

        {/* Layout Structure */}
        {data.gemini?.layoutStructure && (
          <BentoCard className="col-span-1">
            <div className="flex flex-col h-full gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Grid3x3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Layout Metrics</h3>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {data.gemini.layoutStructure.alignmentScore}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Align</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {data.gemini.layoutStructure.whitespaceScore}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Space</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {data.gemini.layoutStructure.consistencyScore}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Consist</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-primary">
                    {Math.round((data.gemini.layoutStructure.alignmentScore + data.gemini.layoutStructure.whitespaceScore + data.gemini.layoutStructure.consistencyScore) / 3)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Avg</p>
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Interaction Clarity */}
        {data.gemini?.interactionClarity && (
          <BentoCard className="col-span-1 row-span-1">
            <BentoStatsCard
              title="Interaction"
              value={`${data.gemini.interactionClarity.score}%`}
              icon={<MousePointer className="w-4 h-4" />}
              trend={getTrend(data.gemini.interactionClarity.score)}
              description={`${data.gemini.interactionClarity.issues.length} issues`}
            />
          </BentoCard>
        )}


        {/* Summary & Verdict */}
        {data.gemini?.summary && (
          <BentoCard className="col-span-2">
            <div className="flex flex-col h-full ">
              <div className="flex items-center gap-1 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
          <h3 className="text-sm font-semibold">AI Verdict</h3>
              </div>
              <p className="text-sm mb-3 line-clamp-2">{data.gemini.summary.verdict}</p>
              <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Top Problems</p>
            <ul className="space-y-1">
              {data.gemini.summary.top3Problems.map((problem, idx) => (
                <li key={idx} className="text-xs flex items-start gap-1">
            <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
            <span>{problem}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-500/10">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-sm font-bold text-green-500">Quick Fixes</p>
            </div>
            <ul className="space-y-2">
              {data.gemini.summary.top3Fixes.map((fix, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2 p-2 rounded-lg hover:bg-accent/5 transition-colors">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-500 text-xs font-bold shrink-0">✓</span>
            <span className="leading-relaxed">{fix}</span>
                </li>
              ))}
            </ul>
          </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Strengths & Weaknesses */}
        {data.gemini?.strengths && data.gemini?.weaknesses && (
          <BentoCard className="col-span-2 row-span-1">
            <div className="flex flex-col h-full">
              <h3 className="text-base font-semibold mb-2">Analysis</h3>
              <div className="space-y-3 overflow-y-auto pr-1">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <p className="text-sm font-semibold text-green-500">Strengths ({data.gemini.strengths.length})</p>
            </div>
            <ul className="space-y-1">
              {data.gemini.strengths.slice(0, 4).map((strength, idx) => (
          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-1">
            <span className="text-green-500 shrink-0">•</span>
            <span>{strength}</span>
          </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <AlertCircle className="w-3 h-3 text-yellow-500" />
              <p className="text-sm font-semibold text-yellow-500">Weaknesses ({data.gemini.weaknesses.length})</p>
            </div>
            <ul className="space-y-1">
              {data.gemini.weaknesses.slice(0, 4).map((weakness, idx) => (
          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-1">
            <span className="text-yellow-500 shrink-0">•</span>
            <span>{weakness}</span>
          </li>
              ))}
            </ul>
          </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Target Audience & Industry - Enhanced */}
        {data.gemini?.targetAudienceMatch && (
          <BentoCard className="col-span-2">
            <div className="flex flex-col h-full gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Target Audience</h3>
              </div>
              <p className="text-sm leading-relaxed">{data.gemini.targetAudienceMatch}</p>
              {data.gemini.industryPrediction && data.gemini.industryPrediction.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.gemini.industryPrediction.map((industry, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs h-6 px-3 rounded-full font-medium">{industry}</Badge>
                  ))}
                </div>
              )}
            </div>
          </BentoCard>
        )}
        
        {/* Accessibility Issues - Enhanced */}
        {data.gemini?.accessibilityIssues && data.gemini.accessibilityIssues.length > 0 && (
          <BentoCard className="col-span-2 row-span-1 border-destructive/20">
            <div className="flex flex-col h-full gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-destructive">Accessibility Issues</h3>
                </div>
                <Badge variant="destructive" className="rounded-full h-6 px-3 text-xs font-bold">
                  {data.gemini.accessibilityIssues.length}
                </Badge>
              </div>
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-2">
                  {data.gemini.accessibilityIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20 hover:border-destructive/30 transition-all"
                    >
                      <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Badge variant="destructive" className="text-[10px] px-2 py-0.5 h-5 rounded-full font-bold">
                          Critical
                        </Badge>
                        <p className="text-xs leading-relaxed font-medium">{issue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </BentoCard>
        )}

      </BentoGrid>
    </div>
  );
}
