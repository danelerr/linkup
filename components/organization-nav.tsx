"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, LayoutDashboard, UsersRound } from "lucide-react";

export function OrganizationNav({ slug, canViewCandidates, canManageTeam }: { slug: string; canViewCandidates: boolean; canManageTeam: boolean }) {
  const pathname = usePathname();
  const base = `/organizacion/${slug}`;
  const items = [
    { href: `${base}/panel`, label: "Panel", icon: LayoutDashboard },
    ...(canViewCandidates ? [{ href: `${base}/candidatos`, label: "Candidatos", icon: BriefcaseBusiness }] : []),
    ...(canManageTeam ? [{ href: `${base}/equipo`, label: "Equipo", icon: UsersRound }] : []),
  ];
  return (
    <nav className="organization-nav" aria-label="Panel de organización">
      {items.map(({ href, label, icon: Icon }) => (
        <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>
          <Icon size={16} aria-hidden="true" /> {label}
        </Link>
      ))}
    </nav>
  );
}
