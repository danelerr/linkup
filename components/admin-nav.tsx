"use client";

import { FileUp, Inbox, LayoutList } from "lucide-react";
import { SectionNav } from "@/components/account-nav";

export function AdminNav() {
  return (
    <SectionNav
      label="Operación"
      items={[
        { href: "/admin", label: "Cola de revisión", icon: Inbox, exact: true },
        { href: "/admin/catalogo", label: "Catálogo", icon: LayoutList },
        { href: "/admin/importar", label: "Importar", icon: FileUp },
      ]}
    />
  );
}
