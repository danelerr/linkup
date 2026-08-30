import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, CheckCircle2, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  formatShortDate,
  opportunitiesForOrganization,
  organizationBySlug,
  organizations,
} from "@/lib/catalog";

export function generateStaticParams() {
  return organizations.map((organization) => ({ slug: organization.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) return {};
  return {
    title: organization.name,
    description: organization.shortDescription,
    alternates: { canonical: `/startups/${organization.slug}` },
  };
}

export default async function StartupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  const relatedOpportunities = opportunitiesForOrganization(organization.slug);

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main">
        <article className="detail-page">
          <Link className="back-link" href="/startups">
            <ArrowLeft size={16} aria-hidden="true" /> Todas las startups
          </Link>

          <div className="detail-grid">
            <div className="detail-content">
              <header className="entity-heading">
                <span className="entity-logo" aria-hidden="true">{organization.monogram}</span>
                <div>
                  <div className="title-with-status">
                    <h1>{organization.name}</h1>
                    {organization.hiring && <span className="status-dot">Contratando</span>}
                  </div>
                  <p>{organization.shortDescription}</p>
                </div>
              </header>

              <div className="demo-notice">
                <span>Registro demostrativo</span>
                Esta ficha sirve para validar la experiencia del producto; no representa una empresa publicada todavía.
              </div>

              <section className="detail-section">
                <h2>Sobre {organization.name}</h2>
                <p>{organization.description}</p>
              </section>

              <section className="detail-section">
                <div className="section-heading-row">
                  <h2>Oportunidades</h2>
                  <span>{relatedOpportunities.length}</span>
                </div>
                {relatedOpportunities.length ? (
                  <div className="compact-opportunity-list">
                    {relatedOpportunities.map((opportunity) => (
                      <Link href={`/oportunidades/${opportunity.slug}`} key={opportunity.id}>
                        <span>
                          <strong>{opportunity.title}</strong>
                          <small>{opportunity.type} · {opportunity.modality} · {opportunity.location}</small>
                        </span>
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="muted-copy">No encontramos oportunidades activas de esta startup.</p>
                )}
              </section>
            </div>

            <aside className="detail-aside" aria-label="Datos de la startup">
              <dl className="fact-list">
                <div>
                  <dt><MapPin size={16} aria-hidden="true" /> Ubicación</dt>
                  <dd>{organization.city}, {organization.country}</dd>
                </div>
                <div>
                  <dt><Users size={16} aria-hidden="true" /> Equipo</dt>
                  <dd>{organization.teamSize}</dd>
                </div>
                <div>
                  <dt><BriefcaseBusiness size={16} aria-hidden="true" /> Industria</dt>
                  <dd>{organization.industry}</dd>
                </div>
              </dl>
              <div className="aside-data">
                <span>Etapa</span><strong>{organization.stage}</strong>
                <span>Modalidad</span><strong>{organization.remotePolicy}</strong>
                <span>Fundación</span><strong>{organization.foundedYear}</strong>
              </div>
              <div className="source-stamp">
                <CheckCircle2 size={16} aria-hidden="true" />
                <div>
                  <strong>{organization.sourceLabel}</strong>
                  <span>Revisado el {formatShortDate(organization.verifiedAt)}</span>
                </div>
              </div>
              <Link className="button-secondary aside-button" href={`/agregar?tipo=reclamo&startup=${organization.slug}`}>
                ¿Representas a esta startup?
              </Link>
            </aside>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
