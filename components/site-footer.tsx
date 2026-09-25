import Link from "next/link";
import { containerClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div
        className={cx(
          containerClass,
          "flex min-h-20 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 text-[13px] text-muted",
        )}
      >
        <p>LinkUp · Encuentra dónde sumarte.</p>
        <nav className="flex gap-5" aria-label="Información">
          <Link className="hover:text-action hover:underline" href="/confianza">
            Cómo verificamos
          </Link>
          <Link className="hover:text-action hover:underline" href="/agregar">
            Agregar información
          </Link>
        </nav>
      </div>
    </footer>
  );
}
