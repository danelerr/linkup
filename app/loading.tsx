import { containerClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

function Bar({ className }: { className: string }) {
  return (
    <span
      className={cx(
        "block rounded-full bg-surface motion-safe:animate-pulse",
        className,
      )}
    />
  );
}

export default function Loading() {
  return (
    <div className="min-h-dvh">
      <div
        className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
        aria-hidden="true"
      >
        <span className="block h-full w-2/5 link-gradient animate-link-sweep" />
      </div>
      <main
        id="main-content"
        className={cx(containerClass, "pt-24 pb-20")}
        aria-busy="true"
      >
        <p className="sr-only" role="status">
          Cargando LinkUp…
        </p>
        <div className="mx-auto max-w-[1000px]" aria-hidden="true">
          <Bar className="h-11 w-3/4 max-w-xl" />
          <Bar className="mt-4 h-4 w-1/2 max-w-sm" />
          <Bar className="mt-10 h-14 w-full rounded-panel" />
          <div className="mt-10 grid gap-8">
            {[0, 1, 2].map((row) => (
              <div className="flex gap-5" key={row}>
                <Bar className="size-12 shrink-0 rounded-[12px]" />
                <div className="grid flex-1 gap-2.5">
                  <Bar className="h-4 w-40" />
                  <Bar className="h-3.5 w-full max-w-lg" />
                  <Bar className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
