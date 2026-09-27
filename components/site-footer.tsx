import Link from "next/link";
import { Brand } from "@/components/brand";
import { containerClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

export function SiteFooter() {
  return (
    <footer className="bg-navy">
      <div
        className={cx(
          containerClass,
          "flex flex-wrap items-center justify-between gap-x-8 gap-y-5 py-8",
        )}
      >
        <div className="grid gap-2">
          <Brand tone="dark" />
          <p className="font-display text-[11px] font-semibold tracking-[0.22em] text-cyan uppercase">
            Connect · Grow · Succeed
          </p>
        </div>
        <nav
          className="flex gap-5 text-[13px] text-on-navy-muted"
          aria-label="Información"
        >
          <Link className="hover:text-white hover:underline" href="/confianza">
            Cómo verificamos
          </Link>
          <Link className="hover:text-white hover:underline" href="/agregar">
            Agregar información
          </Link>
        </nav>
      </div>
    </footer>
  );
}
