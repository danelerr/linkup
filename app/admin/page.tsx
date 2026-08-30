import type { Metadata } from "next";
import { ExternalLink, Inbox, ShieldCheck } from "lucide-react";
import { AdminSubmissionActions } from "@/components/admin-submission-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatShortDate, organizations } from "@/lib/catalog";
import { requireOperator } from "@/lib/permissions";
import { getPilotMetrics, listPendingSubmissions } from "@/lib/user-data";
import { isSafeHttpUrl } from "@/lib/validation";

export const metadata: Metadata = { title: "Operación", robots: { index: false, follow: false } };

const kindLabel: Record<string, string> = {
  startup: "Nueva startup",
  opportunity: "Nueva oportunidad",
  claim: "Reclamación",
  correction: "Corrección",
};

export default async function AdminPage() {
  const { user, role } = await requireOperator("/admin");
  const [rows, metrics] = await Promise.all([listPendingSubmissions(user.userId), getPilotMetrics()]);
  const pendingRows = rows.filter((row) => row.status === "pending");
  const options = organizations.map(({ slug, name }) => ({ slug, name }));
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="admin-main">
        <header className="admin-heading">
          <div><p className="eyebrow">Operación · {role}</p><h1>Cola de revisión</h1><p>Todo cambio queda asociado a una persona y un motivo.</p></div>
          <span><ShieldCheck size={17} aria-hidden="true" /> Acceso registrado</span>
        </header>
        <div className="admin-summary"><strong>{pendingRows.length}</strong><span>envíos pendientes</span><small>{rows.length} recibidos en total</small></div>
        <div className="pilot-metrics" aria-label="Señales del piloto">
          <span><strong>{metrics.users}</strong> cuentas</span>
          <span><strong>{metrics.saves}</strong> guardados</span>
          <span><strong>{metrics.applications}</strong> postulaciones</span>
          <span><strong>{metrics.progressed}</strong> avances reportados</span>
        </div>
        {pendingRows.length ? (
          <div className="moderation-list">
            {pendingRows.map((row) => {
              const suggested = organizations.find((organization) => organization.name.toLocaleLowerCase() === row.organizationName.toLocaleLowerCase());
              const safeWebsite = row.websiteUrl && isSafeHttpUrl(row.websiteUrl) ? row.websiteUrl : null;
              const safeSource = isSafeHttpUrl(row.sourceUrl) ? row.sourceUrl : null;
              return (
                <article className="moderation-item" key={row.id}>
                  <header>
                    <span className="account-list-icon"><Inbox size={17} aria-hidden="true" /></span>
                    <div><span>{kindLabel[row.kind] ?? row.kind}</span><h2>{row.opportunityTitle || row.organizationName}</h2><p>{row.opportunityTitle ? row.organizationName : row.contactEmail}</p></div>
                    <time>{formatShortDate(row.createdAt.slice(0, 10))}</time>
                  </header>
                  <dl>
                    <div><dt>Contacto</dt><dd>{row.contactEmail}</dd></div>
                    {safeWebsite && <div><dt>Sitio</dt><dd><a href={safeWebsite} target="_blank" rel="noreferrer">{safeWebsite} <ExternalLink size={13} aria-hidden="true" /></a></dd></div>}
                    <div><dt>Fuente</dt><dd>{safeSource ? <a href={safeSource} target="_blank" rel="noreferrer">{safeSource} <ExternalLink size={13} aria-hidden="true" /></a> : "URL inválida; no abrir"}</dd></div>
                    {row.notes && <div><dt>Contexto</dt><dd>{row.notes}</dd></div>}
                  </dl>
                  <AdminSubmissionActions id={row.id} kind={row.kind} suggestedSlug={suggested?.slug} organizations={options} />
                </article>
              );
            })}
          </div>
        ) : <div className="account-empty account-empty-large"><Inbox size={22} aria-hidden="true" /><p>No hay envíos pendientes.</p></div>}
      </main>
      <SiteFooter />
    </div>
  );
}
