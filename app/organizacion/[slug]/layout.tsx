import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { OrganizationNav } from "@/components/organization-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { organizationBySlug } from "@/lib/catalog";
import { requireOrganizationMember } from "@/lib/permissions";
import { hasOrganizationCandidateAccess, hasOrganizationOwnerAccess } from "@/lib/user-data";

export default async function OrganizationLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  const user = await requireOrganizationMember(`/organizacion/${slug}/panel`, slug);
  const [canViewCandidates, canManageTeam] = await Promise.all([
    hasOrganizationCandidateAccess(user.userId, slug),
    hasOrganizationOwnerAccess(user.userId, slug),
  ]);
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="organization-main">
        <header className="organization-shell-heading">
          <div className="entity-logo" aria-hidden="true">{organization.monogram}</div>
          <div><p className="eyebrow">Panel de organización</p><h1>{organization.name}</h1></div>
          <a href={`/startups/${organization.slug}`}>Ver perfil público</a>
        </header>
        <OrganizationNav slug={slug} canViewCandidates={canViewCandidates} canManageTeam={canManageTeam} />
        <div className="organization-content">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
