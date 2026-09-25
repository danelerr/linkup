import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { AdminSubmissionActions } from "@/components/admin-submission-actions";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Badge } from "@/components/ui/badge";
import { EmptyState, PageHeader } from "@/components/ui/layout";
import { userRoleLabels } from "@/lib/application-status";
import { formatShortDate, getOrganizations } from "@/lib/catalog";
import { requireOperator } from "@/lib/permissions";
import { getPilotMetrics, listPendingSubmissions } from "@/lib/user-data";
import { isSafeHttpUrl } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Operación",
  robots: { index: false, follow: false },
};

const kindLabel: Record<string, string> = {
  startup: "Nueva startup",
  opportunity: "Nueva oportunidad",
  claim: "Reclamación",
  correction: "Corrección",
};

const factLabel =
  "font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase";

function ExternalValue({ url }: { url: string | null }) {
  if (!url) return <span className="text-danger">URL inválida; no abrir</span>;
  return (
    <a
      className="inline-flex max-w-full items-center gap-1 break-all text-action hover:underline"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {url}
      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}

export default async function AdminPage() {
  const { user, role } = await requireOperator("/admin");
  const [rows, metrics] = await Promise.all([
    listPendingSubmissions(user.userId),
    getPilotMetrics(),
  ]);
  const pendingRows = rows.filter((row) => row.status === "pending");
  const organizations = getOrganizations();
  const options = organizations.map(({ slug, name }) => ({ slug, name }));
  const stats = [
    { value: pendingRows.length, label: "envíos pendientes" },
    { value: metrics.users, label: "cuentas" },
    { value: metrics.applications, label: "postulaciones" },
    { value: metrics.progressed, label: "avances reportados" },
  ];
  return (
    <WorkspaceShell nav={<AdminNav />}>
      <div className="grid gap-10">
        <PageHeader
          eyebrow={`Operación · ${userRoleLabels[role] ?? role}`}
          title="Cola de revisión"
          description="Todo cambio queda asociado a una persona y un motivo. Se muestran hasta 100 envíos, del más antiguo al más reciente."
        />
        <section
          className="grid grid-cols-2 divide-line rounded-panel border border-line bg-paper sm:grid-cols-4 sm:divide-x"
          aria-label="Señales del piloto"
        >
          {stats.map((stat) => (
            <div className="p-4 sm:p-5" key={stat.label}>
              <strong className="block font-meta text-3xl leading-none font-bold tabular-nums">
                {stat.value}
              </strong>
              <span className="mt-1.5 block text-[13px] text-body">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {pendingRows.length ? (
          <div className="grid gap-4">
            {pendingRows.map((row) => {
              const suggested = organizations.find(
                (organization) =>
                  organization.name.toLocaleLowerCase() ===
                  row.organizationName.toLocaleLowerCase(),
              );
              return (
                <article
                  className="rounded-panel border border-line bg-paper p-5 sm:p-6"
                  key={row.id}
                >
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Badge tone={row.kind === "claim" ? "warning" : "info"}>
                        {kindLabel[row.kind] ?? row.kind}
                      </Badge>
                      <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                        {row.opportunityTitle || row.organizationName}
                      </h2>
                      {row.opportunityTitle && (
                        <p className="text-sm text-body">
                          {row.organizationName}
                        </p>
                      )}
                    </div>
                    <time className="font-meta text-[13px] text-muted">
                      {formatShortDate(row.createdAt.slice(0, 10))}
                    </time>
                  </header>
                  <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
                    <div className="min-w-0">
                      <dt className={factLabel}>Contacto</dt>
                      <dd className="mt-0.5 break-all">{row.contactEmail}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className={factLabel}>Fuente</dt>
                      <dd className="mt-0.5">
                        <ExternalValue
                          url={
                            isSafeHttpUrl(row.sourceUrl) ? row.sourceUrl : null
                          }
                        />
                      </dd>
                    </div>
                    {row.websiteUrl && (
                      <div className="min-w-0">
                        <dt className={factLabel}>Sitio</dt>
                        <dd className="mt-0.5">
                          <ExternalValue
                            url={
                              isSafeHttpUrl(row.websiteUrl)
                                ? row.websiteUrl
                                : null
                            }
                          />
                        </dd>
                      </div>
                    )}
                    {row.notes && (
                      <div className="sm:col-span-2">
                        <dt className={factLabel}>Contexto</dt>
                        <dd className="mt-0.5 leading-6 text-body">
                          {row.notes}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <AdminSubmissionActions
                    id={row.id}
                    kind={row.kind}
                    suggestedSlug={suggested?.slug}
                    organizations={options}
                  />
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No hay envíos pendientes.">
            {metrics.submissions} recibidos en total. Los nuevos aparecerán
            aquí.
          </EmptyState>
        )}
      </div>
    </WorkspaceShell>
  );
}
