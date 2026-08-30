import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, Eye, FileSearch, History, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Cómo verificamos",
  description: "Cómo LinkUp revisa fuentes, vigencia y procedencia de startups y oportunidades.",
  alternates: { canonical: "/confianza" },
};

const checks = [
  { icon: FileSearch, title: "La fuente", text: "Buscamos una página oficial, publicación atribuible o envío de una organización identificada." },
  { icon: CheckCircle2, title: "La vigencia", text: "Comprobamos si la oportunidad sigue abierta y mostramos la fecha de la última revisión." },
  { icon: History, title: "La procedencia", text: "Distinguimos lo importado, lo enviado por la comunidad y lo declarado por la organización." },
  { icon: ShieldCheck, title: "La intervención", text: "Solo usamos “Gestionada por LinkUp” cuando revisamos la oportunidad y operamos la postulación." },
];

export default function TrustPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main">
        <article className="trust-page">
          <Link className="back-link" href="/"><ArrowLeft size={16} aria-hidden="true" /> Volver a explorar</Link>
          <header className="trust-heading">
            <p className="eyebrow">Confianza</p>
            <h1>Una fuente visible vale más que una insignia vacía.</h1>
            <p>LinkUp no afirma que una startup sea segura, rentable o un buen lugar para trabajar. Explica de dónde viene cada dato y cuándo fue revisado.</p>
          </header>
          <div className="trust-checks">
            {checks.map(({ icon: Icon, title, text }, index) => (
              <section key={title}>
                <span><Icon size={19} aria-hidden="true" /></span>
                <div><small>0{index + 1}</small><h2>{title}</h2><p>{text}</p></div>
              </section>
            ))}
          </div>
          <section className="trust-principle">
            <Eye size={20} aria-hidden="true" />
            <div><h2>Las fichas actuales son demostrativas.</h2><p>Antes del piloto público se reemplazarán por registros con fuentes reales y permisos de uso claros. La interfaz ya las identifica para no confundir una prueba de producto con información verificada.</p></div>
          </section>
          <p className="trust-action">¿Viste un dato incorrecto? <Link href="/agregar?tipo=correccion">Envíanos una corrección con su fuente.</Link></p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
