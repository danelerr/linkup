import type { Metadata } from "next";
import {
  ArrowRight,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CircleCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { ApplicationProgress } from "@/components/application-progress";
import { Badge } from "@/components/ui/badge";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import {
  EmptyState,
  PageHeader,
  sectionTitleClass,
} from "@/components/ui/layout";
import {
  memberRoleLabels,
  statusInfo,
  userRoleLabels,
} from "@/lib/application-status";
import {
  opportunityBySlug,
  organizationForOpportunity,
  organizationNames,
} from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import { cx } from "@/lib/cx";
import { directoryHref } from "@/lib/directory-filters";
import {
  getProfile,
  listApplications,
  getUserRole,
  listOrganizationMemberships,
  listSavedOpportunitySlugs,
  listSavedSearches,
  profileReadiness,
} from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Mi LinkUp",
  robots: { index: false, follow: false },
};

export default async function MyLinkUpPage() {
  const user = await requireSyncedUser("/mi-linkup");
  const [profile, savedSlugs, applicationRows, alerts, memberships, role] =
    await Promise.all([
      getProfile(user.userId),
      listSavedOpportunitySlugs(user.userId),
      listApplications(user.userId),
      listSavedSearches(user.userId),
      listOrganizationMemberships(user.userId),
      getUserRole(user.userId),
    ]);
  const readiness = profileReadiness(profile);
  const firstName = user.displayName.split(" ")[0];
  const recentApplication = applicationRows[0];
  const recentOpportunity = recentApplication
    ? await opportunityBySlug(recentApplication.opportunitySlug)
    : null;
  const recentOrganization = recentOpportunity
    ? await organizationForOpportunity(recentOpportunity)
    : null;
  const workspaceNames = await organizationNames(
    memberships.map((membership) => membership.organizationSlug),
  );
  // "Flexible" is a preference, not a directory filter.
  const exploreHref = directoryHref({
    abiertas: "1",
    modalidad: ["Remoto", "Híbrido", "Presencial"].includes(profile.modality)
      ? profile.modality
      : "",
  });
  const summary = [
    {
      href: "/mi-linkup/guardados",
      icon: Bookmark,
      count: savedSlugs.length,
      label: savedSlugs.length === 1 ? "guardada" : "guardadas",
    },
    {
      href: "/mi-linkup/postulaciones",
      icon: BriefcaseBusiness,
      count: applicationRows.length,
      label: applicationRows.length === 1 ? "postulación" : "postulaciones",
    },
    {
      href: "/mi-linkup/alertas",
      icon: Bell,
      count: alerts.length,
      label: alerts.length === 1 ? "alerta" : "alertas",
    },
  ];

  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="Mi LinkUp"
        title={`Hola, ${firstName}.`}
        description="Tus próximos pasos, sin llenar el perfil por llenar."
      />

      <section
        className={cx(
          "flex flex-col gap-5 rounded-panel border p-5 sm:flex-row sm:items-center sm:p-6",
          readiness.readyToApply
            ? "border-success/25 bg-success-soft"
            : "border-line bg-paper",
        )}
      >
        <span
          className={cx(
            "grid size-11 shrink-0 place-items-center rounded-full",
            readiness.readyToApply
              ? "bg-paper text-success"
              : "bg-surface text-action",
          )}
          aria-hidden="true"
        >
          {readiness.readyToApply ? (
            <CircleCheck className="size-5" />
          ) : (
            <UserRound className="size-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase">
            {readiness.readyToApply ? "Perfil listo" : "Siguiente paso"}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-[-0.02em]">
            {readiness.readyToApply
              ? "Ya puedes postular dentro de LinkUp."
              : "Deja listo tu perfil para postular."}
          </h2>
          {readiness.readyToApply ? (
            <p className="mt-1 text-sm leading-6 text-body">
              Revisarás exactamente qué se comparte antes de cada envío.
            </p>
          ) : (
            <div className="mt-3">
              <div
                className="h-1.5 overflow-hidden rounded-full bg-surface"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={readiness.total}
                aria-valuenow={readiness.complete}
                aria-label="Señales esenciales completas"
              >
                <span
                  className="block h-full rounded-full bg-action"
                  style={{
                    width: `${(readiness.complete / readiness.total) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-body">
                {readiness.complete} de {readiness.total} señales esenciales.
                Solo compartimos una copia cuando confirmas una postulación.
              </p>
            </div>
          )}
        </div>
        <Link
          className={buttonClass({
            variant: readiness.readyToApply ? "secondary" : "primary",
            className: "sm:shrink-0",
          })}
          href={readiness.readyToApply ? exploreHref : "/mi-linkup/perfil"}
        >
          {readiness.readyToApply
            ? "Explorar oportunidades"
            : "Completar perfil"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section
        className="grid grid-cols-3 divide-x divide-line rounded-panel border border-line bg-paper"
        aria-label="Resumen de actividad"
      >
        {summary.map(({ href, icon: Icon, count, label }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-2 p-4 transition-colors first:rounded-l-panel last:rounded-r-panel hover:bg-surface sm:p-5"
          >
            <Icon
              className="size-[18px] text-muted group-hover:text-action"
              aria-hidden="true"
            />
            <span>
              <strong className="block font-meta text-2xl leading-none font-bold tabular-nums">
                {count}
              </strong>
              <span className="mt-1 block text-[13px] text-body">{label}</span>
            </span>
          </Link>
        ))}
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className={sectionTitleClass}>Actividad reciente</h2>
          {recentApplication && (
            <Link
              className={cx(textLinkClass, "text-sm")}
              href="/mi-linkup/postulaciones"
            >
              Ver todas
            </Link>
          )}
        </div>
        {recentApplication && recentOpportunity ? (
          <Link
            className="group mt-4 block rounded-panel border border-line bg-paper p-5 transition-colors hover:border-line-strong"
            href="/mi-linkup/postulaciones"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0">
                <span className="block font-semibold group-hover:text-action">
                  {recentOpportunity.title}
                </span>
                <span className="font-meta text-[13px] text-muted">
                  {recentOrganization?.name}
                </span>
              </p>
              <Badge tone={statusInfo(recentApplication.status).tone}>
                {statusInfo(recentApplication.status).label}
              </Badge>
            </div>
            <ApplicationProgress
              className="mt-5"
              status={recentApplication.status}
              mode={recentApplication.mode}
            />
          </Link>
        ) : (
          <EmptyState
            className="mt-4"
            title="Todavía no registraste postulaciones."
            actions={
              <Link className={textLinkClass} href={exploreHref}>
                Buscar oportunidades
              </Link>
            }
          />
        )}
      </section>

      {(memberships.length > 0 || role === "admin" || role === "curator") && (
        <section>
          <h2 className={sectionTitleClass}>Tus espacios</h2>
          <div className="mt-4 divide-y divide-line rounded-panel border border-line bg-paper">
            {memberships.map((membership) => (
              <Link
                className="group flex items-center justify-between gap-4 p-4 transition-colors first:rounded-t-panel last:rounded-b-panel hover:bg-surface sm:px-5"
                href={`/organizacion/${membership.organizationSlug}/panel`}
                key={membership.organizationSlug}
              >
                <span className="min-w-0">
                  <span className="block font-semibold group-hover:text-action">
                    {workspaceNames.get(membership.organizationSlug) ??
                      membership.organizationSlug}
                  </span>
                  <span className="text-[13px] text-muted">
                    {memberRoleLabels[membership.memberRole] ??
                      membership.memberRole}
                  </span>
                </span>
                <ArrowRight className="size-4 text-action" aria-hidden="true" />
              </Link>
            ))}
            {(role === "admin" || role === "curator") && (
              <Link
                className="group flex items-center justify-between gap-4 p-4 transition-colors first:rounded-t-panel last:rounded-b-panel hover:bg-surface sm:px-5"
                href="/admin"
              >
                <span>
                  <span className="block font-semibold group-hover:text-action">
                    Operación de LinkUp
                  </span>
                  <span className="text-[13px] text-muted">
                    {userRoleLabels[role]}
                  </span>
                </span>
                <ArrowRight className="size-4 text-action" aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
