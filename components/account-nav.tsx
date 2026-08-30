"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Bookmark, BriefcaseBusiness, Compass, UserRound } from "lucide-react";

const items = [
  { href: "/mi-linkup", label: "Resumen", icon: Compass, exact: true },
  { href: "/mi-linkup/guardados", label: "Guardados", icon: Bookmark },
  { href: "/mi-linkup/postulaciones", label: "Postulaciones", icon: BriefcaseBusiness },
  { href: "/mi-linkup/alertas", label: "Alertas", icon: Bell },
  { href: "/mi-linkup/perfil", label: "Perfil", icon: UserRound },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="account-nav" aria-label="Mi LinkUp">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link href={item.href} key={item.href} aria-current={active ? "page" : undefined}>
            <Icon size={17} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
