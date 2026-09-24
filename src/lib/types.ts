// Core types for Lumi analysis system

export interface AnalysisResult {
  wcag: WCAGAnalysis;
  contrast: ContrastAnalysis;
  hierarchy: HierarchyAnalysis;
  sizing: SizingAnalysis;
  overallScore: OverallScore;
  keyboard: KeyboardAnalysis;
  schemes: UISchemesSuggestions;
  content: ContentSuggestions;
  typography: TypographyAnalysis;
  audience: AudienceAnalysis;
  theme: ThemeAnalysis;
  responsiveness: ResponsivenessAnalysis;
  ai?: AIAnalysis;
  metrics?: ImageMetrics;
}

/** Deterministic measurements taken from the screenshot's pixels */
export type ImageMetrics = {
  width: number;
  height: number;
  /** Share of the canvas within one luminance step of the dominant background, 0-1 */
  whitespace: number;
  /** Share of pixels on a hard edge (text, borders, icons), 0-1 */
  edgeDensity: number;
  /** Distinct colors covering at least 0.5% of the canvas */
  colorCount: number;
  dominant: string;
  /** Each significant color against the dominant background */
  paletteContrast: { color: string; share: number; ratio: number }[];
};

export interface AIAnalysis {
  uiType: string;
  designSystem: string;
  industryPrediction: string[];
  overallQuality: number;
  wcagComplianceScore: number;
  contrastScore: number;
  cognitiveLoad: {
    level: string;
    score: number;
    reason: string;
  };
  layoutStructure: {
    gridSystem: string;
    alignmentScore: number;
    whitespaceScore: number;
    consistencyScore: number;
    layoutIssues: string[];
  };
  visualAttentionFlow: string[];
  interactionClarity: {
    score: number;
    issues: string[];
  };
  mobileFriendliness: {
    score: number;
    issues: string[];
  };
  typographyAnalysis: {
    fontStyle: string;
    readabilityScore: number;
    issues: string[];
  };
  colorSchemeAnalysis: {
    effectiveness: string;
    issues: string[];
  };
  colorPalette: {
    primary: string[];
    secondary: string[];
    accent: string[];
    text: string[];
    background: string[];
  };
  componentAnalysis: Array<{
    component: string;
    issues: string[];
    wcagViolation: string;
    suggestion: string;
  }>;
  wcagCriteria: WCAGCriterion[];
  contrastPairs: ContrastPair[];
  accessibilityIssues: AccessibilityIssue[];
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  targetAudienceMatch: string;
  summary: {
    verdict: string;
    top3Problems: string[];
    top3Fixes: string[];
  };
  emotionalTone: {
    feel: string;
    rating: number;
  };
}

export type Severity = "critical" | "serious" | "moderate" | "minor";
export type Level = "high" | "medium" | "low";

export type WCAGCriterion = {
  id: string;
  name: string;
  level: "A" | "AA" | "AAA";
  status: "pass" | "fail" | "review";
  finding: string;
};

/** Colors come from the model; ratio and pass flags are computed by Lumi. */
export type ContrastPair = {
  element: string;
  foreground: string;
  background: string;
  largeText: boolean;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
};

export type AccessibilityIssue = {
  title: string;
  severity: Severity;
  wcag: string;
  element: string;
  description: string;
  fix: string;
};

export type Recommendation = {
  title: string;
  detail: string;
  priority: Level;
  effort: Level;
};

export interface WCAGAnalysis {
  score: "AA" | "AAA" | "FAIL";
  textContrast: ContrastCheck[];
  altText: { present: boolean; suggestions: string[] };
  ariaRoles: { found: string[]; missing: string[] };
  errors: string[];
  warnings: string[];
}

export interface ContrastCheck {
  foreground: string;
  background: string;
  ratio: number;
  passes: { AA: boolean; AAA: boolean };
  suggestion?: string;
}

export interface ContrastAnalysis {
  lightMode: ContrastCheck[];
  darkMode: ContrastCheck[];
  recommendations: { color: string; ratio: number; passes: string }[];
}

export interface HierarchyAnalysis {
  priorityScore: number;
  issues: {
    dominantElements: string[];
    missingHeadings: string[];
    poorGrouping: string[];
  };
  suggestions: string[];
}

export interface SizingAnalysis {
  clickTargets: { size: number; meets44px: boolean; element: string }[];
  fontSizes: { size: number; acceptable: boolean; element: string }[];
  paddingIssues: string[];
  feasibility: "Possible" | "Needs Adjustments";
  problemAreas: string[];
}

export interface OverallScore {
  score: number;
  label: "Excellent" | "Good" | "Needs Fixing" | "Poor";
  breakdown: {
    wcag: number;
    keyboard: number;
    contrast: number;
    colorBlind: number;
    typography: number;
    responsive: number;
  };
}

export interface KeyboardAnalysis {
  focusOrder: { element: string; tabIndex: number }[];
  focusVisibility: boolean;
  interactiveElements: { element: string; accessible: boolean }[];
  missingLabels: string[];
  passOrWarn: "pass" | "warn";
}

export interface UISchemesSuggestions {
  suggestions: {
    name: string;
    confidence: number;
    tokens: Record<string, string>;
  }[];
  accessibleSchemes: { name: string; palette: string[] }[];
}

export interface ContentSuggestions {
  headings: { current: string; suggested: string }[];
  buttonText: { current: string; suggested: string }[];
  tone: string;
  clarityScore: number;
  improvements: string[];
}

export interface TypographyAnalysis {
  pairings: { primary: string; secondary: string; score: number }[];
  readabilityScore: number;
  sizeSuggestions: { element: string; current: string; suggested: string }[];
  lineHeightIssues: string[];
}

export interface AudienceAnalysis {
  detected: {
    category:
      | "Enterprise"
      | "Education"
      | "Fintech"
      | "Creative"
      | "Youth"
      | "General";
    confidence: number;
  }[];
  suggestions: string[];
}

export interface ThemeAnalysis {
  basePalette: string[];
  accentColors: string[];
  contrastSafeVariants: string[];
  lightDarkConsistency: number;
  issues: string[];
}

export interface ResponsivenessAnalysis {
  images: {
    hasAltText: boolean;
    aspectRatioIssues: string[];
    compressionIssues: string[];
  };
  layoutShiftRisk: "low" | "medium" | "high";
  unresponsiveElements: string[];
}

export interface OCRResult {
  text: string;
  words: {
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }[];
}

export interface PaletteResult {
  palette: string[];
  dominant: string;
  accents: string[];
}
