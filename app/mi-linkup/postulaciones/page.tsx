import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ApplicationProgress } from "@/components/application-progress";
import { ApplicationStatusControl } from "@/components/application-status-control";
import { FormSuccess } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { textLinkClass } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/layout";
import { statusInfo } from "@/lib/application-status";
import {
  formatShortDate,
  opportunitiesWithOrganizations,
} from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import { listApplications } from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Postulaciones",
  robots: { index: false, follow: false },
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ enviada?: string }>;
}) {
  const user = await requireSyncedUser("/mi-linkup/postulaciones");
  const params = await searchParams;
  const rows = await listApplications(user.userId);
  const listed = new Map(
    (
      await opportunitiesWithOrganizations(
        rows.map((row) => row.opportunitySlug),
      )
    ).map((item) => [item.opportunity.slug, item]),
  );
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Mi LinkUp"
        title="Postulaciones"
        description="Un solo lugar para recordar qué pasó y cuál es el siguiente paso."
      />
      {params.enviada === "1" && (
        <FormSuccess>
          Postulación enviada. Guardamos una copia de lo que compartiste.
        </FormSuccess>
      )}
      {rows.length ? (
        <div className="grid gap-4">
          {rows.map((row) => {
            const item = listed.get(row.opportunitySlug);
            if (!item) return null;
            const { opportunity, organization } = item;
            const info = statusInfo(row.status);
            return (
              <article
                className="rounded-panel border border-line bg-paper p-5 sm:p-6"
                key={row.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-[-0.02em]">
                      <Link
                        className="hover:text-action"
                        href={`/oportunidades/${opportunity.slug}`}
                      >
                        {opportunity.title}
                      </Link>
                    </h2>
                    <p className="mt-0.5 font-meta text-[13px] tracking-[0.02em] text-muted">
                      {organization.name} ·{" "}
                      {row.mode === "native"
                        ? "Postulación en LinkUp"
                        : "Sitio oficial"}{" "}
                      · {formatShortDate(row.createdAt.toISOString().slice(0, 10))}
                    </p>
                  </div>
                  <Badge tone={info.tone}>{info.label}</Badge>
                </div>
                <ApplicationProgress
                  className="mt-6"
                  status={row.status}
                  mode={row.mode}
                />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                  <ApplicationStatusControl
                    applicationId={row.id}
                    mode={row.mode}
                    currentStatus={row.status}
                  />
                  <Link
                    className={`${textLinkClass} inline-flex items-center gap-1 text-sm`}
                    href={`/oportunidades/${opportunity.slug}`}
                  >
                    Ver oportunidad
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Todavía no registraste postulaciones."
          actions={
            <Link className={textLinkClass} href="/?abiertas=1">
              Buscar oportunidades abiertas
            </Link>
          }
        >
          Si postulas en el sitio oficial de una startup, puedes registrarlo
          aquí para no perderle el rastro.
        </EmptyState>
      )}
    </div>
  );
}
