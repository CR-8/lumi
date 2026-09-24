import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { render } from "takumi-pdf";
import { googleFonts } from "@takumi-rs/helpers";
import { LumiReport, LumiReportFooter } from "@/components/pdf/lumi-report";
import { AnalysisResult } from "@/lib/types";

const MAX_ANALYSIS_CHARS = 1_000_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// Downloaded once per server instance; a failed download is retried on the next request
let fonts: ReturnType<typeof googleFonts> | undefined;
const loadFonts = () =>
  (fonts ??= googleFonts(["Inter"]).catch((error) => {
    fonts = undefined;
    throw error;
  }));

/**
 * Render an analysis (as returned by /api/analysis) into a PDF report.
 * Expects multipart form data: `analysis` (JSON string) and optionally `file` (the screenshot).
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const raw = form.get("analysis");
  const file = form.get("file");

  if (typeof raw !== "string" || raw.length > MAX_ANALYSIS_CHARS) {
    return NextResponse.json({ error: "Missing or oversized analysis" }, { status: 400 });
  }

  let data: AnalysisResult;
  try {
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Analysis is not valid JSON" }, { status: 400 });
  }
  if (!data?.overallScore || !data.contrast || !data.theme) {
    return NextResponse.json({ error: "Analysis is incomplete" }, { status: 400 });
  }

  try {
    let image: string | undefined;
    if (file instanceof File && file.size <= MAX_IMAGE_BYTES) {
      const jpeg = await sharp(Buffer.from(await file.arrayBuffer()))
        .resize(1400, 1800, { fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82 })
        .toBuffer();
      image = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    }

    const generatedAt = new Date().toLocaleDateString("en-US", { dateStyle: "long" });
    const pdf = await render(createElement(LumiReport, { data, image, generatedAt }), {
      size: "a4",
      margin: { top: 56, right: 56, bottom: 64, left: 56 },
      fonts: await loadFonts(),
      footer: createElement(LumiReportFooter),
    });

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="lumi-report-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
