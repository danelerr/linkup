import type { Metadata } from "next";
import { ArrowRight, BriefcaseBusiness, CircleCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { opportunitiesForOrganization, organizationBySlug } from "@/lib/catalog";
import { requireOrganizationMember } from "@/lib/permissions";
import { countOrganizationApplications, countOrganizationMembers, hasOrganizationCandidateAccess } from "@/lib/user-data";

export const metadata: Metadata = { title: "Panel de organización", robots: { index: false, follow: false } };

export default async function OrganizationPanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  const user = await requireOrganizationMember(`/organizacion/${slug}/panel`, slug);
  const opportunityRows = opportunitiesForOrganization(slug);
  const opportunitySlugs = opportunityRows.map((item) => item.slug);
  const [candidateCount, memberCount, canViewCandidates] = await Promise.all([
    countOrganizationApplications(opportunitySlugs),
    countOrganizationMembers(slug),
    hasOrganizationCandidateAccess(user.userId, slug),
  ]);
  return (
    <div className="organization-page">
      <header className="organization-page-heading"><h2>Resumen</h2><p>Actividad operativa de esta vista piloto.</p></header>
      <div className="organization-stats">
        <Link href={`/organizacion/${slug}/panel`}><BriefcaseBusiness size={18} aria-hidden="true" /><strong>{opportunityRows.length}</strong><span>oportunidades</span></Link>
        {canViewCandidates ? <Link href={`/organizacion/${slug}/candidatos`}><UsersRound size={18} aria-hidden="true" /><strong>{candidateCount}</strong><span>postulaciones</span></Link> : <span><UsersRound size={18} aria-hidden="true" /><strong>{candidateCount}</strong><small>postulaciones</small></span>}
        <span><CircleCheck size={18} aria-hidden="true" /><strong>{memberCount}</strong><small>miembros</small></span>
      </div>
      <section className="organization-section">
        <div className="section-heading-row"><h2>Oportunidades</h2><Link href={`/agregar?tipo=oportunidad&startup=${slug}`}>Proponer otra</Link></div>
        <div className="organization-opportunities">
          {opportunityRows.map((opportunity) => (
            <Link href={`/oportunidades/${opportunity.slug}`} key={opportunity.id}>
              <span><strong>{opportunity.title}</strong><small>{opportunity.type} · {opportunity.applicationMode === "native" ? "Postulación en LinkUp" : "Fuente externa"}</small></span>
              <span>{opportunity.applicationMode === "native" ? "Activa" : "—"}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
