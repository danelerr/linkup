import { cx } from "@/lib/cx";

const variants = {
  primary:
    "border-action bg-action text-white hover:border-action-hover hover:bg-action-hover active:border-action-active active:bg-action-active",
  secondary:
    "border-line bg-paper text-ink hover:border-line-strong hover:bg-surface",
  quiet: "border-transparent text-body hover:bg-surface hover:text-ink",
  danger: "border-danger/40 bg-paper text-danger hover:bg-danger-soft",
  destructive: "border-danger bg-danger text-white hover:bg-danger/90",
  success: "border-success/30 bg-success-soft text-success",
  inert: "pointer-events-none border-line bg-disabled text-muted",
};

const sizes = {
  md: "min-h-11 px-[18px] text-[15px]",
  sm: "min-h-9 px-3.5 text-sm",
  icon: "size-11 shrink-0",
};

/** Button styles for <button>, <a> and <Link> (docs/marca.md). */
export function buttonClass({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  block?: boolean;
  className?: string;
} = {}) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-control border font-semibold whitespace-nowrap transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled disabled:text-muted",
    variants[variant],
    sizes[size],
    block && "w-full",
    className,
  );
}

/** Inline text action: blue, underlined on hover and focus. */
export const textLinkClass =
  "font-medium text-action underline-offset-4 hover:underline focus-visible:underline disabled:text-muted disabled:no-underline";
