import { AdminNav } from "@/components/admin-nav";
import { CatalogImport } from "@/components/catalog-import";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PageHeader } from "@/components/ui/layout";
import { requireOperator } from "@/lib/permissions";

export const metadata = {
  title: "Importar catálogo",
  robots: { index: false, follow: false },
};

export default async function ImportPage() {
  await requireOperator("/admin/importar");
  return (
    <WorkspaceShell nav={<AdminNav />}>
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Operación"
          title="Importar información"
          description="Desde una hoja de cálculo o un archivo estructurado. Todo pasa por la cola de revisión antes de publicarse."
        />
        <CatalogImport />
      </div>
    </WorkspaceShell>
  );
}
