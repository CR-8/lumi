"use client";

import { Eye, Palette, Sparkles, Zap } from "lucide-react";
import { SubNav } from "./SiteChrome";
import { UploadDropzone } from "./UploadDropzone";

const specimens = [
  { ratio: "16.8:1", grade: "AAA", surface: "bg-canvas", sample: "text-ink", label: "text-ink" },
  { ratio: "5.6:1", grade: "AA", surface: "bg-primary", sample: "text-white", label: "text-white" },
  { ratio: "3.9:1", grade: "Fails AA", surface: "bg-parchment", sample: "text-ink-48", label: "text-ink" },
];

const features = [
  { icon: Eye, title: "WCAG Compliance", description: "Comprehensive accessibility checks against WCAG guidelines." },
  { icon: Palette, title: "Color Analysis", description: "Deep color contrast and palette harmony evaluation." },
  { icon: Zap, title: "Instant Results", description: "Real-time analysis with actionable insights." },
  { icon: Sparkles, title: "AI-Powered", description: "Advanced AI insights for better design decisions." },
];

const stats = [
  ["99.9%", "Accuracy rate"],
  ["10K+", "Designs analyzed"],
  ["<2s", "Analysis time"],
];

interface LandingProps {
  onFileSelected: (file: File) => void;
  isAnalyzing: boolean;
  error: boolean;
}

export function Landing({ onFileSelected, isAnalyzing, error }: LandingProps) {
  return (
    <>
      <SubNav
        title="Lumi"
        links={[
          ["Overview", "#top"],
          ["Analyze", "#analyze"],
          ["Features", "#features"],
        ]}
        cta={
          <a href="#analyze" className="btn-primary min-h-0 px-4 py-1.5 text-caption">
            Analyze
          </a>
        }
      />
      <main>
        <section className="px-4 pt-16 pb-20 text-center md:pt-20">
          <p className="text-tagline">Lumi</p>
          <h1 className="mt-2 text-display-lg max-sm:text-[34px] max-[419px]:text-[28px] xl:text-hero">
            Accessibility, analyzed.
          </h1>
          <p className="mx-auto mt-4 max-w-[640px] text-lead max-sm:text-[21px]">
            WCAG compliance insights for your design, in seconds.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#analyze" className="btn-primary">
              Analyze a design
            </a>
            <a href="#features" className="btn-secondary">
              Learn more
            </a>
          </div>
          <ul className="mx-auto mt-16 grid max-w-[720px] grid-cols-3 overflow-hidden rounded-lg shadow-product">
            {specimens.map((s) => (
              <li key={s.grade} className={`flex aspect-[3/4] flex-col items-center justify-center gap-4 ${s.surface}`}>
                <span aria-hidden className={`font-display text-[56px] leading-none font-semibold md:text-[112px] ${s.sample}`}>
                  Aa
                </span>
                <span className={`text-caption ${s.label}`}>
                  <span className="block font-semibold">{s.ratio}</span>
                  {s.grade}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section id="analyze" className="scroll-mt-13 bg-tile-1 px-4 py-20 text-center text-white max-md:py-12">
          <div className="mx-auto max-w-text">
            <h2 className="text-display-lg max-sm:text-[32px]">Drop in a design.</h2>
            <p className="mx-auto mt-4 max-w-[640px] text-lead text-on-dark-muted max-sm:text-[21px]">
              A tool that doesn&apos;t just analyze your design — it elevates it.
            </p>
            <div className="mt-12">
              <UploadDropzone onFileSelected={onFileSelected} isUploading={isAnalyzing} />
            </div>
            {error && (
              <p role="alert" className="mt-6 text-body">
                We couldn&apos;t analyze that image. Try another PNG or JPG.
              </p>
            )}
          </div>
        </section>

        <section id="features" className="scroll-mt-13 bg-parchment px-4 py-20 max-md:py-12">
          <div className="mx-auto max-w-text">
            <h2 className="text-center text-display-lg max-sm:text-[32px]">Built to see what users see.</h2>
            <ul className="mt-12 grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f.title} className="rounded-lg border border-hairline bg-canvas p-6">
                  <f.icon className="size-7" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-6 font-sans text-body font-semibold">{f.title}</h3>
                  <p className="mt-1 text-body text-ink-80">{f.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-tile-3 px-4 py-20 text-white max-md:py-12">
          <dl className="mx-auto grid max-w-text gap-12 text-center sm:grid-cols-3">
            {stats.map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse gap-2">
                <dt className="text-body text-on-dark-muted">{label}</dt>
                <dd className="font-display text-display-lg xl:text-hero">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </>
  );
}
