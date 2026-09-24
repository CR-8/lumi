import { computeInsights } from "./insights";
import type { AnalysisResult } from "./types";

export const verdictFor = (score: number) =>
  score >= 90
    ? "Excellent. Ship it with confidence."
    : score >= 75
      ? "Good, with room to refine."
      : score >= 50
        ? "Fair. A few fixes will go a long way."
        : "Needs work. Start with the lowest scores.";

export const countIssues = (n: number) => `${n} ${n === 1 ? "issue" : "issues"} found`;

/**
 * The numbers every view of a report shares: the results page, the PDF and the JSON export.
 * All scores are deterministic (see insights.ts); the AI only contributes findings.
 */
export function summarize(data: AnalysisResult) {
  const ai = data.ai;
  const { insights, overall, totalWeight } = computeInsights(data);

  const criteria = ai?.wcagCriteria ?? [];
  const checklist = {
    pass: criteria.filter((c) => c.status === "pass").length,
    fail: criteria.filter((c) => c.status === "fail").length,
    review: criteria.filter((c) => c.status === "review").length,
  };

  return { ai, overall, verdict: verdictFor(overall), insights, totalWeight, checklist, metrics: data.metrics };
}
