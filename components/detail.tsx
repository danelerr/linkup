import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { relativePast } from "@/lib/dates";
import { cx } from "@/lib/cx";

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-action"
      href={href}
    >
      <ArrowLeft
        className="size-4 transition-transform group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      {children}
    </Link>
  );
}

export function DetailSection({
  title,
  children,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("border-t border-line pt-7", className)}>
      <h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="mt-3 text-base leading-7 text-body">{children}</div>
    </section>
  );
}

export function Paragraphs({ text }: { text: string }) {
  return (
    <div className="grid gap-4">
      {text
        .split(/\n{2,}/)
        .filter((part) => part.trim())
        .map((part, index) => (
          <p className="whitespace-pre-line" key={index}>
            {part.trim()}
          </p>
        ))}
    </div>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((item) => (
        <li
          className="relative pl-5 before:absolute before:top-[0.8em] before:left-0 before:h-0.5 before:w-2.5 before:rounded-full before:bg-teal"
          key={item}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export type Fact = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: "warning";
};

/** Label/value pairs for the conditions of a startup or opportunity. */
export function FactList({
  facts,
  className,
}: {
  facts: Fact[];
  className?: string;
}) {
  return (
    <dl className={cx("grid gap-x-4 gap-y-4", className)}>
      {facts.map((fact) => (
        <div className="min-w-0" key={fact.label}>
          <dt className="font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {fact.label}
          </dt>
          <dd
            className={cx(
              "mt-1 text-[15px] leading-snug font-semibold text-ink",
              fact.tone === "warning" && "text-warning",
            )}
          >
            {fact.value}
            {fact.detail && (
              <span className="mt-0.5 block font-meta text-[13px] font-normal tracking-[0.02em] text-muted">
                {fact.detail}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Which source backs the record and how recently someone checked it. */
export function SourceStamp({
  label,
  verifiedAt,
  sourceUrl,
  verb = "Comprobada",
  today,
  className,
}: {
  label: string;
  verifiedAt: string;
  sourceUrl?: string;
  verb?: string;
  today: string;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start gap-2.5 text-[13px]", className)}>
      <CheckCircle2
        className="mt-0.5 size-4 shrink-0 text-success"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-muted">
          {verb} {relativePast(verifiedAt, today)}
        </p>
        {sourceUrl && (
          <a
            className="mt-1 inline-flex items-center gap-1 font-semibold text-action hover:underline"
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver fuente oficial
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        )}
      </div>
    </div>
  );
}

export function Notice({
  tone = "neutral",
  title,
  children,
  className,
}: {
  tone?: "neutral" | "warning";
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-control border px-4 py-3 text-sm leading-6",
        tone === "warning"
          ? "border-warning/25 bg-warning-soft text-warning"
          : "border-line bg-surface text-body",
        className,
      )}
      role="status"
    >
      {title && (
        <p className="font-meta text-xs font-bold tracking-[0.08em] uppercase">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
