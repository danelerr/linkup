import type { Metadata } from "next";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { EmptyState, sectionTitleClass } from "@/components/ui/layout";
import {
  opportunitiesForOrganization,
  organizationBySlug,
} from "@/lib/catalog";
import { closingLabel, todayIso } from "@/lib/dates";
import { cx } from "@/lib/cx";
import { requireOrganizationMember } from "@/lib/permissions";
import {
  countOrganizationApplications,
  countOrganizationMembers,
  hasOrganizationCandidateAccess,
} from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Panel de organización",
  robots: { index: false, follow: false },
};

export default async function OrganizationPanelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  const user = await requireOrganizationMember(
    `/organizacion/${slug}/panel`,
    slug,
  );
  const opportunityRows = opportunitiesForOrganization(slug);
  const candidateOpportunitySlugs = opportunitiesForOrganization(
    slug,
    true,
  ).map((item) => item.slug);
  const [candidateCount, memberCount, canViewCandidates, perOpportunity] =
    await Promise.all([
      countOrganizationApplications(candidateOpportunitySlugs),
      countOrganizationMembers(slug),
      hasOrganizationCandidateAccess(user.userId, slug),
      Promise.all(
        opportunityRows.map((item) =>
          countOrganizationApplications([item.slug]),
        ),
      ),
    ]);
  const today = todayIso();
  const stats = [
    { value: opportunityRows.length, label: "oportunidades abiertas" },
    {
      value: candidateCount,
      label: "postulaciones en LinkUp",
      href: canViewCandidates ? `/organizacion/${slug}/candidatos` : undefined,
    },
    { value: memberCount, label: memberCount === 1 ? "miembro" : "miembros" },
  ];

  return (
    <div className="grid gap-10">
      <section
        className="grid grid-cols-3 divide-x divide-line rounded-panel border border-line bg-paper"
        aria-label="Resumen"
      >
        {stats.map((stat) => {
          const body = (
            <>
              <strong className="block font-meta text-3xl leading-none font-bold tabular-nums">
                {stat.value}
              </strong>
              <span className="mt-1.5 block text-[13px] leading-5 text-body">
                {stat.label}
              </span>
            </>
          );
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-4 transition-colors hover:bg-surface sm:p-5"
            >
              {body}
            </Link>
          ) : (
            <div key={stat.label} className="p-4 sm:p-5">
              {body}
            </div>
          );
        })}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={sectionTitleClass}>Oportunidades abiertas</h2>
          <Link
            className={buttonClass({ variant: "secondary", size: "sm" })}
            href={`/agregar?tipo=oportunidad&startup=${slug}`}
          >
            <Plus className="size-4" aria-hidden="true" />
            Proponer otra
          </Link>
        </div>
        {opportunityRows.length ? (
          <ul className="mt-4 divide-y divide-line rounded-panel border border-line bg-paper">
            {opportunityRows.map((opportunity, index) => {
              const closing = closingLabel(opportunity.closesAt, today);
              return (
                <li key={opportunity.id}>
                  <Link
                    className="group flex flex-wrap items-center gap-x-4 gap-y-2 p-4 transition-colors hover:bg-surface sm:px-5"
                    href={`/oportunidades/${opportunity.slug}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold group-hover:text-action">
                        {opportunity.title}
                      </span>
                      <span className="font-meta text-[13px] text-muted">
                        {opportunity.type}
                        {closing && (
                          <span
                            className={cx(
                              closing.urgent && "font-semibold text-warning",
                            )}
                          >
                            {" · "}
                            {closing.text}
                          </span>
                        )}
                      </span>
                    </span>
                    {opportunity.applicationMode === "native" ? (
                      <Badge tone="info">
                        {perOpportunity[index]}{" "}
                        {perOpportunity[index] === 1
                          ? "postulación"
                          : "postulaciones"}
                      </Badge>
                    ) : (
                      <Badge>Sitio oficial</Badge>
                    )}
                    <ArrowRight
                      className="size-4 text-action"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState className="mt-4" title="No hay oportunidades abiertas.">
            Propón una y la revisaremos antes de publicarla.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
