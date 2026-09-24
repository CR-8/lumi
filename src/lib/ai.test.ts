import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeUI } from "./ai.ts";

process.env.OPENROUTER_API_KEY = "test-key";

const reply = (analysis: string) => async () =>
  new Response(JSON.stringify({ choices: [{ message: { content: analysis } }] }));

test("sends only the allowed models and repairs a fenced, partial reply", async () => {
  let sent: { models: string[]; model?: string } | undefined;
  globalThis.fetch = async (_url, init) => {
    sent = JSON.parse(String(init?.body));
    // Raw newline inside a string literal + missing fields, as free models often return
    return reply('```json\n{"uiType":"Dashboard","overallQuality":"82","summary":{"verdict":"Line one\nline two"}}\n```')();
  };

  const result = await analyzeUI(Buffer.from("image-1"));

  assert.deepEqual(sent?.models, ["thinkingmachines/inkling:free", "qwen/qwen3.8-27b:free"]);
  assert.equal(sent?.model, undefined);
  assert.equal((sent as unknown as { temperature: number }).temperature, 0);
  assert.equal(result.uiType, "Dashboard");
  assert.equal(result.overallQuality, 82);
  assert.equal(result.contrastScore, 50);
  assert.equal(result.summary.verdict, "Line one\nline two");
  assert.deepEqual(result.summary.top3Fixes, []);
  assert.deepEqual(result.wcagCriteria, []);
});

test("normalizes detailed findings and computes contrast itself", async () => {
  globalThis.fetch = reply(
    JSON.stringify({
      accessibilityIssues: ["Low contrast footer", { title: "Missing focus ring", severity: "CRITICAL", wcag: "2.4.7" }],
      recommendations: [{ title: "Add focus styles", priority: "low" }, "Darken footer text"],
      wcagCriteria: [{ id: "1.4.3", level: "aa", status: "FAIL" }, { name: "no id" }],
      contrastPairs: [
        { element: "Body", foreground: "#767676", background: "#ffffff" },
        { element: "Footer", foreground: "#777777", background: "#fff" },
        { element: "Heading", foreground: "#949494", background: "#ffffff", largeText: true },
        { element: "Broken", foreground: "not a color", background: "#ffffff" },
      ],
    })
  );

  const result = await analyzeUI(Buffer.from("image-2"));

  assert.deepEqual(
    result.accessibilityIssues.map((i) => [i.title, i.severity]),
    [["Missing focus ring", "critical"], ["Low contrast footer", "moderate"]]
  );
  assert.deepEqual(result.recommendations.map((r) => [r.title, r.priority]), [["Darken footer text", "medium"], ["Add focus styles", "low"]]);
  assert.deepEqual(result.wcagCriteria, [{ id: "1.4.3", name: "Contrast (Minimum)", level: "AA", status: "fail", finding: "" }]);
  assert.deepEqual(
    result.contrastPairs.map((p) => [p.element, p.ratio, p.passesAA, p.passesAAA]),
    [["Body", 4.54, true, false], ["Footer", 4.48, false, false], ["Heading", 3.03, true, false]]
  );
});

test("fails fast on non-retryable errors", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("unauthorized", { status: 401 });
  };

  await assert.rejects(analyzeUI(Buffer.from("image-3")), /OpenRouter 401/);
  assert.equal(calls, 1);
});

test("answers an identical image from cache, so repeat uploads get the same report", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return reply(JSON.stringify({ uiType: `Run ${calls}` }))();
  };

  const first = await analyzeUI(Buffer.from("image-4"));
  const second = await analyzeUI(Buffer.from("image-4"));

  assert.equal(calls, 1);
  assert.deepEqual(second, first);
});
