import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamManager } from "@/components/team-manager";
import { sectionTitleClass } from "@/components/ui/layout";
import { organizationBySlug } from "@/lib/catalog";
import { requireOrganizationOwner } from "@/lib/permissions";
import { listOrganizationMembers } from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Equipo",
  robots: { index: false, follow: false },
};

export default async function OrganizationTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = await organizationBySlug(slug);
  if (!organization) notFound();
  const user = await requireOrganizationOwner(
    `/organizacion/${slug}/equipo`,
    slug,
  );
  const members = (await listOrganizationMembers(slug)).filter(
    (member) => member.status === "active",
  );
  return (
    <div className="grid gap-6">
      <div>
        <h2 className={sectionTitleClass}>Equipo</h2>
        <p className="mt-1 text-[15px] leading-6 text-body">
          Quién puede ver candidatos de {organization.name} y gestionar este
          espacio. El acceso a candidatos está separado del permiso para editar
          contenido.
        </p>
      </div>
      <TeamManager
        organizationSlug={slug}
        members={members}
        currentUserId={user.userId}
      />
    </div>
  );
}
