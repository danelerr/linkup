import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState, sectionTitleClass } from "@/components/ui/layout";
import { memberRoleLabels } from "@/lib/application-status";
import { organizationBySlug } from "@/lib/catalog";
import { requireOrganizationOwner } from "@/lib/permissions";
import { listOrganizationMembers } from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Equipo",
  robots: { index: false, follow: false },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}` : name.slice(0, 2)
  ).toUpperCase();
}

export default async function OrganizationTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  await requireOrganizationOwner(`/organizacion/${slug}/equipo`, slug);
  const members = await listOrganizationMembers(slug);
  return (
    <div className="grid gap-6">
      <div>
        <h2 className={sectionTitleClass}>Equipo</h2>
        <p className="mt-1 text-[15px] leading-6 text-body">
          El acceso a candidatos está separado del permiso para editar
          contenido.
        </p>
      </div>
      {members.length ? (
        <ul className="divide-y divide-line rounded-panel border border-line bg-paper">
          {members.map((member) => (
            <li
              className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:px-5"
              key={member.userId}
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface font-meta text-xs font-semibold text-action"
                aria-hidden="true"
              >
                {initials(member.displayName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">
                  {member.displayName}
                </span>
                <span className="block truncate text-[13px] text-muted">
                  {member.email}
                </span>
              </span>
              <Badge tone={member.memberRole === "owner" ? "info" : "neutral"}>
                {memberRoleLabels[member.memberRole] ?? member.memberRole}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No hay miembros activos." />
      )}
    </div>
  );
}
