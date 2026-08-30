import type { Metadata } from "next";
import { ArrowRight, Bell, Bookmark, BriefcaseBusiness, CircleCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { opportunityBySlug, organizationForOpportunity } from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import {
  getProfile,
  listApplications,
  getUserRole,
  listOrganizationMemberships,
  listSavedOpportunitySlugs,
  listSavedSearches,
  profileReadiness,
} from "@/lib/user-data";

export const metadata: Metadata = { title: "Mi LinkUp", robots: { index: false, follow: false } };

export default async function MyLinkUpPage() {
  const user = await requireSyncedUser("/mi-linkup");
  const [profile, savedSlugs, applicationRows, alerts, memberships, role] = await Promise.all([
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
  const recentOpportunity = recentApplication ? opportunityBySlug(recentApplication.opportunitySlug) : null;
  const recentOrganization = recentOpportunity ? organizationForOpportunity(recentOpportunity) : null;

  return (
    <div className="account-page">
      <header className="account-heading">
        <p className="eyebrow">Mi LinkUp</p>
        <h1>Hola, {firstName}.</h1>
        <p>Aquí están tus próximos pasos, sin llenar tu perfil por llenar.</p>
      </header>

      {!readiness.readyToApply ? (
        <section className="next-step-panel">
          <div className="next-step-icon"><UserRound size={20} aria-hidden="true" /></div>
          <div>
            <span>Siguiente paso</span>
            <h2>Deja listo tu perfil para postular.</h2>
            <p>Completaste {readiness.complete} de {readiness.total} señales esenciales. Solo compartiremos una copia cuando tú confirmes una postulación.</p>
          </div>
          <Link href="/mi-linkup/perfil">Continuar <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      ) : (
        <section className="next-step-panel is-ready">
          <div className="next-step-icon"><CircleCheck size={20} aria-hidden="true" /></div>
          <div>
            <span>Perfil listo</span>
            <h2>Ya puedes postular dentro de LinkUp.</h2>
            <p>Revisarás exactamente qué información se comparte antes de cada envío.</p>
          </div>
          <Link href="/oportunidades?modalidad=Remoto">Explorar <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      )}

      <section className="account-summary" aria-label="Resumen de actividad">
        <Link href="/mi-linkup/guardados">
          <Bookmark size={18} aria-hidden="true" />
          <span><strong>{savedSlugs.length}</strong> guardadas</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link href="/mi-linkup/postulaciones">
          <BriefcaseBusiness size={18} aria-hidden="true" />
          <span><strong>{applicationRows.length}</strong> postulaciones</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link href="/mi-linkup/alertas">
          <Bell size={18} aria-hidden="true" />
          <span><strong>{alerts.length}</strong> alertas</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className="account-section">
        <div className="section-heading-row">
          <h2>Actividad reciente</h2>
          {recentApplication && <Link href="/mi-linkup/postulaciones">Ver todas</Link>}
        </div>
        {recentApplication && recentOpportunity ? (
          <Link className="activity-row" href={`/oportunidades/${recentOpportunity.slug}`}>
            <span className="activity-mark" aria-hidden="true" />
            <span>
              <strong>{recentOpportunity.title}</strong>
              <small>{recentOrganization?.name} · Estado: {recentApplication.status.replace("_", " ")}</small>
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ) : (
          <div className="account-empty">
            <p>Todavía no registraste postulaciones.</p>
            <Link href="/oportunidades">Buscar oportunidades</Link>
          </div>
        )}
      </section>

      {(memberships.length > 0 || role === "admin" || role === "curator") && (
        <section className="account-section">
          <div className="section-heading-row"><h2>Tus espacios</h2></div>
          <div className="workspace-list">
            {memberships.map((membership) => (
              <Link href={`/organizacion/${membership.organizationSlug}/panel`} key={membership.organizationSlug}>
                <span>{membership.organizationSlug.replaceAll("-", " ")}</span>
                <small>{membership.memberRole}</small>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))}
            {(role === "admin" || role === "curator") && (
              <Link href="/admin"><span>Operación LinkUp</span><small>{role}</small><ArrowRight size={16} aria-hidden="true" /></Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
