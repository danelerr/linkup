import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import { eyebrowClass } from "@/components/ui/layout";

export default function NotFound() {
  return (
    <SiteShell className="grid place-items-center py-24">
      <div className="max-w-lg text-center">
        <p className={eyebrowClass}>Error 404</p>
        <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.04em] sm:text-[2.5rem]">
          No encontramos esta página.
        </h1>
        <p className="mt-3 text-base leading-7 text-body">
          Puede que el enlace haya cambiado o que la oportunidad ya no esté
          publicada.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link className={buttonClass()} href="/">
            Volver a explorar
          </Link>
          <Link className={textLinkClass} href="/?abiertas=1">
            Ver oportunidades abiertas
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
