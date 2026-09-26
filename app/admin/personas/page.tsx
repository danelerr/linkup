import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { PeopleManager } from "@/components/people-manager";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PageHeader } from "@/components/ui/layout";
import { requireOperator } from "@/lib/permissions";
import { listOperators } from "@/lib/user-data";

export const metadata = {
  title: "Personas",
  robots: { index: false, follow: false },
};

export default async function PeoplePage() {
  const { user, role } = await requireOperator("/admin/personas");
  if (role !== "admin") notFound();
  const operators = await listOperators();
  return (
    <WorkspaceShell nav={<AdminNav canManagePeople />}>
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Operación"
          title="Personas"
          description="Quién puede revisar envíos y editar el catálogo. Los equipos de cada startup se gestionan desde su propio panel."
        />
        <PeopleManager operators={operators} currentUserId={user.userId} />
      </div>
    </WorkspaceShell>
  );
}
