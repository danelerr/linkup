import { z } from "zod";
import { apiOperator } from "@/lib/api-operator";
import { getOrganizations } from "@/lib/catalog";
import { CatalogError, saveCatalogEntry } from "@/lib/catalog-editor";
import {
  mapOpportunityRow,
  mapStartupRow,
  templateCsv,
} from "@/lib/catalog-import";
import { normalizeText } from "@/lib/catalog-types";
import { todayIso } from "@/lib/dates";

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
  const today = todayIso();
  const startups = new Map<string, string>();
  for (const organization of getOrganizations(true)) {
    startups.set(organization.slug, organization.slug);
    startups.set(normalizeText(organization.name), organization.slug);
  }
  const findStartup = (value: string) =>
    startups.get(value.trim()) ?? startups.get(normalizeText(value));
  const results: {
    row: number;
    status: "created" | "duplicate" | "error";
    message: string;
    slug?: string;
  }[] = [];
  for (const [index, row] of body.data.rows.entries()) {
    // Spreadsheets number the header as row 1.
    const rowNumber = index + 2;
    const mapped =
      body.data.kind === "startup"
        ? mapStartupRow(row, today)
        : mapOpportunityRow(row, today, findStartup);
    if (!mapped.ok) {
      results.push({
        row: rowNumber,
        status: "error",
        message: mapped.errors.join(" · "),
      });
      continue;
    }
    try {
      const saved = saveCatalogEntry(access.user.userId, {
        kind: body.data.kind,
        data: mapped.data,
        reason: "Importación de fichas completas",
      });
      results.push({
        row: rowNumber,
        status: "created",
        message: "Borrador creado.",
        slug: saved.slug,
      });
    } catch (error) {
      if (!(error instanceof CatalogError)) throw error;
      results.push({
        row: rowNumber,
        status: error.status === 409 ? "duplicate" : "error",
        message: error.message,
      });
    }
  }
  return Response.json({ results });
}
