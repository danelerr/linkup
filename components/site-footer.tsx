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
        <Brand tone="dark" />
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
