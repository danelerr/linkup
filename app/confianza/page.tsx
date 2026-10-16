import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";
import { BackLink } from "@/components/detail";
import { SiteShell } from "@/components/site-shell";
import { textLinkClass } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Cómo verificamos",
  description:
    "Cómo LinkUp revisa fuentes, vigencia y procedencia de startups y oportunidades.",
  alternates: { canonical: "/confianza" },
};

const checks = [
  {
    title: "La fuente",
    text: "Buscamos una página oficial, publicación atribuible o envío de una organización identificada.",
  },
  {
    title: "La vigencia",
    text: "Comprobamos si la oportunidad sigue abierta y mostramos la fecha de la última revisión.",
  },
  {
    title: "La procedencia",
    text: "Distinguimos lo importado, lo enviado por la comunidad y lo declarado por la organización.",
  },
  {
    title: "La intervención",
    text: "Solo usamos “Gestionada por LinkUp” cuando revisamos la oportunidad y operamos la postulación.",
  },
];

export default function TrustPage() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-[760px] pt-4 pb-24 sm:pt-8">
        <BackLink href="/">Volver a explorar</BackLink>
        <PageHeader
          className="mt-4"
          title="Cómo verificamos"
          description="Mostramos de dónde viene cada dato y cuándo lo revisamos. No afirmamos que una startup sea segura, rentable o un buen lugar para trabajar."
        />
        <ol className="link-tree mt-12 grid gap-8 [--li-x:0px] [--trunk-bottom:0px] [--trunk-top:6px] [--trunk-x:11px]">
          {checks.map(({ title, text }, index) => (
            <li
              key={title}
              className={
                index === checks.length - 1 ? "link-tree-end pl-12" : "pl-12"
              }
            >
              <p className="font-meta text-xs font-bold tracking-[0.08em] text-muted">
                0{index + 1}
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                {title}
              </h2>
              <p className="mt-1.5 text-[15px] leading-6 text-body">{text}</p>
            </li>
          ))}
        </ol>
        <section className="mt-12 flex gap-4 rounded-panel bg-surface p-5 sm:p-6">
          <Eye
            className="mt-0.5 size-5 shrink-0 text-action"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-base font-semibold">Fichas de ejemplo</h2>
            <p className="mt-1.5 text-[15px] leading-6 text-body">
              Las fichas marcadas como de ejemplo no son oportunidades reales.
              Todo lo demás pasa por revisión humana y muestra su fuente y fecha
              de comprobación. Aun así, una oportunidad puede cerrar después de
              revisarla.
            </p>
          </div>
        </section>
        <p className="mt-8 text-[15px] text-body">
          ¿Viste un dato incorrecto?{" "}
          <Link className={textLinkClass} href="/agregar?tipo=correccion">
            Envíanos una corrección con su fuente.
          </Link>
        </p>
      </article>
    </SiteShell>
  );
}
