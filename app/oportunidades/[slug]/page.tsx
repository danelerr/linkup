import type { Metadata } from "next";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, Clock3, MapPin, WalletCards } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SavedOpportunityButton } from "@/components/saved-opportunity-button";
import { RecordExternalApplication } from "@/components/record-external-application";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  formatShortDate,
  opportunityBySlug,
  organizationForOpportunity,
  opportunities,
} from "@/lib/catalog";
import { isOpportunitySaved, listApplications, syncUser } from "@/lib/user-data";

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ slug: opportunity.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = opportunityBySlug(slug);
  if (!opportunity) return {};
  const organization = organizationForOpportunity(opportunity);
  return {
    title: `${opportunity.title} en ${organization?.name ?? "startup"}`,
    description: opportunity.summary,
    alternates: { canonical: `/oportunidades/${opportunity.slug}` },
  };
}

export default async function OpportunityDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ guardar?: string; registrar?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const opportunity = opportunityBySlug(slug);
  if (!opportunity) notFound();
  const organization = organizationForOpportunity(opportunity);
  if (!organization) notFound();
  const user = await getChatGPTUser();
  if (user) await syncUser(user);
  const [initiallySaved, userApplications] = user
    ? await Promise.all([isOpportunitySaved(user.userId, opportunity.slug), listApplications(user.userId)])
    : [false, []];
  const initiallyRecorded = userApplications.some((application) => application.opportunitySlug === opportunity.slug);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main">
        <article className="detail-page opportunity-detail">
          <Link className="back-link" href="/?abiertas=1">
            <ArrowLeft size={16} aria-hidden="true" /> Volver al directorio
          </Link>

          <div className="detail-grid">
            <div className="detail-content">
              <header className="opportunity-heading">
                <div className="opportunity-labels">
                  <span>{opportunity.type}</span>
                  {opportunity.managedByLinkUp && <span className="managed-label">Gestionada por LinkUp</span>}
                </div>
                <h1>{opportunity.title}</h1>
                <Link href={`/startups/${organization.slug}`}>{organization.name}</Link>
                <p>{opportunity.summary}</p>
              </header>

              <div className="demo-notice">
                <span>Oportunidad demostrativa</span>
                No envíes información real. Este contenido existe para probar el recorrido antes del piloto.
              </div>

              <section className="detail-section">
                <h2>La oportunidad</h2>
                <p>{opportunity.description}</p>
              </section>

              <section className="detail-section">
                <h2>Qué harías</h2>
                <ul className="plain-list">
                  {opportunity.responsibilities.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <section className="detail-section">
                <h2>Lo indispensable</h2>
                <ul className="plain-list">
                  {opportunity.requirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <section className="detail-section">
                <h2>Suma, pero no es requisito</h2>
                <ul className="plain-list">
                  {opportunity.desirable.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            </div>

            <aside className="detail-aside opportunity-aside" aria-label="Condiciones de la oportunidad">
              <dl className="fact-list">
                <div>
                  <dt><Building2 size={16} aria-hidden="true" /> Organización</dt>
                  <dd>{organization.name}</dd>
                </div>
                <div>
                  <dt><MapPin size={16} aria-hidden="true" /> Modalidad</dt>
                  <dd>{opportunity.modality} · {opportunity.location}</dd>
                </div>
                <div>
                  <dt><Clock3 size={16} aria-hidden="true" /> Dedicación</dt>
                  <dd>{opportunity.dedication}</dd>
                </div>
                <div>
                  <dt><WalletCards size={16} aria-hidden="true" /> Compensación</dt>
                  <dd>{opportunity.compensation}</dd>
                </div>
                {opportunity.closesAt && (
                  <div>
                    <dt><CalendarDays size={16} aria-hidden="true" /> Cierre</dt>
                    <dd>{formatShortDate(opportunity.closesAt)}</dd>
                  </div>
                )}
              </dl>

              {opportunity.applicationMode === "native" ? (
                <Link className="button-primary aside-button" href={`/oportunidades/${opportunity.slug}/postular`}>
                  Postular dentro de LinkUp
                </Link>
              ) : (
                <a className="button-primary aside-button" href="#fuente-demostrativa" aria-describedby="source-demo-help">
                  Ver fuente oficial
                </a>
              )}
              <SavedOpportunityButton
                opportunitySlug={opportunity.slug}
                initialSaved={initiallySaved}
                authenticated={Boolean(user)}
                autoSave={query.guardar === "1"}
              />
              {opportunity.applicationMode === "external" && (
                <RecordExternalApplication
                  opportunitySlug={opportunity.slug}
                  authenticated={Boolean(user)}
                  initialRecorded={initiallyRecorded}
                  autoRecord={query.registrar === "1"}
                />
              )}

              <div className="source-stamp" id="fuente-demostrativa">
                <CheckCircle2 size={16} aria-hidden="true" />
                <div>
                  <strong>{opportunity.sourceLabel}</strong>
                  <span>Comprobada el {formatShortDate(opportunity.verifiedAt)}</span>
                </div>
              </div>
              {opportunity.applicationMode === "external" && (
                <p className="source-help" id="source-demo-help">
                  La versión real abrirá la publicación de origen. Este ejemplo no enlaza a una vacante inexistente.
                </p>
              )}
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
