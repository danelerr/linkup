import Link from "next/link";
import { ArrowRight, Plus, Search } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { Notice } from "@/components/detail";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { controlClass } from "@/components/ui/field";
import { EmptyState, PageHeader } from "@/components/ui/layout";
import { requireOperator } from "@/lib/permissions";
import { ensureCatalog } from "@/lib/catalog";
import { getSqlite } from "@/db";
import { normalizeText } from "@/lib/catalog-types";
import { cx } from "@/lib/cx";

export const metadata = {
  title: "Catálogo",
  robots: { index: false, follow: false },
};

const statusLabels: Record<string, { label: string; tone: BadgeTone }> = {
  published: { label: "Publicado", tone: "success" },
  closed: { label: "Cerrado", tone: "neutral" },
  draft: { label: "Borrador", tone: "warning" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireOperator("/admin/catalogo");
  ensureCatalog();
  const query = await searchParams;
  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number(query.pagina) || 1)),
  );
  const q = (query.q || "").slice(0, 120);
  const union =
    "SELECT slug, name AS title, status, updated_at, search_text, 'startup' AS kind FROM catalog_organizations UNION ALL SELECT slug, title, status, updated_at, search_text, 'opportunity' AS kind FROM catalog_opportunities";
  const filter = `%${normalizeText(q).replace(/[\\%_]/g, "\\$&")}%`;
  const rows = getSqlite()
    .prepare(
      `SELECT * FROM (${union}) WHERE search_text LIKE ? ESCAPE '\\' ORDER BY updated_at DESC LIMIT 41 OFFSET ?`,
    )
    .all(filter, (page - 1) * 40) as {
    slug: string;
    title: string;
    status: string;
    kind: string;
  }[];
  const review = query.envio ? `&envio=${encodeURIComponent(query.envio)}` : "";
  return (
    <WorkspaceShell nav={<AdminNav />}>
      <div className="grid gap-8">
        <PageHeader
          eyebrow="Operación"
          title="Catálogo"
          description="Las fichas se editan aquí, no en el código. Los cambios se publican sin reconstruir la app."
          actions={
            <>
              <Link
                className={buttonClass({ size: "sm" })}
                href="/admin/catalogo/editar?tipo=startup"
              >
                <Plus className="size-4" aria-hidden="true" />
                Startup
              </Link>
              <Link
                className={buttonClass({ variant: "secondary", size: "sm" })}
                href="/admin/catalogo/editar?tipo=opportunity"
              >
                <Plus className="size-4" aria-hidden="true" />
                Oportunidad
              </Link>
            </>
          }
        />
        {query.envio && (
          <Notice>
            Selecciona el registro al que corresponde la corrección. Al guardar
            sus cambios, se aprobará el envío.
          </Notice>
        )}
        <form className="flex gap-2" role="search">
          {query.envio && (
            <input type="hidden" name="envio" value={query.envio} />
          )}
          <label className="sr-only" htmlFor="catalog-search">
            Buscar en el catálogo
          </label>
          <input
            id="catalog-search"
            className={controlClass}
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Nombre, título o contenido"
          />
          <button
            className={buttonClass({ variant: "secondary", size: "icon" })}
            aria-label="Buscar"
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
        </form>
        {rows.length ? (
          <ul className="divide-y divide-line rounded-panel border border-line bg-paper">
            {rows.slice(0, 40).map((row) => {
              const status = statusLabels[row.status] ?? statusLabels.draft;
              return (
                <li key={`${row.kind}:${row.slug}`}>
                  <Link
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-surface sm:px-5"
                    href={`/admin/catalogo/editar?tipo=${row.kind}&slug=${row.slug}${review}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold group-hover:text-action">
                        {row.title}
                      </span>
                      <span className="font-meta text-[13px] text-muted">
                        {row.kind === "startup" ? "Startup" : "Oportunidad"} ·{" "}
                        {row.slug}
                      </span>
                    </span>
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <ArrowRight
                      className="size-4 shrink-0 text-action"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title={`No hay registros${q ? " para esta búsqueda" : " todavía"}.`}
          />
        )}
        {(page > 1 || rows.length > 40) && (
          <nav
            className="flex items-center justify-between gap-4"
            aria-label="Páginas del catálogo"
          >
            <Link
              className={cx(
                buttonClass({ variant: "secondary", size: "sm" }),
                page === 1 && "invisible",
              )}
              href={`?q=${encodeURIComponent(q)}&pagina=${page - 1}${review}`}
            >
              Anterior
            </Link>
            <span className="font-meta text-[13px] text-muted">
              Página {page}
            </span>
            <Link
              className={cx(
                buttonClass({ variant: "secondary", size: "sm" }),
                rows.length <= 40 && "invisible",
              )}
              href={`?q=${encodeURIComponent(q)}&pagina=${page + 1}${review}`}
            >
              Siguiente
            </Link>
          </nav>
        )}
      </div>
    </WorkspaceShell>
  );
}
