"use client";

import { useState } from "react";
import { AnalysisResult, Level, Severity, WCAGCriterion } from "@/lib/types";
import { countIssues, summarize } from "@/lib/report";
import { WCAG_KB } from "@/lib/insights";
import { SubNav } from "@/components/custom/SiteChrome";
import { Bullets, Meter, PassTag, Tag, Tile, Tone } from "./bento";

interface ResultsProps {
  data: AnalysisResult;
  file: File;
  image: string;
  onNewAnalysis: () => void;
}

const statusTag: Record<WCAGCriterion["status"], { tone: Tone; icon: "pass" | "fail" | "review"; label: string }> = {
  fail: { tone: "strong", icon: "fail", label: "Fail" },
  review: { tone: "outline", icon: "review", label: "Review" },
  pass: { tone: "soft", icon: "pass", label: "Pass" },
};
const statusOrder = ["fail", "review", "pass"];
const severityTone: Record<Severity, Tone> = { critical: "strong", serious: "strong", moderate: "outline", minor: "soft" };
const levelTone: Record<Level, Tone> = { high: "strong", medium: "outline", low: "soft" };
const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Results({ data, file, image, onNewAnalysis }: ResultsProps) {
  const [pdfState, setPdfState] = useState<"idle" | "working" | "error">("idle");
  const { ai, overall, verdict, insights, totalWeight, checklist, metrics } = summarize(data);
  // Lowest scores first: their tips matter most
  const topTips = [...insights]
    .sort((a, b) => a.value - b.value)
    .flatMap((i) => i.tips.slice(0, 2).map((tip) => ({ tip, label: i.label })))
    .slice(0, 8);

  const links: [string, string][] = [["Overview", "#overview"]];
  if (ai?.wcagCriteria.length) links.push(["Checklist", "#checklist"]);
  if (ai?.accessibilityIssues.length) links.push(["Issues", "#issues"]);
  if (ai?.recommendations.length) links.push(["Plan", "#plan"]);

  const handlePdf = async () => {
    setPdfState("working");
    try {
      const body = new FormData();
      body.append("analysis", JSON.stringify(data));
      body.append("file", file);
      const response = await fetch("/api/report", { method: "POST", body });
      if (!response.ok) throw new Error(`Report failed with ${response.status}`);
      download(await response.blob(), `lumi-report-${Date.now()}.pdf`);
      setPdfState("idle");
    } catch (error) {
      console.error("PDF export error:", error);
      setPdfState("error");
    }
  };

  const handleJson = () => {
    const report = {
      metadata: { exportDate: new Date().toISOString(), appName: "Lumi - UI Accessibility Analyzer", version: "2.0.0" },
      summary: { overall, verdict, insights, checklist, metrics },
      analysis: data,
    };
    download(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }), `lumi-analysis-${Date.now()}.json`);
  };

  const severityCount = (s: Severity) => ai?.accessibilityIssues.filter((i) => i.severity === s).length ?? 0;
  const heroStats: [string, number][] = ai
    ? [
        ["Criteria passed", checklist.pass],
        ["Criteria failed", checklist.fail],
        ["Need review", checklist.review],
        ["Critical issues", severityCount("critical")],
        ["Serious issues", severityCount("serious")],
        ["Contrast failures", ai.contrastPairs.filter((p) => !p.passesAA).length],
      ]
    : metrics
      ? [
          ["Significant colors", metrics.colorCount],
          ["Whitespace %", Math.round(metrics.whitespace * 100)],
          ["Edge density %", Math.round(metrics.edgeDensity * 100)],
        ]
      : [];
  const palette = ai
    ? (["primary", "secondary", "accent", "text", "background"] as const).flatMap((role) =>
        ai.colorPalette[role].map((color) => ({ color, role: cap(role) }))
      )
    : data.theme.basePalette.map((color) => ({ color, role: "Extracted" }));

  return (
    <>
      <SubNav
        title="Results"
        links={links}
        cta={
          <button onClick={onNewAnalysis} className="btn-primary min-h-0 px-4 py-1.5 text-caption">
            New analysis
          </button>
        }
      />
      <main id="overview" className="scroll-mt-13 bg-parchment px-4 pt-12 pb-20 md:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <header className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-[760px]">
              <p className="text-tagline">{ai ? `${ai.uiType} · ${ai.designSystem}` : "Analysis complete"}</p>
              <h1 className="mt-2 text-display-lg max-sm:text-[34px] max-[419px]:text-[28px] xl:text-hero">
                Your design scores {overall}.
              </h1>
              <p className="mt-3 text-lead max-sm:text-[21px]">{verdict}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={handlePdf} disabled={pdfState === "working"} className="btn-primary">
                {pdfState === "working" ? "Preparing PDF…" : "Download PDF"}
              </button>
              <button onClick={handleJson} className="btn-secondary">
                Export JSON
              </button>
            </div>
          </header>
          {pdfState === "error" && (
            <p role="alert" className="mt-4 text-body">
              We couldn&apos;t generate the PDF. Please try again.
            </p>
          )}

          <div className="mt-10 grid grid-flow-row-dense gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Tile dark className="sm:col-span-2 xl:row-span-2">
              <p className="text-caption font-semibold text-on-dark-muted">Overall score</p>
              <p className="mt-2 font-display text-[96px] leading-none font-semibold tracking-[-1px] max-sm:text-[72px]">
                {overall}
                <span className="text-lead font-normal text-on-dark-muted"> / 100</span>
              </p>
              <div className="mt-4">
                <Meter value={overall} dark />
              </div>
              <p className="mt-4 text-body text-on-dark-muted">{ai?.summary.verdict || verdict}</p>
              <dl className="mt-auto grid grid-cols-2 gap-x-6 gap-y-4 pt-8 sm:grid-cols-3">
                {heroStats.map(([label, value]) => (
                  <div key={label} className="flex flex-col-reverse">
                    <dt className="text-caption text-on-dark-muted">{label}</dt>
                    <dd className="font-display text-display-lg max-sm:text-[32px]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Tile>

            <Tile className="items-center justify-center bg-parchment! sm:col-span-2 xl:row-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, nothing for next/image to optimize */}
              <img src={image} alt="The design you uploaded" className="max-h-[480px] w-auto max-w-full shadow-product" />
            </Tile>

            {insights.map((i) => (
              <Tile key={i.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-caption font-semibold">{i.label}</p>
                  <p className="shrink-0 text-[12px] text-ink-80">{Math.round((i.weight / totalWeight) * 100)}% of overall</p>
                </div>
                <p className="mt-2 font-display text-display-lg">
                  {i.value}
                  <span className="font-sans text-body font-normal text-ink-80"> / 100</span>
                </p>
                <div className="mt-3">
                  <Meter value={i.value} />
                </div>
                <p className="mt-3 text-caption font-semibold">{i.summary}</p>
                <ul className="mt-2 mb-4 space-y-1 text-[12px] text-ink-80">
                  {i.factors.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <p className="mt-auto border-t border-hairline pt-3 text-[12px]">
                  <span className="font-semibold">Tip: </span>
                  {i.tips[0]}
                </p>
              </Tile>
            ))}

            <Tile title="How the score is calculated" className="sm:col-span-2">
              <p className="-mt-2 mb-4 text-caption text-ink-80">
                Lumi computes every score from fixed formulas, so the same screenshot always gets the same numbers. The AI
                only reports findings.
              </p>
              <table className="w-full text-caption">
                <thead>
                  <tr className="border-b border-hairline text-left text-ink-80">
                    <th className="py-2 font-normal">Score</th>
                    <th className="py-2 text-right font-normal">Value</th>
                    <th className="py-2 text-right font-normal">Weight</th>
                    <th className="py-2 text-right font-normal">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.map((i) => (
                    <tr key={i.key} className="border-b border-hairline">
                      <td className="py-2">{i.label}</td>
                      <td className="py-2 text-right tabular-nums">{i.value}</td>
                      <td className="py-2 text-right tabular-nums">{Math.round((i.weight / totalWeight) * 100)}%</td>
                      <td className="py-2 text-right tabular-nums">{((i.value * i.weight) / totalWeight).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="pt-2">Overall</td>
                    <td colSpan={3} className="pt-2 text-right tabular-nums">
                      {overall}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Tile>

            <Tile dark title="Top tips" className="sm:col-span-2">
              <ol className="space-y-3">
                {topTips.map(({ tip, label }, idx) => (
                  <li key={idx} className="flex gap-4 text-caption">
                    <span className="w-5 shrink-0 font-semibold tabular-nums">{idx + 1}</span>
                    <span>
                      <span className="text-on-dark-muted">{label} · </span>
                      {tip}
                    </span>
                  </li>
                ))}
              </ol>
            </Tile>

            {metrics && (
              <Tile title="Canvas" className="sm:col-span-2">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-caption sm:grid-cols-3">
                  {(
                    [
                      ["Dimensions", `${metrics.width} × ${metrics.height}px`],
                      ["Viewport class", metrics.width < 600 ? "Mobile" : metrics.width < 1100 ? "Tablet" : "Desktop"],
                      ["Aspect ratio", (metrics.width / Math.max(1, metrics.height)).toFixed(2)],
                      ["Whitespace", `${Math.round(metrics.whitespace * 100)}%`],
                      ["Edge density", `${Math.round(metrics.edgeDensity * 100)}%`],
                      ["Significant colors", String(metrics.colorCount)],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label} className="flex flex-col-reverse">
                      <dt className="text-ink-80">{label}</dt>
                      <dd className="font-display text-tagline">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 flex items-center gap-2 text-caption text-ink-80">
                  <span className="size-4 rounded-xs border border-black/8" style={{ backgroundColor: metrics.dominant }} />
                  Dominant background {metrics.dominant}
                </p>
              </Tile>
            )}

            {ai && (
              <Tile dark title="The verdict" className="sm:col-span-2">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-sans text-caption font-semibold text-on-dark-muted">Top problems</h3>
                    <Bullets ordered items={ai.summary.top3Problems} className="mt-3 text-white" />
                  </div>
                  <div>
                    <h3 className="font-sans text-caption font-semibold text-on-dark-muted">Quick fixes</h3>
                    <Bullets ordered items={ai.summary.top3Fixes} className="mt-3 text-white" />
                  </div>
                </div>
              </Tile>
            )}

            {palette.length > 0 && (
              <Tile title="Color palette" className="sm:col-span-2">
                <ul className="flex flex-wrap gap-4">
                  {palette.map(({ color, role }, idx) => (
                    <li key={idx} className="w-16">
                      <span className="block h-12 rounded-sm border border-black/8" style={{ backgroundColor: color }} />
                      <span className="mt-1.5 block text-[12px] font-semibold">{color}</span>
                      <span className="block text-[12px] text-ink-80">{role}</span>
                    </li>
                  ))}
                </ul>
                {ai?.colorSchemeAnalysis.effectiveness && <p className="mt-5 text-caption">{ai.colorSchemeAnalysis.effectiveness}</p>}
                {ai && ai.colorSchemeAnalysis.issues.length > 0 && (
                  <Bullets items={ai.colorSchemeAnalysis.issues} className="mt-3 text-ink-80" />
                )}
              </Tile>
            )}

            {ai && ai.wcagCriteria.length > 0 && (
              <Tile id="checklist" title="WCAG 2.2 checklist" className="sm:col-span-2 xl:col-span-4">
                <ul className="divide-y divide-hairline">
                  {[...ai.wcagCriteria]
                    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
                    .map((c) => {
                      const tag = statusTag[c.status];
                      return (
                        <li
                          key={c.id}
                          className="grid gap-x-6 gap-y-1 py-3 text-caption md:grid-cols-[3.5rem_minmax(0,13rem)_2.5rem_5.5rem_minmax(0,1fr)] md:items-start"
                        >
                          <span className="font-semibold tabular-nums">{c.id}</span>
                          <span className="font-semibold md:font-normal">{c.name}</span>
                          <span className="text-ink-80">
                            <span className="md:hidden">Level </span>
                            {c.level}
                          </span>
                          <Tag tone={tag.tone} icon={tag.icon}>
                            {tag.label}
                          </Tag>
                          <span className="text-ink-80">
                            {c.finding}
                            {WCAG_KB[c.id] && (
                              <span className="mt-1 block text-[12px]">Requirement: {WCAG_KB[c.id].requirement}</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </Tile>
            )}

            {ai && ai.accessibilityIssues.length > 0 && (
              <Tile id="issues" title="Accessibility issues" className="sm:col-span-2 xl:row-span-3">
                <p className="-mt-2 mb-4 text-caption text-ink-80">
                  {countIssues(ai.accessibilityIssues.length)}, most severe first.
                </p>
                <ol className="space-y-3">
                  {ai.accessibilityIssues.map((issue, idx) => (
                    <li key={idx} className="rounded-md bg-parchment p-4">
                      <div className="flex flex-wrap gap-2">
                        <Tag tone={severityTone[issue.severity]}>{cap(issue.severity)}</Tag>
                        {issue.wcag && <Tag tone="soft">WCAG {issue.wcag}</Tag>}
                      </div>
                      <h3 className="mt-2 font-sans text-body font-semibold">{issue.title}</h3>
                      {issue.element && <p className="text-caption text-ink-80">{issue.element}</p>}
                      {issue.description && <p className="mt-2 text-caption">{issue.description}</p>}
                      {issue.fix && (
                        <p className="mt-2 text-caption">
                          <span className="font-semibold">Fix: </span>
                          {issue.fix}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </Tile>
            )}

            {ai && ai.contrastPairs.length > 0 && (
              <Tile title="Contrast pairs" className="sm:col-span-2">
                <p className="-mt-2 mb-4 text-caption text-ink-80">
                  Colors sampled by the model. Ratios computed by Lumi.
                </p>
                <ul className="divide-y divide-hairline">
                  {ai.contrastPairs.map((p, idx) => (
                    <li key={idx} className="flex items-center gap-4 py-3">
                      <span
                        aria-hidden
                        className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-black/8 font-display text-tagline"
                        style={{ color: p.foreground, backgroundColor: p.background }}
                      >
                        Aa
                      </span>
                      <span className="min-w-0 flex-1 text-caption">
                        <span className="block truncate font-semibold">{p.element || "Unlabeled pair"}</span>
                        <span className="block text-ink-80">
                          {p.foreground} on {p.background}
                          {p.largeText && " · large text"}
                        </span>
                      </span>
                      <span className="text-caption font-semibold tabular-nums">{p.ratio.toFixed(2)}:1</span>
                      <span className="flex flex-col gap-1">
                        <PassTag passes={p.passesAA} label="AA" />
                        <PassTag passes={p.passesAAA} label="AAA" />
                      </span>
                    </li>
                  ))}
                </ul>
              </Tile>
            )}

            {ai && ai.recommendations.length > 0 && (
              <Tile id="plan" title="Remediation plan" className="sm:col-span-2">
                <ol className="space-y-4">
                  {ai.recommendations.map((r, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="w-5 shrink-0 text-caption font-semibold tabular-nums">{idx + 1}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <Tag tone={levelTone[r.priority]}>{cap(r.priority)} priority</Tag>
                          <Tag tone="soft">{cap(r.effort)} effort</Tag>
                        </div>
                        <h3 className="mt-2 font-sans text-body font-semibold">{r.title}</h3>
                        {r.detail && <p className="text-caption text-ink-80">{r.detail}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </Tile>
            )}

            {ai && ai.componentAnalysis.length > 0 && (
              <Tile title="Components" className="sm:col-span-2">
                <ul className="divide-y divide-hairline">
                  {ai.componentAnalysis.map((comp, idx) => (
                    <li key={idx} className="py-3 first:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-sans text-body font-semibold">{comp.component}</h3>
                        {comp.wcagViolation && !/^none/i.test(comp.wcagViolation) && (
                          <Tag tone="outline">{comp.wcagViolation}</Tag>
                        )}
                      </div>
                      {comp.issues.length > 0 && <Bullets items={comp.issues} className="mt-2 text-ink-80" />}
                      {comp.suggestion && (
                        <p className="mt-2 text-caption">
                          <span className="font-semibold">Suggestion: </span>
                          {comp.suggestion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Tile>
            )}

            {ai && (
              <>
                <Tile title="Strengths">
                  <Bullets items={ai.strengths} className="text-ink-80" />
                </Tile>
                <Tile title="Weaknesses">
                  <Bullets items={ai.weaknesses} className="text-ink-80" />
                </Tile>

                <Tile dark title="Where the eye goes" className="sm:col-span-2">
                  <ol className="space-y-3">
                    {ai.visualAttentionFlow.map((step, idx) => (
                      <li key={idx} className="flex gap-4 text-body">
                        <span className="w-6 shrink-0 font-display font-semibold tabular-nums">{idx + 1}</span>
                        <span className="text-on-dark-muted">{step}</span>
                      </li>
                    ))}
                  </ol>
                </Tile>

                <Tile title="Typography">
                  <p className="mb-3 text-caption font-semibold">{ai.typographyAnalysis.fontStyle}</p>
                  <Bullets items={ai.typographyAnalysis.issues} className="text-ink-80" />
                </Tile>
                <Tile title="Layout">
                  <p className="mb-3 text-caption font-semibold">{ai.layoutStructure.gridSystem}</p>
                  <Bullets items={ai.layoutStructure.layoutIssues} className="text-ink-80" />
                </Tile>
                <Tile title="Mobile">
                  <Bullets items={ai.mobileFriendliness.issues} className="text-ink-80" />
                </Tile>
                <Tile title="Interaction">
                  <Bullets items={ai.interactionClarity.issues} className="text-ink-80" />
                </Tile>

                <Tile title="Audience & tone" className="sm:col-span-2">
                  <p className="text-body">{ai.targetAudienceMatch || "No clear audience detected."}</p>
                  {ai.industryPrediction.length > 0 && (
                    <p className="mt-2 text-caption text-ink-80">{ai.industryPrediction.join(" · ")}</p>
                  )}
                  <dl className="mt-5 grid grid-cols-2 gap-4 text-caption">
                    <div>
                      <dt className="text-ink-80">Emotional tone</dt>
                      <dd className="font-semibold">
                        {ai.emotionalTone.feel || "Neutral"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-80">Cognitive load</dt>
                      <dd className="font-semibold">{ai.cognitiveLoad.level}</dd>
                    </div>
                  </dl>
                  {ai.cognitiveLoad.reason && <p className="mt-3 text-caption text-ink-80">{ai.cognitiveLoad.reason}</p>}
                </Tile>
              </>
            )}

            {metrics && metrics.paletteContrast.length > 0 && (
              <Tile title="Measured colors" className="sm:col-span-2">
                <p className="-mt-2 mb-4 text-caption text-ink-80">
                  Every color covering at least 0.5% of the screenshot, against the dominant background. Measured from
                  pixels, independent of the AI.
                </p>
                <ul className="divide-y divide-hairline">
                  {metrics.paletteContrast.map((m) => (
                    <li key={m.color} className="flex items-center gap-4 py-2.5">
                      <span
                        aria-hidden
                        className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-black/8 font-display text-body font-semibold"
                        style={{ color: m.color, backgroundColor: metrics.dominant }}
                      >
                        Aa
                      </span>
                      <span className="min-w-0 flex-1 text-caption text-ink-80">
                        {m.color} · {(m.share * 100).toFixed(1)}% of canvas
                      </span>
                      <span className="text-caption font-semibold tabular-nums">{m.ratio.toFixed(2)}:1</span>
                      <PassTag passes={m.ratio >= 4.5} label="AA" />
                    </li>
                  ))}
                </ul>
              </Tile>
            )}

            {!ai && (
              <Tile className="sm:col-span-2">
                <p className="text-caption text-ink-80">
                  AI insights weren&apos;t available for this run, so these scores come from Lumi&apos;s built-in
                  heuristics. Add an OpenRouter key to unlock the WCAG checklist, issue list, and remediation plan.
                </p>
              </Tile>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
