import type { Metadata } from "next";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import Link from "next/link";
import { ApplicationStatusControl } from "@/components/application-status-control";
import { formatShortDate, opportunityBySlug, organizationForOpportunity } from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import { listApplications } from "@/lib/user-data";

export const metadata: Metadata = { title: "Postulaciones", robots: { index: false, follow: false } };

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ enviada?: string }> }) {
  const user = await requireSyncedUser("/mi-linkup/postulaciones");
  const params = await searchParams;
  const rows = await listApplications(user.userId);
  return (
    <div className="account-page">
      <header className="account-heading">
        <p className="eyebrow">Mi LinkUp</p>
        <h1>Postulaciones</h1>
        <p>Un solo lugar para recordar qué pasó y cuál es el siguiente paso.</p>
      </header>
      {params.enviada === "1" && <div className="success-banner">Postulación enviada. Guardamos una copia de lo que compartiste.</div>}
      {rows.length ? (
        <div className="application-list">
          {rows.map((row) => {
            const opportunity = opportunityBySlug(row.opportunitySlug);
            if (!opportunity) return null;
            const organization = organizationForOpportunity(opportunity);
            return (
              <article className="application-item" key={row.id}>
                <div className="application-main">
                  <div className="application-topline">
                    <span className={`application-status status-${row.status}`}>{row.status.replace("_", " ")}</span>
                    <span>{row.mode === "native" ? "Dentro de LinkUp" : "Sitio externo"}</span>
                  </div>
                  <h2>{opportunity.title}</h2>
                  <p>{organization?.name} · Enviada el {formatShortDate(row.createdAt.slice(0, 10))}</p>
                  <Link href={`/oportunidades/${opportunity.slug}`}>Ver oportunidad <ArrowUpRight size={15} aria-hidden="true" /></Link>
                </div>
                <ApplicationStatusControl applicationId={row.id} mode={row.mode} currentStatus={row.status} />
              </article>
            );
          })}
        </div>
      ) : (
        <div className="account-empty account-empty-large">
          <BriefcaseBusiness size={22} aria-hidden="true" />
          <p>Todavía no registraste postulaciones.</p>
          <Link className="button-secondary" href="/oportunidades">Buscar oportunidades</Link>
        </div>
      )}
    </div>
  );
}
