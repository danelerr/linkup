import type { Metadata } from "next";
import { ArrowUpRight, Bell } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BackLink,
  DetailSection,
  FactList,
  Notice,
  Paragraphs,
  SourceStamp,
} from "@/components/detail";
import { OpeningRow } from "@/components/opening-row";
import { SiteShell } from "@/components/site-shell";
import { Badge } from "@/components/ui/badge";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/layout";
import { StartupLogo } from "@/components/ui/startup-logo";
import { cx } from "@/lib/cx";
import { safeRelativeReturnPath } from "@/lib/navigation";
import {
  opportunitiesForOrganization,
  organizationBySlug,
} from "@/lib/catalog";
import { todayIso } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) return {};
  return {
    title: organization.name,
    description: organization.shortDescription,
    alternates: { canonical: `/startups/${organization.slug}` },
  };
}

export default async function StartupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  const openings =
    organization.status === "published"
      ? opportunitiesForOrganization(organization.slug)
      : [];
  const from = safeRelativeReturnPath((await searchParams).from);
  const today = todayIso();
  const alertHref = `/mi-linkup/alertas?q=${encodeURIComponent(organization.name)}`;

  return (
    <SiteShell>
      <article className="pt-4 pb-24 sm:pt-8">
        <BackLink href={from}>Volver al directorio</BackLink>

        <div className="mt-4 grid gap-10 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div className="max-w-[680px] min-w-0">
            <header className="flex items-start gap-4 sm:gap-5">
              <StartupLogo
                monogram={organization.monogram}
                logoUrl={organization.logoUrl}
                size={64}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h1 className="text-[2rem] leading-[1.08] font-semibold tracking-[-0.04em] sm:text-[2.625rem]">
                    {organization.name}
                  </h1>
                  {openings.length > 0 && (
                    <Badge tone="success">
                      {openings.length}{" "}
                      {openings.length === 1 ? "vacante" : "vacantes"}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-[17px] leading-7 text-body">
                  {organization.shortDescription}
                </p>
                <p className="mt-2 font-meta text-[13px] tracking-[0.02em] text-muted">
                  {[
                    organization.industry,
                    organization.stage,
                    organization.city,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {organization.websiteUrl && (
                  <a
                    className={buttonClass({
                      variant: "secondary",
                      size: "sm",
                      className: "mt-4",
                    })}
                    href={organization.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visitar sitio web
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                    <span className="sr-only">(se abre en otra pestaña)</span>
                  </a>
                )}
              </div>
            </header>

            {organization.status === "closed" && (
              <Notice tone="warning" className="mt-6">
                Este registro está cerrado y no aparece en el directorio activo.
              </Notice>
            )}
            {organization.isDemo && (
              <Notice title="Startup de ejemplo" className="mt-6">
                No es una empresa real.
              </Notice>
            )}

            <section className="mt-10" aria-labelledby="openings-title">
              <h2
                id="openings-title"
                className="text-lg font-semibold tracking-[-0.02em]"
              >
                Oportunidades abiertas
              </h2>
              {openings.length ? (
                <div className="link-tree mt-3 [--li-x:36px] [--trunk-bottom:0px] [--trunk-top:12px] [--trunk-x:11px]">
                  <ul className="pl-9">
                    {openings.map((opportunity, index) => (
                      <li
                        key={opportunity.id}
                        className={cx(
                          index === openings.length - 1 && "link-tree-end",
                        )}
                      >
                        <OpeningRow
                          opportunity={opportunity}
                          href={`/oportunidades/${opportunity.slug}?from=${encodeURIComponent(from)}`}
                          today={today}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyState
                  className="mt-4"
                  title="No hay vacantes abiertas ahora"
                  actions={
                    <Link
                      className={cx(
                        textLinkClass,
                        "inline-flex items-center gap-1.5",
                      )}
                      href={alertHref}
                    >
                      <Bell className="size-4" aria-hidden="true" />
                      Avisarme cuando publique vacantes
                    </Link>
                  }
                />
              )}
            </section>

            <DetailSection
              title={`Sobre ${organization.name}`}
              className="mt-10"
            >
              <Paragraphs text={organization.description} />
            </DetailSection>
          </div>

          <aside
            className="lg:sticky lg:top-24 lg:self-start"
            aria-label="Datos de la startup"
          >
            <div className="rounded-panel border border-line bg-paper p-5">
              <FactList
                className="grid-cols-2"
                facts={[
                  {
                    label: "Ubicación",
                    value: organization.city || "No indicada",
                  },
                  {
                    label: "Equipo",
                    value: organization.teamSize || "No indicado",
                  },
                  { label: "Industria", value: organization.industry },
                  {
                    label: "Etapa",
                    value: organization.stage || "No indicada",
                  },
                  {
                    label: "Modalidad",
                    value: organization.remotePolicy || "No indicada",
                  },
                  ...(organization.foundedYear > 0
                    ? [
                        {
                          label: "Fundación",
                          value: String(organization.foundedYear),
                        },
                      ]
                    : []),
                ]}
              />
              <SourceStamp
                className="mt-5 border-t border-line pt-5"
                label={organization.sourceLabel}
                verifiedAt={organization.verifiedAt}
                sourceUrl={organization.sourceUrl}
                verb="Revisada"
                today={today}
              />
              {openings.length > 0 && (
                <Link
                  className={cx(
                    textLinkClass,
                    "mt-5 flex items-center gap-1.5 border-t border-line pt-4 text-sm",
                  )}
                  href={alertHref}
                >
                  <Bell className="size-4" aria-hidden="true" />
                  Avisarme de nuevas vacantes
                </Link>
              )}
            </div>
            <Link
              className={buttonClass({
                variant: "quiet",
                size: "sm",
                block: true,
                className: "mt-3",
              })}
              href={`/agregar?tipo=reclamo&startup=${organization.slug}`}
            >
              ¿Representas a {organization.name}?
            </Link>
          </aside>
        </div>
      </article>
    </SiteShell>
  );
}
