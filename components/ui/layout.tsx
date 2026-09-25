import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/** Page width: 1120 px of content, 24 px gutters (16 px on phones). */
export const containerClass = "mx-auto w-full max-w-[1168px] px-4 sm:px-6";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cx(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-4",
        className,
      )}
    >
      <div className="max-w-2xl min-w-0">
        {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
        <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-[2.125rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 text-[15px] leading-6 text-body sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export const eyebrowClass =
  "mb-2 font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase";

export const sectionTitleClass =
  "text-lg font-semibold tracking-[-0.02em] text-ink";

/** Empty or finished state inside a page section. */
export function EmptyState({
  title,
  children,
  actions,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-panel border border-dashed border-line-strong px-5 py-10 text-center sm:px-10",
        className,
      )}
    >
      <p className="text-base font-semibold text-ink">{title}</p>
      {children && (
        <div className="mx-auto mt-1.5 max-w-md text-[15px] leading-6 text-body">
          {children}
        </div>
      )}
      {actions && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {actions}
        </div>
      )}
    </div>
  );
}
