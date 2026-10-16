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
import { cx } from "@/lib/cx";
import { directoryHref } from "@/lib/directory-filters";
import { getCurrentUser, signInPath } from "@/lib/session";
import {
  getProfile,
  listApplications,
  getUserRole,
  listOrganizationMemberships,
  listSavedOpportunitySlugs,
  listSavedSearches,
  profileReadiness,
  syncUser,
} from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Para ti",
  robots: { index: false, follow: false },
};

const sections = [
  {
    icon: Bookmark,
    title: "Guardados",
    text: "Las oportunidades que quieres revisar después. Las que cierran pronto aparecen marcadas.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Postulaciones",
    text: "Las que enviaste y en qué estado está cada una.",
  },
  {
    icon: Bell,
    title: "Alertas",
    text: "Búsquedas guardadas que te muestran las oportunidades nuevas que coinciden.",
  },
  {
    icon: UserRound,
    title: "Perfil",
    text: "Lo que ve una startup cuando postulas. Nadie más lo ve.",
  },
];

function SignedOut() {
  return (
    <div className="mx-auto max-w-[720px] pt-9 pb-24 sm:pt-16">
      <PageHeader
        title="Para ti"
        description="Ingresa para usar estas secciones."
      />
      <ul className="mt-8 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
        {sections.map(({ icon: Icon, title, text }) => (
          <li className="flex gap-3.5 bg-paper p-5" key={title}>
            <Icon
              className="mt-0.5 size-5 shrink-0 text-action"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-body">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link className={buttonClass()} href={signInPath("/para-ti")}>
          Ingresar
        </Link>
        <p className="text-sm text-muted">
          Si es tu primera vez, la cuenta se crea con tu correo.
        </p>
      </div>
    </div>
  );
}

export default async function ForYouPage() {
  const user = await getCurrentUser();
  if (!user) return <SignedOut />;
  await syncUser(user);
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
      href: "/para-ti/guardados",
      icon: Bookmark,
      count: savedSlugs.length,
      label: savedSlugs.length === 1 ? "guardada" : "guardadas",
    },
    {
      href: "/para-ti/postulaciones",
      icon: BriefcaseBusiness,
      count: applicationRows.length,
      label: applicationRows.length === 1 ? "postulación" : "postulaciones",
    },
    {
      href: "/para-ti/alertas",
      icon: Bell,
      count: alerts.length,
      label: alerts.length === 1 ? "alerta" : "alertas",
    },
  ];

  return (
    <div className="grid gap-10">
      <PageHeader
        title={`Hola, ${firstName}.`}
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
          <h2 className="text-lg font-semibold tracking-[-0.02em]">
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
                aria-label="Datos esenciales completos"
              >
                <span
                  className="block h-full rounded-full bg-action"
                  style={{
                    width: `${(readiness.complete / readiness.total) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-body">
                {readiness.complete} de {readiness.total} datos esenciales.
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
          href={readiness.readyToApply ? exploreHref : "/para-ti/perfil"}
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
              href="/para-ti/postulaciones"
            >
              Ver todas
            </Link>
          )}
        </div>
        {recentApplication && recentOpportunity ? (
          <Link
            className="group mt-4 block rounded-panel border border-line bg-paper p-5 transition-colors hover:border-line-strong"
            href="/para-ti/postulaciones"
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
