import { AdminNav } from "@/components/admin-nav";
import { CatalogImport } from "@/components/catalog-import";
import { CatalogRecordsImport } from "@/components/catalog-records-import";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PageHeader, sectionTitleClass } from "@/components/ui/layout";
import { requireOperator } from "@/lib/permissions";

export const metadata = {
  title: "Importar catálogo",
  robots: { index: false, follow: false },
};

export default async function ImportPage() {
  const { role } = await requireOperator("/admin/importar");
  return (
    <WorkspaceShell nav={<AdminNav canManagePeople={role === "admin"} />}>
      <div className="grid gap-12">
        <PageHeader
          eyebrow="Operación"
          title="Importar información"
          description="Carga el catálogo desde una hoja de cálculo. Nada se publica solo: todo queda para revisar."
        />
        <section className="grid gap-5">
          <div>
            <h2 className={sectionTitleClass}>Fichas completas</h2>
            <p className="mt-1 text-[15px] leading-6 text-body">
              Para cargar startups y vacantes con todos sus datos de una vez. Se
              crean como borradores.
            </p>
          </div>
          <CatalogRecordsImport />
        </section>
        <section className="grid gap-5 border-t border-line pt-10">
          <div>
            <h2 className={sectionTitleClass}>Lista de propuestas</h2>
            <p className="mt-1 text-[15px] leading-6 text-body">
              Para una lista corta de nombres y enlaces por revisar. Cada fila
              llega a la cola de revisión y se completa en el editor.
            </p>
          </div>
          <CatalogImport />
        </section>
      </div>
    </WorkspaceShell>
  );
}
