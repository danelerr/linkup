import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizationNav } from "@/components/organization-nav";
import { WorkspaceShell } from "@/components/workspace-shell";
import { eyebrowClass } from "@/components/ui/layout";
import { StartupLogo } from "@/components/ui/startup-logo";
import { organizationBySlug } from "@/lib/catalog";
import { requireOrganizationMember } from "@/lib/permissions";
import {
  hasOrganizationCandidateAccess,
  hasOrganizationOwnerAccess,
} from "@/lib/user-data";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = await organizationBySlug(slug);
  if (!organization) notFound();
  const user = await requireOrganizationMember(
    `/organizacion/${slug}/panel`,
    slug,
  );
  const [canViewCandidates, canManageTeam] = await Promise.all([
    hasOrganizationCandidateAccess(user.userId, slug),
    hasOrganizationOwnerAccess(user.userId, slug),
  ]);
  return (
    <WorkspaceShell
      heading={
        <header className="mb-8 flex flex-wrap items-center gap-4 border-b border-line pb-6 sm:mb-10">
          <StartupLogo
            monogram={organization.monogram}
            logoUrl={organization.logoUrl}
            size={56}
          />
          <div className="min-w-0 flex-1">
            <p className={eyebrowClass}>Panel de organización</p>
            <h1 className="truncate text-2xl font-semibold tracking-[-0.03em] sm:text-[1.75rem]">
              {organization.name}
            </h1>
          </div>
          <Link
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-action hover:underline"
            href={`/startups/${organization.slug}`}
          >
            Ver perfil público
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </header>
      }
      nav={
        <OrganizationNav
          slug={slug}
          canViewCandidates={canViewCandidates}
          canManageTeam={canManageTeam}
        />
      }
    >
      {children}
    </WorkspaceShell>
  );
}
