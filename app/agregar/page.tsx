import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/detail";
import { SiteShell } from "@/components/site-shell";
import { SubmissionForm } from "@/components/submission-form";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/layout";
import { organizationBySlug } from "@/lib/catalog";
import { getCurrentUser, signInPath } from "@/lib/session";

export const metadata: Metadata = {
  title: "Agregar información",
  description:
    "Propón una startup, oportunidad o corrección para revisión de LinkUp.",
  alternates: { canonical: "/agregar" },
};

const kinds = {
  oportunidad: "opportunity",
  reclamo: "claim",
  correccion: "correction",
} as const;

export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; startup?: string }>;
}) {
  const params = await searchParams;
  const initialKind =
    kinds[params.tipo as keyof typeof kinds] ?? ("startup" as const);
  const organization = params.startup
    ? await organizationBySlug(params.startup)
    : null;
  const user = await getCurrentUser();
  const returnTo = `/agregar?${new URLSearchParams(
    Object.entries(params).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  )}`;
  return (
    <SiteShell>
      <div className="mx-auto max-w-[720px] pt-4 pb-24 sm:pt-8">
        <BackLink href="/">Volver a explorar</BackLink>
        <PageHeader
          className="mt-4"
          title="Agregar información"
          description={
            <>
              Propón una startup, una vacante o una corrección. Revisamos la
              fuente antes de publicar.{" "}
              <Link className={textLinkClass} href="/">
                Busca primero en el directorio
              </Link>{" "}
              para no duplicar.
            </>
          }
        />
        {user ? (
          <SubmissionForm
            accountEmail={user.email}
            initialKind={initialKind}
            initialOrganization={organization?.name ?? ""}
          />
        ) : (
          <EmptyState
            className="mt-10"
            title="Necesitas una cuenta para proponer información"
            actions={
              <Link className={buttonClass()} href={signInPath(returnTo, true)}>
                Ingresar o crear cuenta
              </Link>
            }
          >
            Así podemos escribirte si algo de tu propuesta no se entiende.
          </EmptyState>
        )}
      </div>
    </SiteShell>
  );
}
