import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

const tones = {
  success: "border-success/20 bg-success-soft text-success",
  neutral: "border-line bg-surface text-body",
  info: "border-action/20 bg-action/5 text-action",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
};

export type BadgeTone = keyof typeof tones;

/** Compact state pill (docs/03: pills only for filters or short states). */
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex min-h-6 shrink-0 items-center gap-1 rounded-full border px-2 font-meta text-xs font-semibold tracking-[0.02em] whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
