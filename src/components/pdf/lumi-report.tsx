import type { ReactNode } from "react";
import { PageNumber, TotalPages } from "takumi-pdf/primitives";

import { Badge } from "@/components/pdf/badge/badge";
import type { BadgeVariant } from "@/components/pdf/badge/badge";
import { DataTable } from "@/components/pdf/data-table/data-table";
import { Divider } from "@/components/pdf/divider/divider";
import { Heading } from "@/components/pdf/heading/heading";
import { KeyValue } from "@/components/pdf/key-value/key-value";
import { PdfList } from "@/components/pdf/list/list";
import { PdfImage } from "@/components/pdf/pdf-image/pdf-image";
import { Section } from "@/components/pdf/section/section";
import { Text } from "@/components/pdf/text/text";
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { StyleSheet, View } from "@/lib/pdf-primitives";
import { lumiTheme } from "@/lib/pdf-themes/lumi";
import { countIssues, summarize } from "@/lib/report";
import type { AccessibilityIssue, AnalysisResult, Level, Severity, WCAGCriterion } from "@/lib/types";

export interface LumiReportProps {
  data: AnalysisResult;
  /** Data URL of the analyzed screenshot */
  image?: string;
  generatedAt: string;
}

const c = lumiTheme.colors;

const styles = StyleSheet.create({
  col: { flex: 1 },
  hero: {
    alignItems: "center",
    backgroundColor: "#272729",
    borderRadius: 12,
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
    padding: 22,
  },
  heroCount: { color: "#ffffff", fontSize: 16, fontWeight: 600 },
  heroLabel: { color: "#cccccc", fontSize: 8, letterSpacing: 0.4, textTransform: "uppercase" },
  heroScore: { color: "#ffffff", fontSize: 64, fontWeight: 600, lineHeight: 1 },
  heroStats: { flexDirection: "row", flexWrap: "wrap", gap: 14, width: 190 },
  issue: { borderColor: c.border, borderRadius: 8, borderWidth: 1, gap: 3, marginBottom: 8, padding: 10 },
  metric: { borderColor: c.border, borderRadius: 8, borderWidth: 1, gap: 2, padding: 10, width: "23.4%" },
  metricLabel: { color: c.mutedForeground, fontSize: 7.5, letterSpacing: 0.4, textTransform: "uppercase" },
  metricValue: { color: c.foreground, fontSize: 20, fontWeight: 600 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  pageBreak: { breakBefore: "page" },
  row: { alignItems: "flex-start", flexDirection: "row", gap: 16 },
  swatch: { borderColor: c.border, borderRadius: 3, borderWidth: 1, height: 12, width: 12 },
  swatchLarge: { borderColor: c.border, borderRadius: 6, borderWidth: 1, height: 36, width: 56 },
  swatchRow: { alignItems: "center", flexDirection: "row", gap: 4 },
  swatches: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  tags: { flexDirection: "row", gap: 4, marginBottom: 2 },
});

const statusVariant: Record<WCAGCriterion["status"], BadgeVariant> = {
  fail: "destructive",
  pass: "success",
  review: "warning",
};
const severityVariant: Record<Severity, BadgeVariant> = {
  critical: "destructive",
  minor: "default",
  moderate: "warning",
  serious: "destructive",
};
const levelVariant: Record<Level, BadgeVariant> = { high: "destructive", low: "default", medium: "warning" };

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const cell = (value: ReactNode) => (
  <Text variant="xs" noMargin>
    {value}
  </Text>
);

// takumi-pdf has no `break-after: avoid`, so headings stay with their content structurally:
// short blocks never split (`noWrap`), long ones keep the heading glued to their first item (`lead`).
const Block = ({
  title,
  subtitle,
  breakBefore,
  noWrap,
  lead,
  children,
}: {
  title: string;
  subtitle?: string;
  breakBefore?: boolean;
  noWrap?: boolean;
  lead?: ReactNode;
  children?: ReactNode;
}) => (
  <Section spacing="md" noWrap={noWrap} style={breakBefore ? styles.pageBreak : undefined}>
    <View wrap={false}>
      <Heading level={2}>{title}</Heading>
      {subtitle ? (
        <Text variant="sm" color="mutedForeground">
          {subtitle}
        </Text>
      ) : null}
      {lead}
    </View>
    {children}
  </Section>
);

const Swatch = ({ color }: { color: string }) => (
  <View style={styles.swatchRow}>
    <View style={[styles.swatch, { backgroundColor: color }]} />
    <Text variant="xs" noMargin>
      {color}
    </Text>
  </View>
);

const PassBadge = ({ passes }: { passes: boolean }) => (
  <Badge size="sm" label={passes ? "Pass" : "Fail"} variant={passes ? "success" : "destructive"} />
);

const Bullets = ({ title, items, numbered }: { title: string; items: string[]; numbered?: boolean }) =>
  items.length ? (
    <View style={styles.col}>
      <Heading level={4}>{title}</Heading>
      <PdfList variant={numbered ? "numbered" : "bullet"} items={items.map((text) => ({ text }))} />
    </View>
  ) : null;

const IssueCard = ({ issue }: { issue: AccessibilityIssue }) => (
  <View style={styles.issue} wrap={false}>
    <View style={styles.tags}>
      <Badge size="sm" label={cap(issue.severity)} variant={severityVariant[issue.severity]} />
      {issue.wcag ? <Badge size="sm" label={`WCAG ${issue.wcag}`} variant="outline" /> : null}
    </View>
    <Text variant="sm" weight="semibold" noMargin>
      {issue.title}
    </Text>
    {issue.element ? (
      <Text variant="xs" color="mutedForeground" noMargin>
        {issue.element}
      </Text>
    ) : null}
    {issue.description ? <Text noMargin>{issue.description}</Text> : null}
    {issue.fix ? <Text noMargin>{`Fix: ${issue.fix}`}</Text> : null}
  </View>
);

function ReportBody({ data, image, generatedAt }: LumiReportProps) {
  const { ai, overall, verdict, insights, totalWeight, checklist, metrics } = summarize(data);
  const share = (weight: number) => `${Math.round((weight / totalWeight) * 100)}%`;
  const severityCount = (s: Severity) => ai?.accessibilityIssues.filter((i) => i.severity === s).length ?? 0;
  const palette = ai
    ? (["primary", "secondary", "accent", "text", "background"] as const).flatMap((role) =>
        ai.colorPalette[role].map((color) => ({ color, role }))
      )
    : [];

  return (
    <View>
      <Text variant="xs" color="mutedForeground" weight="semibold" transform="uppercase" noMargin>
        Lumi · Accessibility report
      </Text>
      <Heading level={1}>{ai ? ai.uiType : "UI accessibility audit"}</Heading>
      <KeyValue
        size="sm"
        divided
        items={[
          { key: "Generated", value: generatedAt },
          { key: "Design system", value: ai?.designSystem ?? "Not detected" },
          { key: "Standard", value: "WCAG 2.2, Level AA" },
          {
            key: "Method",
            value: ai
              ? "AI findings (OpenRouter vision model) scored by Lumi's deterministic formulas"
              : "Pixel measurements scored by Lumi's deterministic formulas (AI unavailable)",
          },
        ]}
      />

      <Text variant="xs" color="mutedForeground" style={{ marginTop: 10 }}>
        Lumi analyzes a static screenshot. Findings about focus order, accessible names, keyboard support and behavior
        under zoom are inferred and marked for manual review. This report is automated guidance, not a WCAG
        conformance audit: test with real users and assistive technology before you ship.
      </Text>

      <View style={[styles.hero, { marginTop: 8 }]}>
        <View style={styles.col}>
          <Text style={styles.heroLabel} noMargin>
            Overall score
          </Text>
          <Text style={styles.heroScore} noMargin>
            {overall}
          </Text>
          <Text style={{ color: "#ffffff", fontSize: 12, marginTop: 6 }} noMargin>
            {verdict}
          </Text>
        </View>
        {ai ? (
          <View style={styles.heroStats}>
            {[
              ["Criteria passed", checklist.pass],
              ["Criteria failed", checklist.fail],
              ["Needs review", checklist.review],
              ["Critical issues", severityCount("critical")],
              ["Serious issues", severityCount("serious")],
              ["Contrast failures", ai.contrastPairs.filter((p) => !p.passesAA).length],
            ].map(([label, value]) => (
              <View key={label} style={{ width: 80 }}>
                <Text style={styles.heroCount} noMargin>
                  {String(value)}
                </Text>
                <Text style={styles.heroLabel} noMargin>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Block
        title="Scores"
        subtitle="Computed by Lumi from fixed formulas over pixel measurements and findings: the same screenshot always scores the same."
        noWrap
      >
        <View style={styles.metrics}>
          {insights.map((i) => (
            <View key={i.key} style={styles.metric}>
              <Text style={styles.metricLabel} noMargin>
                {i.label}
              </Text>
              <Text style={styles.metricValue} noMargin>
                {String(i.value)}
              </Text>
              <Text variant="xs" color="mutedForeground" noMargin>
                {i.summary}
              </Text>
            </View>
          ))}
        </View>
      </Block>

      <Block
        title="How the score is calculated"
        subtitle="Each score's weight in the overall, renormalized over the scores available for this run."
        noWrap
      >
        <DataTable
          size="compact"
          stripe
          data={insights.map((i) => ({
            label: i.label,
            points: ((i.value * i.weight) / totalWeight).toFixed(1),
            value: String(i.value),
            weight: share(i.weight),
          }))}
          footer={{ label: "Overall", points: String(overall), value: "", weight: "100%" }}
          columns={[
            { header: "Score", key: "label" },
            { align: "right", header: "Value", key: "value" },
            { align: "right", header: "Weight", key: "weight" },
            { align: "right", header: "Points", key: "points" },
          ]}
        />
      </Block>

      <Block title="Score breakdown" subtitle="What drives each number, and the rule-based tip it triggers." breakBefore>
        {insights.map((i) => (
          <View key={i.key} style={styles.issue} wrap={false}>
            <View style={[styles.tags, { alignItems: "center", justifyContent: "space-between" }]}>
              <Text variant="sm" weight="semibold" noMargin>
                {`${i.label}: ${i.value}/100`}
              </Text>
              <Badge size="sm" variant="outline" label={`${share(i.weight)} of overall`} />
            </View>
            <Text noMargin>{i.summary}</Text>
            <PdfList items={i.factors.map((text) => ({ text }))} gap="xs" />
            {i.tips.map((tip, idx) => (
              <Text key={idx} noMargin>{`Tip: ${tip}`}</Text>
            ))}
          </View>
        ))}
      </Block>

      {ai ? (
        <Block title="Verdict" noWrap>
          <Text>{ai.summary.verdict}</Text>
          <View style={styles.row}>
            <Bullets title="Top problems" items={ai.summary.top3Problems} numbered />
            <Bullets title="Quick fixes" items={ai.summary.top3Fixes} numbered />
          </View>
        </Block>
      ) : null}

      {image ? (
        <Block title="Analyzed screenshot" noWrap>
          <PdfImage src={image} fit="contain" height={300} variant="bordered" />
        </Block>
      ) : null}

      {ai && ai.wcagCriteria.length > 0 ? (
        <Block
          title="WCAG 2.2 checklist"
          subtitle={`${checklist.pass} pass · ${checklist.fail} fail · ${checklist.review} need manual review`}
          breakBefore
        >
          <DataTable
            size="compact"
            stripe
            data={ai.wcagCriteria}
            columns={[
              { header: "SC", key: "id", width: "8%" },
              { header: "Criterion", key: "name", width: "24%" },
              { align: "center", header: "Level", key: "level", width: "8%" },
              {
                header: "Status",
                key: "status",
                render: (_, row) => <Badge size="sm" label={cap(row.status)} variant={statusVariant[row.status]} />,
                width: "12%",
              },
              { header: "Finding", key: "finding" },
            ]}
          />
        </Block>
      ) : null}

      {ai && ai.accessibilityIssues.length > 0 ? (
        <Block
          title="Accessibility issues"
          subtitle={`${countIssues(ai.accessibilityIssues.length)}, most severe first.`}
          lead={<IssueCard issue={ai.accessibilityIssues[0]} />}
        >
          {ai.accessibilityIssues.slice(1).map((issue, idx) => (
            <IssueCard key={idx} issue={issue} />
          ))}
        </Block>
      ) : null}

      {ai && ai.contrastPairs.length > 0 ? (
        <Block
          title="Contrast pairs"
          subtitle="Colors sampled by the model; ratios computed by Lumi with the WCAG 2.2 luminance formula."
          noWrap
        >
          <DataTable
            size="compact"
            stripe
            data={ai.contrastPairs}
            columns={[
              { header: "Element", key: "element", width: "30%" },
              { header: "Text", key: "foreground", render: (_, row) => <Swatch color={row.foreground} /> },
              { header: "Background", key: "background", render: (_, row) => <Swatch color={row.background} /> },
              { align: "right", header: "Ratio", key: "ratio", render: (_, row) => cell(`${row.ratio.toFixed(2)}:1`) },
              { align: "center", header: "AA", key: "passesAA", render: (_, row) => <PassBadge passes={row.passesAA} /> },
              { align: "center", header: "AAA", key: "passesAAA", render: (_, row) => <PassBadge passes={row.passesAAA} /> },
            ]}
          />
        </Block>
      ) : null}

      {metrics && metrics.paletteContrast.length > 0 ? (
        <Block
          title="Measured colors"
          subtitle={`Every color covering at least 0.5% of the screenshot, against the dominant background ${metrics.dominant}. Measured from pixels.`}
          noWrap
        >
          <DataTable
            size="compact"
            stripe
            data={metrics.paletteContrast.map((m) => ({ aa: m.ratio >= 4.5, color: m.color, ratio: m.ratio, share: m.share }))}
            columns={[
              { header: "Color", key: "color", render: (_, row) => <Swatch color={row.color} /> },
              { align: "right", header: "Share of canvas", key: "share", render: (_, row) => cell(`${(row.share * 100).toFixed(1)}%`) },
              { align: "right", header: "Ratio", key: "ratio", render: (_, row) => cell(`${row.ratio.toFixed(2)}:1`) },
              { align: "center", header: "AA as text", key: "aa", render: (_, row) => <PassBadge passes={row.aa} /> },
            ]}
          />
        </Block>
      ) : null}

      {palette.length > 0 || data.theme.basePalette.length > 0 ? (
        <Block title="Color palette" noWrap>
          <View style={styles.swatches}>
            {(palette.length ? palette : data.theme.basePalette.map((color) => ({ color, role: "extracted" }))).map(
              ({ color, role }, idx) => (
                <View key={idx} style={{ gap: 2 }}>
                  <View style={[styles.swatchLarge, { backgroundColor: color }]} />
                  <Text variant="xs" weight="semibold" noMargin>
                    {color}
                  </Text>
                  <Text variant="xs" color="mutedForeground" noMargin>
                    {cap(role)}
                  </Text>
                </View>
              )
            )}
          </View>
          {ai?.colorSchemeAnalysis.effectiveness ? <Text variant="sm">{ai.colorSchemeAnalysis.effectiveness}</Text> : null}
          {ai ? <PdfList items={ai.colorSchemeAnalysis.issues.map((text) => ({ text }))} /> : null}
        </Block>
      ) : null}

      {ai && ai.componentAnalysis.length > 0 ? (
        <Block title="Component analysis" noWrap>
          <DataTable
            size="compact"
            stripe
            data={ai.componentAnalysis}
            columns={[
              { header: "Component", key: "component", width: "20%" },
              { header: "Issues", key: "issues", render: (_, row) => cell(row.issues.join(" · ") || "None found"), width: "32%" },
              { header: "WCAG", key: "wcagViolation", width: "18%" },
              { header: "Suggestion", key: "suggestion" },
            ]}
          />
        </Block>
      ) : null}

      {ai && ai.recommendations.length > 0 ? (
        <Block title="Remediation plan" subtitle="Ordered by priority. Effort is a rough estimate." noWrap>
          <DataTable
            size="compact"
            stripe
            data={ai.recommendations}
            columns={[
              {
                header: "Priority",
                key: "priority",
                render: (_, row) => <Badge size="sm" label={cap(row.priority)} variant={levelVariant[row.priority]} />,
                width: "12%",
              },
              { header: "Effort", key: "effort", render: (_, row) => cell(cap(row.effort)), width: "10%" },
              { header: "Recommendation", key: "title", width: "30%" },
              { header: "Detail", key: "detail" },
            ]}
          />
        </Block>
      ) : null}

      {ai ? (
        <Block
          title="Design review"
          lead={
            <View style={styles.row}>
              <Bullets title="Strengths" items={ai.strengths} />
              <Bullets title="Weaknesses" items={ai.weaknesses} />
            </View>
          }
        >
          <Divider />
          <KeyValue
            size="sm"
            divided
            items={[
              { key: "Grid system", value: ai.layoutStructure.gridSystem },
              { key: "Typeface style", value: ai.typographyAnalysis.fontStyle },
              { key: "Cognitive load", value: `${ai.cognitiveLoad.level}: ${ai.cognitiveLoad.reason}` },
              ...(metrics
                ? [{ key: "Canvas", value: `${metrics.width} × ${metrics.height}px · ${Math.round(metrics.whitespace * 100)}% whitespace · ${Math.round(metrics.edgeDensity * 100)}% edges · ${metrics.colorCount} colors` }]
                : []),
              { key: "Emotional tone", value: ai.emotionalTone.feel || "Neutral" },
              { key: "Audience", value: ai.targetAudienceMatch || "Not determined" },
              { key: "Industries", value: ai.industryPrediction.join(", ") || "Not determined" },
            ]}
          />
          <View style={[styles.row, { marginTop: 12 }]}>
            <Bullets title="Visual attention flow" items={ai.visualAttentionFlow} numbered />
            <Bullets title="Layout issues" items={ai.layoutStructure.layoutIssues} />
          </View>
          <View style={styles.row}>
            <Bullets title="Typography issues" items={ai.typographyAnalysis.issues} />
            <Bullets title="Mobile issues" items={ai.mobileFriendliness.issues} />
          </View>
          <View style={styles.row}>
            <Bullets title="Interaction issues" items={ai.interactionClarity.issues} />
            <View style={styles.col} />
          </View>
        </Block>
      ) : null}

    </View>
  );
}

export const LumiReport = (props: LumiReportProps) => (
  <PdfcnThemeProvider theme={lumiTheme}>
    <ReportBody {...props} />
  </PdfcnThemeProvider>
);

/** Repeated on every page via takumi-pdf's `footer` band */
export const LumiReportFooter = () => (
  <div
    style={{
      color: c.mutedForeground,
      display: "flex",
      fontFamily: "Inter",
      fontSize: 11,
      justifyContent: "space-between",
      padding: "0 64px",
      width: "100%",
    }}
  >
    <span>Lumi accessibility report</span>
    <span>
      Page <PageNumber /> of <TotalPages />
    </span>
  </div>
);
