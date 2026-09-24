import tinycolor from "tinycolor2";
import type { AnalysisResult } from "./types";

/**
 * Deterministic scoring. Every number Lumi shows is computed here from explicit formulas over
 * pixel measurements and the findings list, so the same inputs always give the same score,
 * and every score carries the factors behind it and rule-based tips.
 */

export interface Insight {
  key: string;
  label: string;
  value: number;
  /** Share of the overall score, before renormalizing over the insights available */
  weight: number;
  summary: string;
  factors: string[];
  tips: string[];
}

type Criterion = { name: string; level: "A" | "AA" | "AAA"; requirement: string; tip: string };

/** Plain-language requirement and fix for each WCAG 2.2 criterion Lumi audits */
export const WCAG_KB: Record<string, Criterion> = {
  "1.1.1": { name: "Non-text Content", level: "A", requirement: "Every meaningful image, icon and control has a text alternative.", tip: "Give informative images alt text that states their purpose, and mark decorative ones alt=\"\"." },
  "1.3.1": { name: "Info and Relationships", level: "A", requirement: "Structure shown visually (headings, lists, tables, groups) is also in the markup.", tip: "Use real heading, list, table and fieldset elements instead of styled divs." },
  "1.3.3": { name: "Sensory Characteristics", level: "A", requirement: "Instructions don't rely only on shape, size, position or sound.", tip: "Name the control (\"the Save button\"), not just where it is (\"the button on the right\")." },
  "1.4.1": { name: "Use of Color", level: "A", requirement: "Color is never the only way information is conveyed.", tip: "Pair color with text, icons or underlines, e.g. underline links in body copy and add icons to error states." },
  "1.4.3": { name: "Contrast (Minimum)", level: "AA", requirement: "Text has 4.5:1 contrast, or 3:1 for large text (24px, or 18.66px bold).", tip: "Darken light greys: #767676 is the lightest grey that passes on white." },
  "1.4.4": { name: "Resize Text", level: "AA", requirement: "Text zooms to 200% without losing content or function.", tip: "Size text in rem and avoid fixed-height containers that clip zoomed text." },
  "1.4.5": { name: "Images of Text", level: "AA", requirement: "Real text is used instead of images of text.", tip: "Render headings and buttons as live text styled with CSS and web fonts." },
  "1.4.10": { name: "Reflow", level: "AA", requirement: "Content fits a 320px-wide viewport without scrolling in two directions.", tip: "Stack columns below 640px and let wide tables scroll inside their own container." },
  "1.4.11": { name: "Non-text Contrast", level: "AA", requirement: "UI components and meaningful graphics have 3:1 contrast against adjacent colors.", tip: "Give input borders, focus rings and chart lines at least 3:1 against the background." },
  "1.4.12": { name: "Text Spacing", level: "AA", requirement: "Nothing is lost when line, letter, word and paragraph spacing increase.", tip: "Avoid fixed heights on text containers so they can grow." },
  "2.4.4": { name: "Link Purpose (In Context)", level: "A", requirement: "Each link's purpose is clear from its text or context.", tip: "Replace \"Click here\" and bare \"Learn more\" with descriptive text, or add visually hidden context." },
  "2.4.6": { name: "Headings and Labels", level: "AA", requirement: "Headings and labels describe their topic or purpose.", tip: "Write headings that summarise the section and label inputs with what to enter." },
  "2.4.7": { name: "Focus Visible", level: "AA", requirement: "Keyboard focus is always visible.", tip: "Never remove outlines without a replacement: use a 2px ring with 3:1 contrast." },
  "2.4.11": { name: "Focus Not Obscured (Minimum)", level: "AA", requirement: "A focused element isn't fully hidden by sticky headers or overlays.", tip: "Add scroll-padding-top equal to your sticky header's height." },
  "2.5.3": { name: "Label in Name", level: "A", requirement: "A control's accessible name contains its visible label.", tip: "Keep aria-label consistent with the visible text so voice users can say what they see." },
  "2.5.7": { name: "Dragging Movements", level: "AA", requirement: "Anything done by dragging can also be done with a single pointer.", tip: "Offer a button or file picker alongside every drag interaction." },
  "2.5.8": { name: "Target Size (Minimum)", level: "AA", requirement: "Pointer targets are at least 24×24px, or spaced so they don't overlap.", tip: "Pad small icons and inline links; 44×44px is the comfortable touch size." },
  "3.2.4": { name: "Consistent Identification", level: "AA", requirement: "Components with the same function are labelled consistently.", tip: "Reuse one label and icon for the same action everywhere." },
  "3.3.2": { name: "Labels or Instructions", level: "A", requirement: "Inputs have visible labels or instructions.", tip: "Use persistent labels above fields; placeholders disappear as soon as people type." },
};

export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const pct = (n: number) => `${Math.round(n * 100)}%`;
const ratio = (n: number) => `${n.toFixed(2)}:1`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Nearest color, moving only lightness, that reaches `target` contrast against `bg` */
export function fixForeground(fg: string, bg: string, target: number): string {
  const background = tinycolor(bg);
  const color = tinycolor(fg);
  const darken = color.getLuminance() <= background.getLuminance();
  for (let i = 0; i < 100 && tinycolor.readability(color, background) < target; i++) {
    if (darken) color.darken(1);
    else color.lighten(1);
  }
  return color.toHexString();
}

function contrastInsight(data: AnalysisResult): Insight | null {
  const ai = data.ai;
  const pairs = ai?.contrastPairs.length
    ? ai.contrastPairs.map((p) => ({ name: p.element || "Unlabeled pair", fg: p.foreground, bg: p.background, ratio: p.ratio, target: p.largeText ? 3 : 4.5, aaa: p.passesAAA }))
    : // Without AI: colors distinct from the background (at least 1.5:1) are treated as foreground
      (data.metrics?.paletteContrast ?? [])
        .filter((p) => p.ratio >= 1.5)
        .map((p) => ({ name: `${p.color} (${pct(p.share)} of canvas)`, fg: p.color, bg: data.metrics!.dominant, ratio: p.ratio, target: 4.5, aaa: p.ratio >= 7 }));
  if (!pairs.length) return null;

  const aa = pairs.filter((p) => p.ratio >= p.target).length;
  const aaa = pairs.filter((p) => p.aaa).length;
  const worst = [...pairs].sort((a, b) => a.ratio - b.ratio)[0];
  const failing = pairs.filter((p) => p.ratio < p.target);

  return {
    key: "contrast",
    label: "Contrast",
    value: clamp(100 * (0.7 * (aa / pairs.length) + 0.3 * (aaa / pairs.length))),
    weight: 0.25,
    summary: `${aa} of ${plural(pairs.length, "color pair")} meet AA.`,
    factors: [
      `${aa}/${pairs.length} pass AA (70% of this score)`,
      `${aaa}/${pairs.length} pass AAA (30% of this score)`,
      `Lowest: ${ratio(worst.ratio)}, ${worst.name}`,
      ai?.contrastPairs.length ? "Pairs sampled by AI, ratios computed by Lumi" : "Measured from the screenshot's pixels",
    ],
    tips: failing.length
      ? failing.slice(0, 4).map((p) => `${p.name}: change ${p.fg} to ${fixForeground(p.fg, p.bg, p.target)} to reach ${p.target}:1 on ${p.bg}.`)
      : ["Every sampled pair passes AA. Recheck contrast whenever you add a tint, overlay or disabled state."],
  };
}

function checklistInsight(data: AnalysisResult): Insight | null {
  const criteria = data.ai?.wcagCriteria ?? [];
  if (!criteria.length) return null;
  const pass = criteria.filter((c) => c.status === "pass");
  const fail = criteria.filter((c) => c.status === "fail");
  const review = criteria.filter((c) => c.status === "review");

  return {
    key: "wcag",
    label: "WCAG 2.2 checklist",
    value: clamp((100 * (pass.length + 0.5 * review.length)) / criteria.length),
    weight: 0.3,
    summary: `${pass.length} of ${criteria.length} criteria pass; ${fail.length} fail.`,
    factors: [
      `${pass.length} pass × 1 point`,
      `${review.length} need review × ½ point`,
      `${fail.length} fail × 0 points`,
      `Score = points ÷ ${criteria.length} criteria`,
    ],
    tips: [
      ...fail.map((c) => `${c.id} ${WCAG_KB[c.id]?.name ?? c.name}: ${WCAG_KB[c.id]?.tip ?? c.finding}`),
      ...(review.length ? [`Verify by hand: ${review.map((c) => c.id).join(", ")}. A screenshot can't prove these either way.`] : []),
    ],
  };
}

const PENALTY = { critical: 25, serious: 12, moderate: 5, minor: 2 } as const;

function issuesInsight(data: AnalysisResult): Insight | null {
  const issues = data.ai?.accessibilityIssues;
  if (!issues) return null;
  const counts = (["critical", "serious", "moderate", "minor"] as const).map((s) => [s, issues.filter((i) => i.severity === s).length] as const);
  const penalty = counts.reduce((sum, [s, n]) => sum + PENALTY[s] * n, 0);

  return {
    key: "issues",
    label: "Issue severity",
    value: clamp(100 - penalty),
    weight: 0.2,
    summary: issues.length ? `${plural(issues.length, "issue")}, costing ${penalty} points.` : "No issues found.",
    factors: counts.map(([s, n]) => `${n} ${s} × −${PENALTY[s]}`),
    tips: issues.length
      ? issues.slice(0, 3).map((i) => `${i.title}${i.fix ? `: ${i.fix}` : ""}`)
      : ["No visible issues. Run a keyboard and screen reader pass to cover what a screenshot can't show."],
  };
}

function colorBlindInsight(data: AnalysisResult): Insight {
  const value = clamp(data.overallScore.breakdown.colorBlind);
  return {
    key: "colorBlind",
    label: "Color-blind safety",
    value,
    weight: 0.1,
    summary: value >= 60 ? "Palette colors separate well by lightness." : "Palette colors are close in lightness.",
    factors: [`Average luminance gap between ${data.theme.basePalette.length} palette colors: ${value}/100`],
    tips:
      value >= 60
        ? ["Lightness differences carry meaning without hue. Keep status colors paired with icons or text."]
        : ["Red/green and blue/purple pairs may merge for color-blind users. Add icons, labels or patterns, and vary lightness, not just hue."],
  };
}

function layoutInsights(data: AnalysisResult): Insight[] {
  const m = data.metrics;
  if (!m) return [];
  const whitespace = clamp(100 - Math.max(0, 0.4 - m.whitespace, m.whitespace - 0.65) * 250);
  const complexity = clamp(100 - Math.max(0, m.edgeDensity - 0.1) * 500);
  const palette = clamp(100 - Math.max(0, m.colorCount - 12) * 5);

  return [
    {
      key: "whitespace",
      label: "Whitespace",
      value: whitespace,
      weight: 0.05,
      summary: `${pct(m.whitespace)} of the canvas is background.`,
      factors: [`Measured ${pct(m.whitespace)}; full marks between 40% and 65%`, "−2.5 points per point outside that band"],
      tips: [
        m.whitespace < 0.4
          ? "Dense layout: add 48–80px between sections and 24px inside cards so content can breathe."
          : m.whitespace > 0.65
            ? "Very sparse: tighten spacing so related content stays visually grouped."
            : "Balanced spacing. Keep section rhythm consistent as content grows.",
      ],
    },
    {
      key: "complexity",
      label: "Visual complexity",
      value: complexity,
      weight: 0.05,
      summary: `${pct(m.edgeDensity)} of pixels sit on a hard edge.`,
      factors: [`Edge density ${pct(m.edgeDensity)}; full marks up to 10%`, "−5 points per point above 10%"],
      tips: [
        m.edgeDensity > 0.1
          ? "Busy screen: remove decorative borders and dividers, group related controls and cut secondary copy."
          : "Calm, low-noise surface. Hierarchy comes from spacing rather than lines.",
      ],
    },
    {
      key: "palette",
      label: "Palette discipline",
      value: palette,
      weight: 0.05,
      summary: `${plural(m.colorCount, "significant color")} on screen.`,
      factors: [`${m.colorCount} colors cover at least 0.5% of the canvas each`, "Full marks up to 12; −5 points per extra color"],
      tips: [
        m.colorCount > 12
          ? "Consolidate colors into tokens: one background, one surface, two text tones and one accent."
          : "Tight palette. Define the colors as design tokens so they stay consistent.",
      ],
    },
  ];
}

/** All scores plus the weighted overall, renormalized over whichever insights are available */
export function computeInsights(data: AnalysisResult) {
  const insights = [
    checklistInsight(data),
    contrastInsight(data),
    issuesInsight(data),
    colorBlindInsight(data),
    ...layoutInsights(data),
  ].filter((i): i is Insight => i !== null);
  const totalWeight = insights.reduce((sum, i) => sum + i.weight, 0);
  const overall = clamp(insights.reduce((sum, i) => sum + i.value * i.weight, 0) / totalWeight);
  return { insights, overall, totalWeight };
}
