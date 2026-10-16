import { z } from "zod";
import { apiOperator } from "@/lib/api-operator";
import { importCatalogRows, templateCsv } from "@/lib/catalog-import";

/** Downloads a template: ?plantilla=startups or ?plantilla=vacantes. */
export async function GET(request: Request) {
  const access = await apiOperator();
  if (access.error) return access.error;
  const kind =
    new URL(request.url).searchParams.get("plantilla") === "vacantes"
      ? "opportunity"
      : "startup";
  return new Response(templateCsv(kind), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename=linkup-${kind === "startup" ? "startups" : "vacantes"}.csv`,
      "cache-control": "private, no-store",
    },
  });
}

const bodySchema = z.object({
  kind: z.enum(["startup", "opportunity"]),
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(100),
});

/** Creates complete catalog records as drafts, reporting each row. */
export async function POST(request: Request) {
  const access = await apiOperator();
  if (access.error) return access.error;
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success)
    return Response.json(
      { error: "Importa entre 1 y 100 filas por archivo." },
      { status: 400 },
    );
  return Response.json({
    results: await importCatalogRows(
      access.user.userId,
      body.data.kind,
      body.data.rows,
    ),
  });
}
