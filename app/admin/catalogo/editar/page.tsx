import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { CatalogEditor } from "@/components/catalog-editor";
import { BackLink, Notice } from "@/components/detail";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PageHeader } from "@/components/ui/layout";
import { requireOperator } from "@/lib/permissions";
import {
  getOrganizations,
  organizationBySlug,
  opportunityBySlug,
} from "@/lib/catalog";
import { getSubmissionById } from "@/lib/user-data";

export const metadata = {
  title: "Editar catálogo",
  robots: { index: false, follow: false },
};
export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireOperator("/admin/catalogo");
  const query = await searchParams;
  const kind = query.tipo === "opportunity" ? "opportunity" : "startup";
  const existing = query.slug
    ? kind === "startup"
      ? organizationBySlug(query.slug, true)
      : opportunityBySlug(query.slug, true)
    : undefined;
  if (query.slug && !existing) notFound();
  const submission = query.envio
    ? await getSubmissionById(query.envio)
    : undefined;
  if (query.envio && (!submission || submission.status !== "pending"))
    notFound();
  const today = new Date().toISOString().slice(0, 10);
  const initial = existing
    ? { ...existing }
    : {
        slug: "",
        status: "draft",
        sourceLabel: "Fuente oficial",
        sourceUrl: submission?.sourceUrl || "",
        verifiedAt: today,
        isDemo: false,
        ...(kind === "startup"
          ? {
              name: submission?.organizationName || "",
              monogram:
                submission?.organizationName.slice(0, 2).toUpperCase() || "",
              shortDescription: "",
              description: "",
              industry: "",
              stage: "",
              teamSize: "",
              foundedYear: 0,
              city: "",
              remotePolicy: "",
              websiteUrl: submission?.websiteUrl || "",
              logoUrl: "",
            }
          : {
              title: submission?.opportunityTitle || "",
              organizationSlug:
                getOrganizations(true).find(
                  (item) =>
                    item.name.toLocaleLowerCase() ===
                    submission?.organizationName.toLocaleLowerCase(),
                )?.slug || "",
              summary: "",
              description: "",
              type: "Empleo",
              area: "",
              level: "",
              modality: "Remoto",
              location: "",
              countriesAccepted: "",
              dedication: "",
              compensation: "Por confirmar",
              compensationType: "Por definir",
              closesAt: "",
              applicationMode: "external",
              applicationUrl: submission?.sourceUrl || "",
              responsibilities: [],
              requirements: [],
              desirable: [],
            }),
      };
  return (
    <WorkspaceShell nav={<AdminNav />}>
      <div className="grid gap-8">
        <BackLink href="/admin/catalogo">Catálogo</BackLink>
        <PageHeader
          className="-mt-4"
          eyebrow="Operación"
          title={`${existing ? "Editar" : "Agregar"} ${kind === "startup" ? "startup" : "oportunidad"}`}
          description="Información clara, con una fuente y un estado explícitos."
        />
        {submission?.notes && (
          <Notice title="Contexto del envío">{submission.notes}</Notice>
        )}
        <CatalogEditor
          key={`${kind}:${query.slug || "new"}`}
          kind={kind}
          initial={initial}
          existingSlug={query.slug}
          submissionId={submission?.id}
          organizations={getOrganizations(true).map(({ slug, name }) => ({
            slug,
            name,
          }))}
        />
      </div>
    </WorkspaceShell>
  );
}
