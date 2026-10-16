import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { BackLink } from "@/components/detail";
import { SiteShell } from "@/components/site-shell";
import { buttonClass } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/layout";
import { statusInfo } from "@/lib/application-status";
import {
  opportunityBySlug,
  organizationForOpportunity,
  isOpportunityOpen,
} from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import {
  getProfile,
  listApplications,
  profileReadiness,
} from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Postular",
  robots: { index: false, follow: false },
};

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = await opportunityBySlug(slug);
  if (!opportunity || opportunity.applicationMode !== "native") notFound();
  const organization = await organizationForOpportunity(opportunity);
  if (!organization) notFound();
  const user = await requireSyncedUser(`/oportunidades/${slug}/postular`);
  const [profile, applicationRows] = await Promise.all([
    getProfile(user.userId),
    listApplications(user.userId),
  ]);
  const readiness = profileReadiness(profile);
  const existing = applicationRows.find(
    (item) => item.opportunitySlug === opportunity.slug,
  );

  return (
    <SiteShell>
      <div className="mx-auto max-w-[720px] pt-4 pb-24 sm:pt-8">
        <BackLink href={`/oportunidades/${opportunity.slug}`}>
          Volver a la oportunidad
        </BackLink>
        <PageHeader
          className="mt-4"
          eyebrow="Postulación dentro de LinkUp"
          title={opportunity.title}
          description={organization.name}
        />
        <div className="mt-10">
          {!isOpportunityOpen(opportunity) ? (
            <EmptyState
              title="Esta oportunidad ya está cerrada."
              actions={
                <Link
                  href="/?abiertas=1"
                  className={buttonClass({ variant: "secondary" })}
                >
                  Ver oportunidades abiertas
                </Link>
              }
            />
          ) : existing ? (
            <EmptyState
              title="Ya registraste esta postulación."
              actions={
                <Link
                  className={buttonClass({ variant: "secondary" })}
                  href="/para-ti/postulaciones"
                >
                  Ver seguimiento
                </Link>
              }
            >
              Su estado actual es{" "}
              <strong>{statusInfo(existing.status).label}</strong>.
            </EmptyState>
          ) : !readiness.readyToApply ? (
            <EmptyState
              title="Completa primero los datos esenciales."
              actions={
                <Link
                  className={buttonClass()}
                  href={`/para-ti/perfil?return_to=${encodeURIComponent(`/oportunidades/${slug}/postular`)}`}
                >
                  Completar perfil
                </Link>
              }
            >
              Llevas {readiness.complete} de {readiness.total}. Volverás aquí
              después de guardar tu perfil.
            </EmptyState>
          ) : (
            <ApplicationForm
              opportunitySlug={opportunity.slug}
              profile={profile}
              isDemo={opportunity.isDemo}
            />
          )}
        </div>
      </div>
    </SiteShell>
  );
}
