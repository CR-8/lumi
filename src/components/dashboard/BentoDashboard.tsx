"use client";

import { AnalysisResult } from "@/lib/types";
import { BentoGrid, BentoCard } from "./BentoGrid";
import { BentoStatsCard } from "./BentoStatsCard";
import { BentoChartCard } from "./BentoChartCard";
import { BentoListCard } from "./BentoListCard";
import { CircularProgress } from "./CircularProgress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Palette,
  Type,
  Layers,
  Sparkles,
  Activity,
  Smartphone,
  Grid3x3,
  MousePointer,
  Brain,
  TrendingUp,
  Target,
  Heart,
} from "lucide-react";

interface BentoDashboardProps {
  data: AnalysisResult;
}

export function BentoDashboard({ data }: BentoDashboardProps) {
  // Calculate scores - prioritize Gemini data if available
  const wcagScore =
    data.gemini?.wcagComplianceScore ??
    (data.wcag.score === "AAA" ? 100 : data.wcag.score === "AA" ? 85 : 50);
  const contrastScore =
    data.gemini?.contrastScore ??
    Math.round(
      (data.contrast.lightMode.filter((c) => c.passes.AA).length /
        Math.max(data.contrast.lightMode.length, 1)) *
        100
    );
  const overallScore = data.gemini?.overallQuality ?? data.overallScore.score;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getTrend = (score: number): "up" | "down" | "neutral" => {
    if (score >= 80) return "up";
    if (score >= 60) return "neutral";
    return "down";
  };

  // Prepare issues list - prioritize Gemini accessibility issues
  const geminiIssues = data.gemini?.accessibilityIssues || [];
  const issuesList = [
    ...geminiIssues.slice(0, 3).map((issue, idx) => ({
      id: `gemini-${idx}`,
      title: issue,
      status: "Critical",
      statusVariant: "destructive" as const,
      icon: <AlertCircle className="w-4 h-4" />,
    })),
    ...data.wcag.errors
      .slice(0, Math.max(0, 5 - geminiIssues.length))
      .map((err, idx) => ({
        id: `wcag-${idx}`,
        title: err,
        status: "Critical",
        statusVariant: "destructive" as const,
        icon: <AlertCircle className="w-4 h-4" />,
      })),
    ...data.wcag.warnings.slice(0, 2).map((warn, idx) => ({
      id: `warn-${idx}`,
      title: warn,
      status: "Warning",
      statusVariant: "secondary" as const,
      icon: <AlertCircle className="w-4 h-4" />,
    })),
  ];

  // Prepare recommendations - prioritize Gemini recommendations
  const geminiRecs = data.gemini?.recommendations || [];
  const recommendations = [
    ...geminiRecs.slice(0, 6).map((rec, idx) => ({
      id: `rec-${idx}`,
      title: rec,
      icon: <Sparkles className="w-4 h-4" />,
    })),
    ...data.hierarchy.suggestions
      .slice(0, Math.max(0, 6 - geminiRecs.length))
      .map((sug, idx) => ({
        id: `hier-${idx}`,
        title: sug,
        icon: <Layers className="w-4 h-4" />,
      })),
  ];

  // Color palette - prioritize Gemini color palette
  const geminiPalette = data.gemini?.colorPalette;
  const topColors = geminiPalette
    ? [
        ...geminiPalette.primary.map((c: string): [string, string] => [
          "primary",
          c,
        ]),
        ...geminiPalette.accent.map((c: string): [string, string] => [
          "accent",
          c,
        ]),
        ...geminiPalette.secondary
          .slice(0, 2)
          .map((c: string): [string, string] => ["secondary", c]),
      ].slice(0, 6)
    : data.schemes.suggestions[0]?.tokens
    ? Object.entries(data.schemes.suggestions[0].tokens).slice(0, 6)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>
      </div>

      {/* Main Bento Grid */}
      <BentoGrid>
        {/* Overall Score - Large Card */}
        <BentoCard className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4">
                <Activity className="w-3 h-3" />
                Overall Score
              </div>
              <div className="text-6xl font-bold mb-2">{overallScore}</div>
              <p className="text-primary-foreground/80 text-sm">
                {data.gemini?.overallQuality
                  ? overallScore >= 90
                    ? "Excellent"
                    : overallScore >= 75
                    ? "Good"
                    : overallScore >= 50
                    ? "Needs Fixing"
                    : "Poor"
                  : data.overallScore.label}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-primary-foreground/80">
                <span>Progress this month</span>
                <span className="font-medium text-primary-foreground">
                  +{Math.round(overallScore / 10)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* WCAG Score */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="WCAG Compliance"
            value={
              data.gemini?.wcagComplianceScore
                ? `${wcagScore}%`
                : data.wcag.score
            }
            icon={<CheckCircle className="w-5 h-5" />}
            change={{ value: wcagScore - 75, label: "from last check" }}
            trend={getTrend(wcagScore)}
            description={`${
              data.wcag.errors.length +
              (data.gemini?.accessibilityIssues.length || 0)
            } issues found`}
          />
        </BentoCard>

        {/* Contrast Score */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="Contrast Score"
            value={`${contrastScore}%`}
            icon={<Palette className="w-5 h-5" />}
            change={{ value: contrastScore - 80, label: "vs standard" }}
            trend={getTrend(contrastScore)}
            description={`${
              data.contrast.lightMode.filter((c) => c.passes.AA).length
            } passing`}
          />
        </BentoCard>

        {/* Typography Score */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="Typography"
            value={data.typography.readabilityScore}
            icon={<Type className="w-5 h-5" />}
            trend={getTrend(data.typography.readabilityScore)}
            description="Readability score"
          />
        </BentoCard>

        {/* Visual Hierarchy */}
        <BentoCard className="col-span-1">
          <BentoStatsCard
            title="Visual Hierarchy"
            value={data.hierarchy.priorityScore}
            icon={<Layers className="w-5 h-5" />}
            trend={getTrend(data.hierarchy.priorityScore)}
            description={`${
              Object.values(data.hierarchy.issues).flat().length
            } issues`}
          />
        </BentoCard>

        {/* Score Breakdown Chart */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <BentoChartCard
            title="Accessibility Breakdown"
            description="Component scores across categories"
          >
            <div className="w-full grid grid-cols-3 gap-4">
              {Object.entries(data.overallScore.breakdown).map(
                ([key, value]) => (
                  <div key={key} className="flex flex-col items-center">
                    <CircularProgress
                      value={value}
                      size={80}
                      strokeWidth={6}
                      className={getScoreColor(value)}
                    />
                    <p className="text-xs font-medium mt-2 capitalize">{key}</p>
                    <p className="text-xs text-muted-foreground">{value}%</p>
                  </div>
                )
              )}
            </div>
          </BentoChartCard>
        </BentoCard>

        {/* Target Audience */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">
                Target Audience & Industry
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Best Suited For
                </p>
                <p className="text-sm line-clamp-2">
                  {data.gemini?.targetAudienceMatch ||
                    data.audience.suggestions.slice(0, 1).join(" • ")}
                </p>
              </div>
              {data.gemini?.industryPrediction &&
                data.gemini.industryPrediction.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Industry Prediction
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.gemini.industryPrediction.map((industry, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </BentoCard>

        {/* Gemini UI Insights */}
        {data.gemini && (
          <BentoCard className="col-span-1">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">AI Insights</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">UI Type</p>
                  <p className="text-sm font-medium">{data.gemini.uiType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Design System
                  </p>
                  <p className="text-sm font-medium">
                    {data.gemini.designSystem}
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Cognitive Load */}
        {data.gemini?.cognitiveLoad && (
          <BentoCard className="col-span-1">
            <BentoStatsCard
              title="Cognitive Load"
              value={data.gemini.cognitiveLoad.level}
              icon={<Brain className="w-5 h-5" />}
              trend={getTrend(data.gemini.cognitiveLoad.score)}
              description={`${data.gemini.cognitiveLoad.score}/100 score`}
            />
          </BentoCard>
        )}

        {/* Interaction Clarity */}
        {data.gemini?.interactionClarity && (
          <BentoCard className="col-span-1">
            <BentoStatsCard
              title="Interaction Clarity"
              value={`${data.gemini.interactionClarity.score}%`}
              icon={<MousePointer className="w-5 h-5" />}
              trend={getTrend(data.gemini.interactionClarity.score)}
              description={`${data.gemini.interactionClarity.issues.length} issues found`}
            />
          </BentoCard>
        )}

        {/* Mobile Friendliness */}
        {data.gemini?.mobileFriendliness && (
          <BentoCard className="col-span-1">
            <BentoStatsCard
              title="Mobile Friendly"
              value={`${data.gemini.mobileFriendliness.score}%`}
              icon={<Smartphone className="w-5 h-5" />}
              trend={getTrend(data.gemini.mobileFriendliness.score)}
              description={`${data.gemini.mobileFriendliness.issues.length} issues detected`}
            />
          </BentoCard>
        )}

        {/* Layout Structure */}
        {data.gemini?.layoutStructure && (
          <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Grid3x3 className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Layout Structure</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Grid System
                  </p>
                  <p className="text-sm font-medium line-clamp-2">
                    {data.gemini.layoutStructure.gridSystem}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Alignment
                  </p>
                  <p className="text-sm font-medium">
                    {data.gemini.layoutStructure.alignmentScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Whitespace
                  </p>
                  <p className="text-sm font-medium">
                    {data.gemini.layoutStructure.whitespaceScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Consistency
                  </p>
                  <p className="text-sm font-medium">
                    {data.gemini.layoutStructure.consistencyScore}/100
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Emotional Tone */}
        {data.gemini?.emotionalTone && (
          <BentoCard className="col-span-1">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Emotional Tone</h3>
                </div>
                <p className="text-xs mb-2 line-clamp-2">
                  {data.gemini.emotionalTone.feel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${
                        i < data.gemini!.emotionalTone.rating
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {data.gemini.emotionalTone.rating}/5
                </span>
              </div>
            </div>
          </BentoCard>
        )}
        {/* Color Palette - Detailed */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Color Palette Analysis</h3>
              <Badge variant="outline" className="rounded-full">
                {geminiPalette
                  ? Object.values(geminiPalette).flat().length
                  : topColors.length}{" "}
                colors
              </Badge>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto">
              {geminiPalette ? (
                // Display Gemini color palette by category
                <>
                  {geminiPalette.primary.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Primary
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {geminiPalette.primary.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {geminiPalette.primary.map(
                          (color: string, idx: number) => (
                            <div key={idx} className="group relative">
                              <div
                                className="w-16 h-16 rounded-lg border-2 border-border transition-all group-hover:scale-110 group-hover:shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                              <code className="text-[10px] font-mono mt-1 block text-center text-muted-foreground">
                                {color}
                              </code>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {geminiPalette.secondary.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Secondary
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {geminiPalette.secondary.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {geminiPalette.secondary.map(
                          (color: string, idx: number) => (
                            <div key={idx} className="group relative">
                              <div
                                className="w-16 h-16 rounded-lg border-2 border-border transition-all group-hover:scale-110 group-hover:shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                              <code className="text-[10px] font-mono mt-1 block text-center text-muted-foreground">
                                {color}
                              </code>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {geminiPalette.accent.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Accent
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {geminiPalette.accent.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {geminiPalette.accent.map(
                          (color: string, idx: number) => (
                            <div key={idx} className="group relative">
                              <div
                                className="w-16 h-16 rounded-lg border-2 border-border transition-all group-hover:scale-110 group-hover:shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                              <code className="text-[10px] font-mono mt-1 block text-center text-muted-foreground">
                                {color}
                              </code>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {geminiPalette.text.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-foreground" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Text
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {geminiPalette.text.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {geminiPalette.text.map(
                          (color: string, idx: number) => (
                            <div key={idx} className="group relative">
                              <div
                                className="w-16 h-16 rounded-lg border-2 border-border transition-all group-hover:scale-110 group-hover:shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                              <code className="text-[10px] font-mono mt-1 block text-center text-muted-foreground">
                                {color}
                              </code>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {geminiPalette.background.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-background border border-border" />
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Background
                        </h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1.5"
                        >
                          {geminiPalette.background.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {geminiPalette.background.map(
                          (color: string, idx: number) => (
                            <div key={idx} className="group relative">
                              <div
                                className="w-16 h-16 rounded-lg border-2 border-border transition-all group-hover:scale-110 group-hover:shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                              <code className="text-[10px] font-mono mt-1 block text-center text-muted-foreground">
                                {color}
                              </code>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Fallback to original display if no Gemini data
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {topColors.map(([, color], idx) => (
                    <div key={idx} className="group relative">
                      <div
                        className="aspect-square rounded-lg border border-border transition-transform group-hover:scale-105"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-[10px] text-center mt-1 text-muted-foreground truncate">
                        {color}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Strengths */}
        {data.gemini && data.gemini.strengths.length > 0 && (
          <BentoCard className="col-span-1 md:col-span-1 lg:col-span-1">
            <BentoListCard
              title="Strengths"
              items={data.gemini.strengths.slice(0, 3).map((strength, idx) => ({
                id: `strength-${idx}`,
                title: strength,
                icon: <CheckCircle className="w-4 h-4 text-green-500" />,
              }))}
              headerAction={
                <Badge
                  variant="outline"
                  className="rounded-full bg-green-500/10 text-green-500 border-green-500/20"
                >
                  {data.gemini.strengths.length}
                </Badge>
              }
            />
          </BentoCard>
        )}

        {/* Weaknesses */}
        {data.gemini && data.gemini.weaknesses.length > 0 && (
          <BentoCard className="col-span-1 md:col-span-1 lg:col-span-1">
            <BentoListCard
              title="Weaknesses"
              items={data.gemini.weaknesses
                .slice(0, 3)
                .map((weakness, idx) => ({
                  id: `weakness-${idx}`,
                  title: weakness,
                  icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
                }))}
              headerAction={
                <Badge
                  variant="outline"
                  className="rounded-full bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                >
                  {data.gemini.weaknesses.length}
                </Badge>
              }
            />
          </BentoCard>
        )}

        {/* Summary Card */}
        {data.gemini?.summary && (
          <BentoCard className="col-span-1 md:col-span-3 lg:col-span-3">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Summary & Verdict</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm">{data.gemini.summary.verdict}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Top Problems
                    </p>
                    <ul className="space-y-1.5">
                      {data.gemini.summary.top3Problems.map((problem, idx) => (
                        <li
                          key={idx}
                          className="text-xs flex items-start gap-2"
                        >
                          <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                          <span>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Top Fixes
                    </p>
                    <ul className="space-y-1.5">
                      {data.gemini.summary.top3Fixes.map((fix, idx) => (
                        <li
                          key={idx}
                          className="text-xs flex items-start gap-2"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Component Analysis */}
        {data.gemini?.componentAnalysis &&
          data.gemini.componentAnalysis.length > 0 && (
            <BentoCard className="col-span-1 md:col-span-3 lg:col-span-3 row-span-2">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Component Analysis</h3>
                  <Badge variant="outline" className="rounded-full">
                    {data.gemini.componentAnalysis.length} components
                  </Badge>
                </div>
                <div className="space-y-3 overflow-y-auto pr-2">
                  {data.gemini.componentAnalysis.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-medium">
                          {comp.component}
                        </h4>
                        {comp.wcagViolation &&
                          !comp.wcagViolation
                            .toLowerCase()
                            .includes("none") && (
                            <Badge
                              variant="destructive"
                              className="text-[10px] px-1.5 py-0"
                            >
                              WCAG
                            </Badge>
                          )}
                      </div>
                      {comp.issues && comp.issues.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                          {comp.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-yellow-500 shrink-0 mt-0.5">
                                •
                              </span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs">
                        <span className="font-medium text-primary">
                          Suggestion:
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {comp.suggestion}
                        </span>
                      </p>
                    </div>
                  ))}
                  \n{" "}
                </div>
              </div>
            </BentoCard>
          )}

        {/* Summary Card */}
        {data.gemini?.summary && (
          <BentoCard className="col-span-1 md:col-span-3 lg:col-span-3">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Summary & Verdict</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm">{data.gemini.summary.verdict}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Top Problems
                    </p>
                    <ul className="space-y-1">
                      {data.gemini.summary.top3Problems.map((problem, idx) => (
                        <li
                          key={idx}
                          className="text-xs flex items-start gap-2"
                        >
                          <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                          <span>{problem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Top Fixes
                    </p>
                    <ul className="space-y-1">
                      {data.gemini.summary.top3Fixes.map((fix, idx) => (
                        <li
                          key={idx}
                          className="text-xs flex items-start gap-2"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Component Analysis */}
        {data.gemini?.componentAnalysis &&
          data.gemini.componentAnalysis.length > 0 && (
            <BentoCard className="col-span-1 md:col-span-3 lg:col-span-3 row-span-2">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Component Analysis</h3>
                  <Badge variant="outline" className="rounded-full">
                    {data.gemini.componentAnalysis.length} components
                  </Badge>
                </div>
                <div className="space-y-3 overflow-y-auto">
                  {data.gemini.componentAnalysis.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-medium">
                          {comp.component}
                        </h4>
                        {comp.wcagViolation &&
                          comp.wcagViolation !==
                            "None visible, contrast is good." &&
                          comp.wcagViolation !== "None strictly." &&
                          comp.wcagViolation !==
                            "None strictly, but borderline for some users with low vision." &&
                          comp.wcagViolation !==
                            "None strictly, but readability could be improved." && (
                            <Badge variant="destructive" className="text-xs">
                              WCAG Issue
                            </Badge>
                          )}
                      </div>
                      {comp.issues && comp.issues.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                          {comp.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-yellow-500 shrink-0">
                                •
                              </span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-primary">
                        <strong>Suggestion:</strong> {comp.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          )}

        {/* AI Recommendations */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <BentoListCard
            title="AI Recommendations"
            items={recommendations}
            headerAction={
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Powered by Gemini</span>
              </div>
            }
          />
        </BentoCard>
        {/* Issues List */}
        <BentoCard className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <BentoListCard
            title="Critical Issues"
            items={issuesList}
            headerAction={
              <Badge variant="destructive" className="rounded-full">
                {data.wcag.errors.length}
              </Badge>
            }
            emptyMessage="No critical issues found! 🎉"
          />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
