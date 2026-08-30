import type { Metadata } from "next";
import { ShieldCheck, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import { organizationBySlug } from "@/lib/catalog";
import { requireOrganizationOwner } from "@/lib/permissions";
import { listOrganizationMembers } from "@/lib/user-data";

export const metadata: Metadata = { title: "Equipo", robots: { index: false, follow: false } };

export default async function OrganizationTeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  await requireOrganizationOwner(`/organizacion/${slug}/equipo`, slug);
  const members = await listOrganizationMembers(slug);
  return (
    <div className="organization-page">
      <header className="organization-page-heading"><h2>Equipo</h2><p>El acceso a candidatos está separado del permiso para editar contenido.</p></header>
      {members.length ? <div className="team-list">{members.map((member) => (
        <div key={member.userId}><span className="candidate-avatar"><UsersRound size={16} aria-hidden="true" /></span><span><strong>{member.displayName}</strong><small>{member.email}</small></span><span className="member-role"><ShieldCheck size={14} aria-hidden="true" /> {member.memberRole}</span></div>
      ))}</div> : <div className="account-empty"><p>No hay miembros activos.</p></div>}
    </div>
  );
}
