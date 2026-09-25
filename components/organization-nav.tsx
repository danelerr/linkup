"use client";

import { BriefcaseBusiness, LayoutDashboard, UsersRound } from "lucide-react";
import { SectionNav } from "@/components/account-nav";

export function OrganizationNav({
  slug,
  canViewCandidates,
  canManageTeam,
}: {
  slug: string;
  canViewCandidates: boolean;
  canManageTeam: boolean;
}) {
  const base = `/organizacion/${slug}`;
  return (
    <SectionNav
      label="Panel de organización"
      items={[
        { href: `${base}/panel`, label: "Resumen", icon: LayoutDashboard },
        ...(canViewCandidates
          ? [
              {
                href: `${base}/candidatos`,
                label: "Candidatos",
                icon: BriefcaseBusiness,
              },
            ]
          : []),
        ...(canManageTeam
          ? [{ href: `${base}/equipo`, label: "Equipo", icon: UsersRound }]
          : []),
      ]}
    />
  );
}
