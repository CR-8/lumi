import { NextRequest, NextResponse } from "next/server";
import { extractPalette } from "@/lib/palette";
import { measureImage, processImage } from "@/lib/image";
import {
  analyzeContrast,
  generateWCAGAnalysis,
  checkColorBlindSafety,
} from "@/lib/wcag";
import { analyzeKeyboardAccessibility } from "@/lib/keyboard";
import { analyzeSizing } from "@/lib/sizing";
import { analyzeHierarchy } from "@/lib/hierarchy";
import {
  suggestUISchemes,
  analyzeContent,
  analyzeTypography,
  analyzeAudience,
  analyzeTheme,
  analyzeResponsiveness,
} from "@/lib/theme";
import { analyzeUI } from "@/lib/ai";
import { AnalysisResult, OverallScore } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be 10 MB or smaller" }, { status: 413 });
    }

    // Convert to buffer and process image
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const processed = await processImage(buffer);

    // AI analysis via OpenRouter when configured; heuristics below always run
    let aiAnalysis;
    if (process.env.OPENROUTER_API_KEY) {
      try {
        aiAnalysis = await analyzeUI(processed.buffer);
      } catch (error) {
        console.error("AI analysis failed:", error);
      }
    }

    // Extract palette
    const paletteResult = await extractPalette(processed.buffer);

    // WCAG Analysis
    const textColors = paletteResult.palette.slice(0, 3);
    const backgroundColors = ["#ffffff", "#000000", paletteResult.dominant];
    const contrastChecks = analyzeContrast(textColors, backgroundColors);
    const wcagAnalysis = generateWCAGAnalysis(contrastChecks, false, [
      "button",
      "link",
    ]);

    // Contrast Analysis
    const contrastAnalysis = {
      lightMode: contrastChecks.filter((c) => c.background === "#ffffff"),
      darkMode: contrastChecks.filter((c) => c.background === "#000000"),
      recommendations: contrastChecks
        .filter((c) => !c.passes.AA && c.suggestion)
        .map((c) => ({
          color: c.suggestion!,
          ratio: c.ratio,
          passes: c.passes.AAA ? "AAA" : c.passes.AA ? "AA" : "FAIL",
        })),
    };

    // Hierarchy Analysis
    const hierarchyAnalysis = analyzeHierarchy({
      width: processed.width,
      height: processed.height,
    });

    // Sizing Analysis
    const sizingAnalysis = analyzeSizing();

    // Keyboard Accessibility
    const keyboardAnalysis = analyzeKeyboardAccessibility();

    // UI Schemes
    const schemesAnalysis = suggestUISchemes(paletteResult.palette);

    // Content Suggestions
    const contentAnalysis = analyzeContent();

    // Typography
    const typographyAnalysis = analyzeTypography();

    // Audience
    const audienceAnalysis = analyzeAudience(paletteResult.palette);

    // Theme
    const themeAnalysis = analyzeTheme(paletteResult.palette);

    // Responsiveness
    const responsivenessAnalysis = analyzeResponsiveness({
      width: processed.width,
      height: processed.height,
    });

    // Calculate Overall Score
    const colorBlindScore = checkColorBlindSafety(paletteResult.palette);
    const wcagScore =
      wcagAnalysis.score === "AAA"
        ? 100
        : wcagAnalysis.score === "AA"
        ? 80
        : 50;
    const keyboardScore = keyboardAnalysis.passOrWarn === "pass" ? 90 : 70;
    const contrastScore =
      (contrastChecks.filter((c) => c.passes.AA).length /
        contrastChecks.length) *
      100;
    const typographyScore = typographyAnalysis.readabilityScore;
    const responsiveScore =
      responsivenessAnalysis.layoutShiftRisk === "low" ? 90 : 70;

    const overallScoreValue = Math.round(
      (wcagScore +
        keyboardScore +
        contrastScore +
        colorBlindScore +
        typographyScore +
        responsiveScore) /
        6
    );

    let label: OverallScore["label"] = "Poor";
    if (overallScoreValue >= 90) label = "Excellent";
    else if (overallScoreValue >= 75) label = "Good";
    else if (overallScoreValue >= 60) label = "Needs Fixing";

    const overallScore: OverallScore = {
      score: overallScoreValue,
      label,
      breakdown: {
        wcag: wcagScore,
        keyboard: keyboardScore,
        contrast: Math.round(contrastScore),
        colorBlind: Math.round(colorBlindScore),
        typography: typographyScore,
        responsive: responsiveScore,
      },
    };

    const result: AnalysisResult = {
      wcag: wcagAnalysis,
      contrast: contrastAnalysis,
      hierarchy: hierarchyAnalysis,
      sizing: sizingAnalysis,
      overallScore,
      keyboard: keyboardAnalysis,
      schemes: schemesAnalysis,
      content: contentAnalysis,
      typography: typographyAnalysis,
      audience: audienceAnalysis,
      theme: themeAnalysis,
      responsiveness: responsivenessAnalysis,
      ai: aiAnalysis,
      metrics: await measureImage(buffer),
    };

    return NextResponse.json({
      success: true,
      analysis: result,
      aiEnabled: !!aiAnalysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
