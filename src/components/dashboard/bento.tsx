import { Check, Minus, X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tile({
  title,
  id,
  dark,
  className,
  children,
}: {
  title?: string;
  id?: string;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "flex min-w-0 scroll-mt-16 flex-col rounded-lg p-6",
        dark ? "bg-tile-1 text-white" : "border border-hairline bg-canvas",
        className
      )}
    >
      {title && <h2 className="mb-4 text-tagline">{title}</h2>}
      {children}
    </section>
  );
}

export function Meter({ value, dark }: { value: number; dark?: boolean }) {
  return (
    <div className={cn("h-1 rounded-full", dark ? "bg-white/20" : "bg-hairline")} aria-hidden>
      <div
        className={cn("h-full rounded-full", dark ? "bg-white" : "bg-ink")}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const tones = {
  strong: "bg-ink text-white",
  outline: "border border-ink text-ink",
  soft: "bg-parchment text-ink",
};

const icons = { pass: Check, fail: X, review: Minus };

export type Tone = keyof typeof tones;

/** Status chip: text, weight and an optional icon carry the meaning, never color alone */
export function Tag({ tone, icon, children }: { tone: Tone; icon?: keyof typeof icons; children: ReactNode }) {
  const Icon = icon && icons[icon];
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 self-start rounded-xs px-2 text-[12px] font-semibold whitespace-nowrap",
        tones[tone]
      )}
    >
      {Icon && <Icon className="size-3" strokeWidth={2.5} aria-hidden />}
      {children}
    </span>
  );
}

export const PassTag = ({ passes, label }: { passes: boolean; label: string }) => (
  <Tag tone={passes ? "soft" : "strong"} icon={passes ? "pass" : "fail"}>
    {label}
  </Tag>
);

export function Bullets({ items, ordered, className }: { items: string[]; ordered?: boolean; className?: string }) {
  if (!items.length) return <p className={cn("text-caption", className)}>Nothing found.</p>;
  const List = ordered ? "ol" : "ul";
  return (
    <List className={cn("space-y-2 pl-5 text-caption marker:font-semibold", ordered ? "list-decimal" : "list-disc", className)}>
      {items.map((item, idx) => (
        <li key={idx} className="pl-1">
          {item}
        </li>
      ))}
    </List>
  );
}
