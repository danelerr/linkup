import type { Metadata } from "next";
import { ArrowLeft, CircleAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { opportunityBySlug, organizationForOpportunity } from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import { getProfile, listApplications, profileReadiness } from "@/lib/user-data";

export const metadata: Metadata = { title: "Postular", robots: { index: false, follow: false } };

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = opportunityBySlug(slug);
  if (!opportunity || opportunity.applicationMode !== "native") notFound();
  const organization = organizationForOpportunity(opportunity);
  if (!organization) notFound();
  const user = await requireSyncedUser(`/oportunidades/${slug}/postular`);
  const [profile, applicationRows] = await Promise.all([getProfile(user.userId), listApplications(user.userId)]);
  const readiness = profileReadiness(profile);
  const existing = applicationRows.find((item) => item.opportunitySlug === opportunity.slug);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main">
        <div className="apply-page">
          <Link className="back-link" href={`/oportunidades/${opportunity.slug}`}>
            <ArrowLeft size={16} aria-hidden="true" /> Volver a la oportunidad
          </Link>
          <header className="apply-heading">
            <p className="eyebrow">Postulación dentro de LinkUp</p>
            <h1>{opportunity.title}</h1>
            <p>{organization.name}</p>
          </header>
          {existing ? (
            <div className="apply-blocked">
              <CircleAlert size={22} aria-hidden="true" />
              <div><h2>Ya registraste esta postulación.</h2><p>Su estado actual es <strong>{existing.status.replace("_", " ")}</strong>.</p></div>
              <Link className="button-secondary" href="/mi-linkup/postulaciones">Ver seguimiento</Link>
            </div>
          ) : !readiness.readyToApply ? (
            <div className="apply-blocked">
              <CircleAlert size={22} aria-hidden="true" />
              <div><h2>Completa primero los datos esenciales.</h2><p>Llevas {readiness.complete} de {readiness.total}. Volverás aquí después de guardar tu perfil.</p></div>
              <Link className="button-primary" href={`/mi-linkup/perfil?return_to=${encodeURIComponent(`/oportunidades/${slug}/postular`)}`}>Completar perfil</Link>
            </div>
          ) : (
            <ApplicationForm opportunitySlug={opportunity.slug} profile={profile} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
