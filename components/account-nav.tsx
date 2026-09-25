"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Compass,
  UserRound,
} from "lucide-react";
import { cx } from "@/lib/cx";

const items = [
  { href: "/mi-linkup", label: "Resumen", icon: Compass, exact: true },
  { href: "/mi-linkup/guardados", label: "Guardados", icon: Bookmark },
  {
    href: "/mi-linkup/postulaciones",
    label: "Postulaciones",
    icon: BriefcaseBusiness,
  },
  { href: "/mi-linkup/alertas", label: "Alertas", icon: Bell },
  { href: "/mi-linkup/perfil", label: "Perfil", icon: UserRound },
];

/** Tabs that scroll sideways on phones and stack as a sidebar on desktop. */
export function SectionNav({
  label,
  items,
  children,
}: {
  label: string;
  items: {
    href: string;
    label: string;
    icon: typeof Compass;
    exact?: boolean;
  }[];
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const current = useRef<HTMLAnchorElement>(null);
  // On phones the tabs scroll sideways; keep the current one in view.
  useEffect(() => {
    current.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);
  return (
    <nav
      className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:items-stretch lg:gap-0.5 lg:overflow-visible lg:p-0"
      aria-label={label}
    >
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            href={item.href}
            key={item.href}
            aria-current={active ? "page" : undefined}
            ref={active ? current : undefined}
            className={cx(
              "inline-flex min-h-10 shrink-0 items-center gap-2.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors lg:rounded-control",
              active
                ? "bg-ink text-white lg:bg-surface lg:text-ink"
                : "text-muted hover:bg-surface hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
      {children}
    </nav>
  );
}

export function AccountNav({ children }: { children?: ReactNode }) {
  return (
    <SectionNav label="Mi LinkUp" items={items}>
      {children}
    </SectionNav>
  );
}
