import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export const controlClass =
  "w-full min-h-11 rounded-control border border-line-strong bg-paper px-3 text-base text-ink transition-colors placeholder:text-muted/80 focus:border-action focus:outline-none focus:ring-1 focus:ring-action aria-invalid:border-danger disabled:bg-disabled disabled:text-muted";

export const textareaClass = cx(controlClass, "min-h-28 resize-y py-2.5");

export const selectClass = cx(controlClass, "select-chevron");

export const checkClass = "size-[18px] shrink-0 accent-action";

export const hintClass = "text-[13px] leading-5 font-normal text-muted";

/** A persistent label wrapping its control, with optional hint and error. */
export function Field({
  label,
  hint,
  error,
  optional = false,
  className,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cx("grid content-start gap-1.5", className)}>
      <span className="text-sm font-semibold text-body">
        {label}
        {optional && (
          <span className="ml-1.5 font-normal text-muted">(opcional)</span>
        )}
      </span>
      {children}
      {hint && <span className={hintClass}>{hint}</span>}
      {error && (
        <span className="text-[13px] font-medium text-danger">{error}</span>
      )}
    </label>
  );
}

/** Checkbox or radio with its label to the right. */
export function Check({
  children,
  className,
  input,
}: {
  children: ReactNode;
  className?: string;
  input: ReactNode;
}) {
  return (
    <label
      className={cx(
        "flex items-start gap-3 text-[15px] leading-6 text-body",
        className,
      )}
    >
      <span className="flex h-6 items-center">{input}</span>
      <span>{children}</span>
    </label>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      className="rounded-control border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger"
      role="alert"
    >
      {children}
    </p>
  );
}

export function FormSuccess({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      className="rounded-control border border-success/25 bg-success-soft px-3.5 py-2.5 text-sm font-medium text-success"
      role="status"
    >
      {children}
    </p>
  );
}
