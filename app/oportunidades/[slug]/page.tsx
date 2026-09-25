import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BackLink,
  BulletList,
  DetailSection,
  FactList,
  Notice,
  Paragraphs,
  SourceStamp,
  type Fact,
} from "@/components/detail";
import { OpeningRow } from "@/components/opening-row";
import { OpportunityActions } from "@/components/opportunity-actions";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { StartupLogo } from "@/components/ui/startup-logo";
import { safeRelativeReturnPath } from "@/lib/navigation";
import { getCurrentUser } from "@/lib/session";
import {
  formatShortDate,
  isOpportunityOpen,
  opportunitiesForOrganization,
  opportunityBySlug,
  organizationForOpportunity,
  similarOpportunities,
} from "@/lib/catalog";
import { closingLabel, todayIso } from "@/lib/dates";
import {
  isOpportunitySaved,
  listApplications,
  syncUser,
} from "@/lib/user-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
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

export default async function OpportunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    guardar?: string;
    registrar?: string;
    from?: string;
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const opportunity = opportunityBySlug(slug);
  if (!opportunity) notFound();
  const organization = organizationForOpportunity(opportunity);
  if (!organization) notFound();
  const user = await getCurrentUser();
  if (user) await syncUser(user);
  const [initiallySaved, userApplications] = user
    ? await Promise.all([
        isOpportunitySaved(user.userId, opportunity.slug),
        listApplications(user.userId),
      ])
    : [false, []];
  const initiallyRecorded = userApplications.some(
    (application) => application.opportunitySlug === opportunity.slug,
  );
  const from = safeRelativeReturnPath(query.from);
  const today = todayIso();
  const open =
    isOpportunityOpen(opportunity) && organization.status === "published";
  const closing = closingLabel(opportunity.closesAt, today);
  const startupHref = `/startups/${organization.slug}?from=${encodeURIComponent(from)}`;
  const siblings = opportunitiesForOrganization(organization.slug).filter(
    (item) => item.slug !== opportunity.slug,
  );
  const similar = similarOpportunities(opportunity);

  const facts: Fact[] = [
    { label: "Compensación", value: opportunity.compensation },
    {
      label: "Cierre",
      value: closing?.text ?? "Sin fecha de cierre",
      detail:
        opportunity.closesAt && !closing?.closed
          ? formatShortDate(opportunity.closesAt)
          : undefined,
      tone: open && closing?.urgent ? "warning" : undefined,
    },
    {
      label: "Modalidad",
      value: opportunity.modality,
      detail:
        opportunity.location && opportunity.location !== opportunity.modality
          ? opportunity.location
          : undefined,
    },
    { label: "Dedicación", value: opportunity.dedication },
    ...(opportunity.countriesAccepted
      ? [{ label: "Desde dónde", value: opportunity.countriesAccepted }]
      : []),
  ];
  const source = (
    <SourceStamp
      label={opportunity.sourceLabel}
      verifiedAt={opportunity.verifiedAt}
      sourceUrl={opportunity.sourceUrl}
      today={today}
    />
  );

  return (
    <SiteShell>
      <article className="pt-4 pb-32 sm:pt-8 lg:pb-24">
        <BackLink href={from}>Volver al directorio</BackLink>

        <div className="mt-4 grid gap-10 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div className="max-w-[680px] min-w-0">
            <header>
              <Link
                className="group inline-flex items-center gap-2.5"
                href={startupHref}
              >
                <StartupLogo
                  monogram={organization.monogram}
                  logoUrl={organization.logoUrl}
                  size={32}
                />
                <span className="font-semibold text-body transition-colors group-hover:text-action">
                  {organization.name}
                </span>
              </Link>
              <h1 className="mt-4 text-[2rem] leading-[1.08] font-semibold tracking-[-0.04em] text-balance sm:text-[2.625rem]">
                {opportunity.title}
              </h1>
              <p className="mt-3 text-[17px] leading-7 text-body">
                {opportunity.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="font-meta text-[13px] tracking-[0.02em] text-muted">
                  {[opportunity.type, opportunity.level, opportunity.area]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {opportunity.managedByLinkUp && (
                  <Badge tone="info">Gestionada por LinkUp</Badge>
                )}
              </div>
            </header>

            {!open && (
              <Notice tone="warning" className="mt-6">
                {closing?.closed
                  ? `Esta oportunidad cerró el ${formatShortDate(opportunity.closesAt!)}.`
                  : "Esta oportunidad ya no recibe postulaciones."}{" "}
                Puedes guardarla o revisar las similares más abajo.
              </Notice>
            )}
            {opportunity.isDemo && (
              <Notice title="Oportunidad demostrativa" className="mt-6">
                No envíes información real. Este contenido existe para probar el
                recorrido antes del piloto.
              </Notice>
            )}

            <FactList
              facts={facts}
              className="mt-7 grid-cols-2 rounded-panel border border-line bg-paper p-4 sm:p-5 lg:hidden"
            />

            <div className="mt-8 grid gap-8">
              <DetailSection title="La oportunidad">
                <Paragraphs text={opportunity.description} />
              </DetailSection>
              {opportunity.responsibilities.length > 0 && (
                <DetailSection title="Qué harías">
                  <BulletList items={opportunity.responsibilities} />
                </DetailSection>
              )}
              {opportunity.requirements.length > 0 && (
                <DetailSection title="Lo indispensable">
                  <BulletList items={opportunity.requirements} />
                </DetailSection>
              )}
              {opportunity.desirable.length > 0 && (
                <DetailSection title="Suma, pero no es requisito">
                  <BulletList items={opportunity.desirable} />
                </DetailSection>
              )}
              <div className="border-t border-line pt-6 lg:hidden">
                {source}
              </div>
            </div>

            <section className="mt-12 rounded-panel bg-surface p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <StartupLogo
                  monogram={organization.monogram}
                  logoUrl={organization.logoUrl}
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-[-0.02em]">
                    Sobre {organization.name}
                  </h2>
                  <p className="mt-1 text-[15px] leading-6 text-body">
                    {organization.shortDescription}
                  </p>
                  <p className="mt-1.5 font-meta text-[13px] tracking-[0.02em] text-muted">
                    {[
                      organization.industry,
                      organization.stage,
                      organization.teamSize,
                      organization.city,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              {siblings.length > 0 && (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                    También en {organization.name}
                  </p>
                  <ul className="mt-2 [&_a]:hover:bg-paper">
                    {siblings.slice(0, 3).map((item) => (
                      <li key={item.id}>
                        <OpeningRow
                          opportunity={item}
                          href={`/oportunidades/${item.slug}?from=${encodeURIComponent(from)}`}
                          today={today}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-action hover:underline"
                href={startupHref}
              >
                Ver {organization.name}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>

            {similar.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">
                  Oportunidades similares
                </h2>
                <ul className="mt-3 border-t border-line pt-2">
                  {similar.map((item) => (
                    <li key={item.opportunity.id}>
                      <OpeningRow
                        opportunity={item.opportunity}
                        organizationName={item.organization.name}
                        href={`/oportunidades/${item.opportunity.slug}?from=${encodeURIComponent(from)}`}
                        today={today}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside
            className="lg:sticky lg:top-24 lg:self-start"
            aria-label="Postular y condiciones"
          >
            <div className="lg:rounded-panel lg:border lg:border-line lg:bg-paper lg:p-5">
              <FactList facts={facts} className="mb-6 hidden lg:grid" />
              <OpportunityActions
                opportunitySlug={opportunity.slug}
                mode={opportunity.applicationMode}
                applicationUrl={opportunity.applicationUrl}
                open={open}
                trackable={
                  open &&
                  !opportunity.isDemo &&
                  opportunity.applicationMode === "external"
                }
                authenticated={Boolean(user)}
                initialSaved={initiallySaved}
                initialRecorded={initiallyRecorded}
                autoSave={query.guardar === "1"}
                autoRecord={query.registrar === "1"}
                from={from}
              />
              <div className="mt-6 hidden border-t border-line pt-5 lg:block">
                {source}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </SiteShell>
  );
}
