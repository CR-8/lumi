import { createHash } from "node:crypto";
import tinycolor from "tinycolor2";
import { WCAG_KB } from "./insights.ts";
import type { AccessibilityIssue, AIAnalysis, ContrastPair, Level, Recommendation, Severity, WCAGCriterion } from "./types";

/**
 * The only models Lumi is allowed to use. OpenRouter tries them in order,
 * falling back to the second if the first errors or is rate limited.
 */
export const MODELS = ["thinkingmachines/inkling:free", "qwen/qwen3.8-27b:free"] as const;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const PROMPT = `
You are a senior accessibility auditor (IAAP WAS level), UI/UX expert, and design systems analyst.

Audit the provided UI screenshot as thoroughly as possible and return ONE strictly valid JSON object matching the structure below.
No markdown, no commentary, no text outside the JSON.
Base every finding ONLY on what is visible in the screenshot. When something cannot be determined from a static image
(focus order, accessible names, motion, zoom behaviour), say so and mark it "review" instead of guessing.

{
  "uiType": "e.g. SaaS dashboard, e-commerce product page",
  "designSystem": "e.g. Material 3, Apple HIG, Tailwind UI, custom",
  "industryPrediction": ["up to 3 industries"],

  "overallQuality": 0,
  "wcagComplianceScore": 0,
  "contrastScore": 0,

  "cognitiveLoad": { "level": "Low | Medium | High", "score": 0, "reason": "" },

  "layoutStructure": {
    "gridSystem": "",
    "alignmentScore": 0,
    "whitespaceScore": 0,
    "consistencyScore": 0,
    "layoutIssues": ["specific issue with its location"]
  },

  "visualAttentionFlow": ["first thing the eye lands on", "second", "..."],

  "interactionClarity": { "score": 0, "issues": [] },
  "mobileFriendliness": { "score": 0, "issues": [] },
  "typographyAnalysis": { "fontStyle": "", "readabilityScore": 0, "issues": [] },
  "colorSchemeAnalysis": { "effectiveness": "one sentence", "issues": [] },
  "colorPalette": { "primary": ["#rrggbb"], "secondary": [], "accent": [], "text": [], "background": [] },

  "componentAnalysis": [
    { "component": "e.g. Primary button (hero)", "issues": [], "wcagViolation": "e.g. 1.4.3 Contrast (Minimum), or none", "suggestion": "" }
  ],

  "wcagCriteria": [
    { "id": "1.4.3", "name": "Contrast (Minimum)", "level": "AA", "status": "pass | fail | review", "finding": "evidence from the screenshot" }
  ],

  "contrastPairs": [
    { "element": "e.g. Body copy in pricing card", "foreground": "#rrggbb", "background": "#rrggbb", "largeText": false }
  ],

  "accessibilityIssues": [
    {
      "title": "",
      "severity": "critical | serious | moderate | minor",
      "wcag": "e.g. 1.4.3",
      "element": "where it is on screen",
      "description": "what is wrong and who it affects",
      "fix": "concrete fix with values, e.g. darken #9ca3af to #6b7280"
    }
  ],

  "strengths": [],
  "weaknesses": [],

  "recommendations": [
    { "title": "", "detail": "", "priority": "high | medium | low", "effort": "high | medium | low" }
  ],

  "targetAudienceMatch": "",
  "summary": { "verdict": "2-3 sentences", "top3Problems": [], "top3Fixes": [] },
  "emotionalTone": { "feel": "", "rating": 0 }
}

REQUIREMENTS (be exhaustive):
- All scores are integers 0-100 where higher is better (cognitiveLoad.score 100 = effortless).
- wcagCriteria: evaluate at least 15 WCAG 2.2 success criteria relevant to a visual audit, including 1.1.1, 1.3.1, 1.3.3,
  1.4.1, 1.4.3, 1.4.4, 1.4.5, 1.4.10, 1.4.11, 1.4.12, 2.4.4, 2.4.6, 2.4.7, 2.4.11, 2.5.3, 2.5.8, 3.2.4 and 3.3.2.
  Use "review" when the screenshot cannot prove pass or fail.
- contrastPairs: 6-12 distinct text/background and UI-component/background pairs, with exact hex values sampled from the image.
  largeText is true for text at least 24px, or at least 18.66px bold.
- accessibilityIssues: list EVERY issue you can see, most severe first, each tied to a WCAG criterion with a concrete fix.
- componentAnalysis: cover every distinct component type visible (navigation, buttons, inputs, cards, icons, images, links, tables).
- recommendations: 6-10 actionable items ordered by priority.
- visualAttentionFlow: 4-8 steps.
- layoutIssues and the typography, mobile and interaction issues: specific, with locations.
- Every hex value must be 6-digit #rrggbb.
- Scores must be consistent with the issues you report. overallQuality is a weighted average of contrast, layout,
  accessibility, typography and UX clarity.
- Return ONLY the JSON object.
`;

/**
 * Analyze a UI screenshot (PNG) with a vision model via OpenRouter.
 * Throws on failure; the caller falls back to Lumi's built-in heuristics.
 */
export async function analyzeUI(png: Buffer): Promise<AIAnalysis> {
  // Same pixels, same report: identical uploads are answered from memory
  const key = createHash("sha256").update(png).digest("hex");
  const cached = cache.get(key);
  if (cached) return cached;

  const analysis = validateAnalysis(JSON.parse(extractJSON(await complete(png))));
  cache.set(key, analysis);
  // ponytail: per-instance in-memory cache capped at 200 entries; move to KV/Redis if results must survive restarts
  if (cache.size > 200) cache.delete(cache.keys().next().value!);
  return analysis;
}

const cache = new Map<string, AIAnalysis>();

async function complete(png: Buffer): Promise<string> {
  const body = JSON.stringify({
    models: MODELS,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PROMPT },
          { type: "image_url", image_url: { url: `data:image/png;base64,${png.toString("base64")}` } },
        ],
      },
    ],
    // Greedy decoding + fixed seed: as repeatable as the provider allows
    temperature: 0,
    top_p: 1,
    seed: 42,
    max_tokens: 16000,
    reasoning: { effort: "low", exclude: true },
  });

  // Retry rate limits and upstream errors with exponential backoff; fail fast on anything else.
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Lumi",
      },
      body,
      signal: AbortSignal.timeout(120_000),
    });

    if (response.ok) {
      const data = await response.json();
      const content: unknown = data.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new Error("Empty response from OpenRouter");
      }
      return content;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt >= 2) {
      throw new Error(`OpenRouter ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
  }
}

/**
 * Clean and extract JSON from text response
 */
function extractJSON(text: string): string {
  // Remove markdown code blocks
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  // Try to find JSON object or array
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("JSON extraction failed. Response text:", text.substring(0, 500));
    throw new Error("No valid JSON found in response");
  }

  // Escape raw control characters inside string literals
  return jsonMatch[0].trim().replace(/("(?:[^"\\]|\\.)*")/g, (match) =>
    match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
  );
}

type Raw = Record<string, unknown>;

const SEVERITIES: Severity[] = ["critical", "serious", "moderate", "minor"];
const LEVELS: Level[] = ["high", "medium", "low"];

const isObject = (value: unknown): value is Raw => typeof value === "object" && value !== null;
const obj = (value: unknown): Raw => (isObject(value) ? value : {});
const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const strList = (value: unknown) => list(value).map(str).filter(Boolean);
const hexList = (value: unknown) =>
  strList(value)
    .map((c) => tinycolor(c))
    .filter((c) => c.isValid())
    .map((c) => c.toHexString());
const pick = <T extends string>(value: string, options: readonly T[], fallback: T): T =>
  options.includes(value as T) ? (value as T) : fallback;

// Missing or out-of-range scores fall back to a neutral 50
const score = (value: unknown) => {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && n >= 0 && n <= 100 ? Math.round(n) : 50;
};

// Models sometimes return plain strings where objects are expected
const records = (value: unknown, key: string): Raw[] =>
  list(value).flatMap((item) => (isObject(item) ? [item] : str(item) ? [{ [key]: str(item) }] : []));

/**
 * Rebuild the model's reply into a well-formed analysis, whatever shape it came back in
 */
function validateAnalysis(raw: Raw): AIAnalysis {
  const cognitive = obj(raw.cognitiveLoad);
  const layout = obj(raw.layoutStructure);
  const interaction = obj(raw.interactionClarity);
  const mobile = obj(raw.mobileFriendliness);
  const typography = obj(raw.typographyAnalysis);
  const colorScheme = obj(raw.colorSchemeAnalysis);
  const palette = obj(raw.colorPalette);
  const summary = obj(raw.summary);
  const tone = obj(raw.emotionalTone);

  const wcagCriteria: WCAGCriterion[] = records(raw.wcagCriteria, "id")
    .map((c) => ({
      id: str(c.id),
      // Canonical name and level when Lumi knows the criterion, rather than the model's wording
      name: WCAG_KB[str(c.id)]?.name ?? str(c.name),
      level: WCAG_KB[str(c.id)]?.level ?? pick(str(c.level).toUpperCase(), ["A", "AA", "AAA"] as const, "AA"),
      status: pick(str(c.status).toLowerCase(), ["pass", "fail", "review"] as const, "review"),
      finding: str(c.finding),
    }))
    .filter((c) => c.id);

  // Colors come from the model; the ratio is computed here rather than trusted
  const contrastPairs: ContrastPair[] = records(raw.contrastPairs, "element").flatMap((p) => {
    const fg = tinycolor(str(p.foreground));
    const bg = tinycolor(str(p.background));
    if (!fg.isValid() || !bg.isValid()) return [];
    const ratio = tinycolor.readability(fg, bg);
    const largeText = p.largeText === true;
    return [
      {
        element: str(p.element),
        foreground: fg.toHexString(),
        background: bg.toHexString(),
        largeText,
        ratio: Math.round(ratio * 100) / 100,
        passesAA: ratio >= (largeText ? 3 : 4.5),
        passesAAA: ratio >= (largeText ? 4.5 : 7),
      },
    ];
  });

  const accessibilityIssues: AccessibilityIssue[] = records(raw.accessibilityIssues, "title")
    .map((i) => ({
      title: str(i.title) || str(i.description),
      severity: pick(str(i.severity).toLowerCase(), SEVERITIES, "moderate"),
      wcag: str(i.wcag),
      element: str(i.element),
      description: str(i.description),
      fix: str(i.fix),
    }))
    .filter((i) => i.title)
    .sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));

  const recommendations: Recommendation[] = records(raw.recommendations, "title")
    .map((r) => ({
      title: str(r.title) || str(r.detail),
      detail: str(r.detail),
      priority: pick(str(r.priority).toLowerCase(), LEVELS, "medium"),
      effort: pick(str(r.effort).toLowerCase(), LEVELS, "medium"),
    }))
    .filter((r) => r.title)
    .sort((a, b) => LEVELS.indexOf(a.priority) - LEVELS.indexOf(b.priority));

  return {
    uiType: str(raw.uiType) || "UI design",
    designSystem: str(raw.designSystem) || "Custom",
    industryPrediction: strList(raw.industryPrediction),
    overallQuality: score(raw.overallQuality),
    wcagComplianceScore: score(raw.wcagComplianceScore),
    contrastScore: score(raw.contrastScore),
    cognitiveLoad: { level: str(cognitive.level) || "Unknown", score: score(cognitive.score), reason: str(cognitive.reason) },
    layoutStructure: {
      gridSystem: str(layout.gridSystem) || "Unknown",
      alignmentScore: score(layout.alignmentScore),
      whitespaceScore: score(layout.whitespaceScore),
      consistencyScore: score(layout.consistencyScore),
      layoutIssues: strList(layout.layoutIssues),
    },
    visualAttentionFlow: strList(raw.visualAttentionFlow),
    interactionClarity: { score: score(interaction.score), issues: strList(interaction.issues) },
    mobileFriendliness: { score: score(mobile.score), issues: strList(mobile.issues) },
    typographyAnalysis: {
      fontStyle: str(typography.fontStyle) || "Unknown",
      readabilityScore: score(typography.readabilityScore),
      issues: strList(typography.issues),
    },
    colorSchemeAnalysis: { effectiveness: str(colorScheme.effectiveness), issues: strList(colorScheme.issues) },
    colorPalette: {
      primary: hexList(palette.primary),
      secondary: hexList(palette.secondary),
      accent: hexList(palette.accent),
      text: hexList(palette.text),
      background: hexList(palette.background),
    },
    componentAnalysis: records(raw.componentAnalysis, "component")
      .map((c) => ({
        component: str(c.component),
        issues: strList(c.issues),
        wcagViolation: str(c.wcagViolation),
        suggestion: str(c.suggestion),
      }))
      .filter((c) => c.component),
    wcagCriteria,
    contrastPairs,
    accessibilityIssues,
    strengths: strList(raw.strengths),
    weaknesses: strList(raw.weaknesses),
    recommendations,
    targetAudienceMatch: str(raw.targetAudienceMatch),
    summary: {
      verdict: str(summary.verdict),
      top3Problems: strList(summary.top3Problems),
      top3Fixes: strList(summary.top3Fixes),
    },
    emotionalTone: { feel: str(tone.feel), rating: score(tone.rating) },
  };
}
