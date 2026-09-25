import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Opportunity } from "@/lib/catalog-types";
import { closingLabel } from "@/lib/dates";
import { cx } from "@/lib/cx";

/** One opportunity inside a list: role, conditions, pay and urgency. */
export function OpeningRow({
  opportunity,
  href,
  today,
  organizationName,
}: {
  opportunity: Opportunity;
  href: string;
  today: string;
  organizationName?: string;
}) {
  const closing = closingLabel(opportunity.closesAt, today);
  return (
    <Link
      href={href}
      className="group -ml-3 flex flex-col gap-1 rounded-control py-2.5 pr-3 pl-3 transition-colors hover:bg-surface sm:grid sm:grid-cols-[minmax(0,1fr)_auto_16px] sm:items-center sm:gap-x-6"
    >
      <span className="min-w-0">
        <span className="block text-[15px] leading-snug font-semibold text-ink group-hover:text-action sm:truncate">
          {opportunity.title}
        </span>
        <span className="mt-0.5 block font-meta text-[13px] tracking-[0.02em] text-muted">
          {[
            organizationName,
            opportunity.type,
            opportunity.modality,
            opportunity.level,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      <span className="flex flex-wrap items-baseline gap-x-2 sm:block sm:text-right">
        <span className="text-sm font-semibold text-ink tabular-nums">
          {opportunity.compensation}
        </span>
        {closing && (
          <span
            className={cx(
              "font-meta text-[13px] tracking-[0.02em] sm:block",
              closing.urgent ? "font-semibold text-warning" : "text-muted",
            )}
          >
            <span className="sm:hidden" aria-hidden="true">
              ·{" "}
            </span>
            {closing.text}
          </span>
        )}
      </span>
      <ArrowRight
        aria-hidden="true"
        className="hidden size-4 text-action transition-transform group-hover:translate-x-0.5 sm:block"
      />
    </Link>
  );
}
