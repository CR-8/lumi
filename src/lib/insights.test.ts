import { test } from "node:test";
import assert from "node:assert/strict";
import tinycolor from "tinycolor2";
import { computeInsights, fixForeground } from "./insights.ts";
import type { AnalysisResult } from "./types";

test("fixForeground reaches the target ratio by moving lightness only", () => {
  const fixed = fixForeground("#7a7a7a", "#f5f5f7", 4.5);
  assert.ok(tinycolor.readability(fixed, "#f5f5f7") >= 4.5);
  assert.ok(tinycolor.readability(fixForeground("#555555", "#111111", 4.5), "#111111") >= 4.5);
});

test("scores are pure functions of the findings and measurements", () => {
  const data = {
    overallScore: { breakdown: { colorBlind: 70 } },
    theme: { basePalette: ["#ffffff", "#000000"] },
    metrics: { width: 1440, height: 900, whitespace: 0.5, edgeDensity: 0.2, colorCount: 14, dominant: "#ffffff", paletteContrast: [] },
    ai: {
      wcagCriteria: [
        { id: "1.4.3", name: "", level: "AA", status: "fail", finding: "" },
        { id: "2.4.7", name: "", level: "AA", status: "review", finding: "" },
        { id: "1.1.1", name: "", level: "A", status: "pass", finding: "" },
        { id: "1.3.1", name: "", level: "A", status: "pass", finding: "" },
      ],
      contrastPairs: [
        { element: "Body", foreground: "#767676", background: "#ffffff", largeText: false, ratio: 4.54, passesAA: true, passesAAA: false },
        { element: "Hint", foreground: "#999999", background: "#ffffff", largeText: false, ratio: 2.85, passesAA: false, passesAAA: false },
      ],
      accessibilityIssues: [{ title: "Tiny links", severity: "serious", wcag: "2.5.8", element: "", description: "", fix: "" }],
    },
  } as unknown as AnalysisResult;

  const { insights, overall } = computeInsights(data);
  const byKey = Object.fromEntries(insights.map((i) => [i.key, i.value]));

  assert.deepEqual(byKey, { wcag: 63, contrast: 35, issues: 88, colorBlind: 70, whitespace: 100, complexity: 50, palette: 90 });
  // 63×.3 + 35×.25 + 88×.2 + 70×.1 + 100×.05 + 50×.05 + 90×.05 = 64.25
  assert.equal(overall, 64);
  assert.deepEqual(computeInsights(data), computeInsights(data));
});
