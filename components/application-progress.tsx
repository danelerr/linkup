import { progressSteps, statusInfo } from "@/lib/application-status";
import { cx } from "@/lib/cx";

/**
 * Progress of an application drawn with the Link line: it advances from blue
 * to mint and rises briefly where the process stands.
 */
export function ApplicationProgress({
  status,
  mode,
  className,
}: {
  status: string;
  mode: string;
  className?: string;
}) {
  const steps = progressSteps(mode);
  const info = statusInfo(status);
  const reached = Math.max(0, steps.indexOf(status));
  const stopped = status === "no_continua" || status === "retirada";
  const percent = steps.length > 1 ? (reached / (steps.length - 1)) * 100 : 0;
  return (
    <div className={className}>
      <div
        className="relative mr-3 h-4"
        role="img"
        aria-label={`Estado: ${info.label}. Paso ${reached + 1} de ${steps.length}.`}
      >
        <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-line" />
        <span
          className={cx(
            "absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full",
            stopped ? "bg-line-strong" : "link-gradient",
            !stopped &&
              "after:absolute after:top-0 after:right-0 after:h-0.5 after:w-3 after:origin-left after:translate-x-full after:-rotate-[36deg] after:rounded-full after:bg-mint",
          )}
          style={{ width: `max(${percent}%, 6px)` }}
        />
        {steps.map((step, index) => (
          <span
            key={step}
            className={cx(
              "absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
              index <= reached && !stopped
                ? "bg-paper ring-2 ring-teal"
                : "bg-line-strong",
            )}
            style={{ left: `${(index / (steps.length - 1)) * 100}%` }}
          />
        ))}
      </div>
      <ol className="mt-2 hidden justify-between font-meta text-xs tracking-[0.02em] text-muted sm:flex">
        {steps.map((step, index) => (
          <li
            key={step}
            className={cx(
              index === reached && !stopped && "font-bold text-ink",
              index === 0 && "text-left",
            )}
          >
            {statusInfo(step).label}
          </li>
        ))}
      </ol>
    </div>
  );
}
