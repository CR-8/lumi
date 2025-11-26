"use client";

import { GeminiAnalysis } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Palette,
  LayoutGrid,
  Type,
  Users,
  Eye,
  TrendingUp,
} from "lucide-react";

interface GeminiInsightsProps {
  analysis: GeminiAnalysis;
}

export function GeminiInsights({ analysis }: GeminiInsightsProps) {
  const getQualityColor = (score: number) => {
    if (score >= 85)
      return "text-green-500 bg-green-500/10 border-green-500/20";
    if (score >= 70) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (score >= 50)
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      {/* Header with Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Quality
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">{analysis.overallQuality}</p>
              <p className="text-muted-foreground mb-1">/100</p>
            </div>
            <Badge
              className={`mt-2 ${getQualityColor(analysis.overallQuality)}`}
            >
              {getQualityLabel(analysis.overallQuality)}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                WCAG Compliance
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">
                {analysis.wcagComplianceScore}
              </p>
              <p className="text-muted-foreground mb-1">/100</p>
            </div>
            <Badge
              className={`mt-2 ${getQualityColor(
                analysis.wcagComplianceScore
              )}`}
            >
              {getQualityLabel(analysis.wcagComplianceScore)}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contrast Score
              </CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">{analysis.contrastScore}</p>
              <p className="text-muted-foreground mb-1">/100</p>
            </div>
            <Badge
              className={`mt-2 ${getQualityColor(analysis.contrastScore)}`}
            >
              {getQualityLabel(analysis.contrastScore)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI-Powered Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="weaknesses">Issues</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="recommendations">Actions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">UI Type</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {analysis.uiType}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Design System</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {analysis.designSystem}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Target Audience</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {analysis.targetAudienceMatch}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Typography</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6 line-clamp-2">
                    {analysis.typographyAnalysis.fontStyle} - Readability:{" "}
                    {analysis.typographyAnalysis.readabilityScore}/100
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Color Scheme</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {analysis.colorSchemeAnalysis.effectiveness}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Layout</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Grid: {analysis.layoutStructure.gridSystem} | Alignment:{" "}
                  {analysis.layoutStructure.alignmentScore}/100
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Summary</h3>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {analysis.summary.verdict}
                </p>
              </div>
            </TabsContent>

            {/* Strengths Tab */}
            <TabsContent value="strengths" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {analysis.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/20"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Weaknesses Tab */}
            <TabsContent value="weaknesses" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {analysis.weaknesses.map((weakness, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-sm">{weakness}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {analysis.accessibilityIssues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20"
                    >
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20"
                    >
                      <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Color Palette Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analysis.colorPalette).map(([category, colors]) => {
            if (colors.length === 0) return null;
            return (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium capitalize">
                  {category} Colors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <code className="text-xs px-2 py-1 bg-muted rounded">
                        {color}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
