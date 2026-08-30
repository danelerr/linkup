import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SubmissionForm } from "@/components/submission-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { organizationBySlug } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Agregar información",
  description: "Propón una startup, oportunidad o corrección para revisión de LinkUp.",
  alternates: { canonical: "/agregar" },
};

export default async function AddPage({ searchParams }: { searchParams: Promise<{ tipo?: string; startup?: string }> }) {
  const params = await searchParams;
  const initialKind = params.tipo === "reclamo" ? "claim" : params.tipo === "oportunidad" ? "opportunity" : "startup";
  const organization = params.startup ? organizationBySlug(params.startup) : null;
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main">
        <div className="submission-page">
          <Link className="back-link" href="/"><ArrowLeft size={16} aria-hidden="true" /> Volver a explorar</Link>
          <header className="submission-heading">
            <p className="eyebrow">Directorio comunitario, publicación revisada</p>
            <h1>Ayúdanos a completar el mapa.</h1>
            <p>Busca primero para evitar duplicados. Cada envío queda pendiente hasta que comprobemos la fuente.</p>
          </header>
          <SubmissionForm initialKind={initialKind} initialOrganization={organization?.name ?? ""} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
