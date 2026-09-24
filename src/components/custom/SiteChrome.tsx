import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ReactNode } from "react";

const navLinks = [
  ["WCAG 2.2", "https://www.w3.org/WAI/WCAG22/quickref/"],
  ["Understanding", "https://www.w3.org/WAI/WCAG22/Understanding/"],
  ["ARIA Patterns", "https://www.w3.org/WAI/ARIA/apg/patterns/"],
  ["Contrast Checker", "https://webaim.org/resources/contrastchecker/"],
];

const footerColumns = [
  {
    heading: "Standards",
    links: [
      ["WCAG 2.2 Quick Reference", "https://www.w3.org/WAI/WCAG22/quickref/"],
      ["Understanding WCAG 2.2", "https://www.w3.org/WAI/WCAG22/Understanding/"],
      ["ARIA Authoring Practices", "https://www.w3.org/WAI/ARIA/apg/"],
    ],
  },
  {
    heading: "Tools",
    links: [
      ["WebAIM Contrast Checker", "https://webaim.org/resources/contrastchecker/"],
      ["Evaluating Accessibility", "https://www.w3.org/WAI/test-evaluate/"],
    ],
  },
];

// External links open in a new tab so an in-memory analysis isn't lost.
function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in new tab)</span>
    </a>
  );
}

export function GlobalNav() {
  return (
    <nav aria-label="Global" className="relative z-50 bg-black text-white">
      <div className="mx-auto flex h-11 max-w-[1024px] items-center justify-between px-4 text-nav">
        <Link href="/" className="text-[17px] font-semibold tracking-[-0.374px]">
          Lumi
        </Link>
        <ul className="hidden gap-10 lg:flex">
          {navLinks.map(([label, href]) => (
            <li key={label}>
              <ExternalLink href={href}>{label}</ExternalLink>
            </li>
          ))}
        </ul>
        <details className="group lg:hidden">
          <summary
            aria-label="Menu"
            className="-mr-3 flex size-11 list-none items-center justify-center [&::-webkit-details-marker]:hidden"
          >
            <Menu className="size-4 group-open:hidden" aria-hidden />
            <X className="hidden size-4 group-open:block" aria-hidden />
          </summary>
          <ul className="absolute inset-x-0 top-11 space-y-3 bg-black px-8 pt-4 pb-10">
            {navLinks.map(([label, href]) => (
              <li key={label}>
                <ExternalLink href={href} className="text-lead font-semibold">
                  {label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </nav>
  );
}

export function SubNav({ title, links, cta }: { title: string; links: [string, string][]; cta: ReactNode }) {
  return (
    <nav aria-label={title} className="frosted sticky top-0 z-40 border-b border-black/8">
      <div className="mx-auto flex h-13 max-w-text items-center justify-between gap-6 px-4">
        <span className="font-display text-tagline">{title}</span>
        <div className="flex items-center gap-6 text-caption text-ink-80">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="hidden md:inline">
              {label}
            </a>
          ))}
          {cta}
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-parchment px-4 py-16 text-ink-80">
      <div className="mx-auto max-w-text">
        <p className="border-b border-hairline pb-6 text-fine">
          Lumi scores are automated guidance, not a WCAG conformance audit. Test with real users and assistive
          technology before you ship.
        </p>
        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h2 className="font-sans text-caption font-semibold text-ink">{column.heading}</h2>
              <ul className="mt-2 text-dense-link">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <ExternalLink href={href}>{label}</ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t border-hairline pt-6 text-fine">Lumi. Built for accessible interfaces.</p>
      </div>
    </footer>
  );
}
