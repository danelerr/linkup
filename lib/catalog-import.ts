import type { z } from "zod";
import {
  describeIssues,
  opportunitySchema,
  organizationSchema,
} from "@/lib/catalog-editor";
import {
  modalities,
  normalizeText,
  opportunityTypes,
} from "@/lib/catalog-types";
import {
  normalizeHeader,
  opportunityColumns,
  slugify,
  startupColumns,
  type ImportRow,
  type MappedRow,
} from "@/lib/catalog-import-columns";

export {
  detectKind,
  normalizeHeader,
  templateCsv,
} from "@/lib/catalog-import-columns";

type Column = (typeof startupColumns)[number];

function monogramFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1 ? words.map((word) => word[0]).join("") : name.trim();
  return letters.slice(0, words.length > 1 ? 3 : 2).toUpperCase();
}

/** Accepts 2026-09-25 and the spreadsheet-typical 25/09/2026. */
function isoDate(value: string, fallback: string) {
  const text = value.trim();
  if (!text) return fallback;
  const local = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (local)
    return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
  return text;
}

/** Matches "pasantia", "HÍBRIDO" and similar to the canonical value. */
function canonical(value: string, allowed: readonly string[]) {
  const wanted = normalizeText(value);
  return allowed.find((item) => normalizeText(item) === wanted) ?? value.trim();
}

function list(value: string) {
  return value
    .split(/\r?\n|\s*\|\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cells(row: ImportRow, columns: Column[]) {
  const byHeader = new Map(
    Object.entries(row).map(([header, value]) => [
      normalizeHeader(header),
      value === null || value === undefined ? "" : String(value).trim(),
    ]),
  );
  return Object.fromEntries(
    columns.map((column) => [column.key, byHeader.get(column.header) ?? ""]),
  );
}

function headerOf(columns: Column[]) {
  const byKey = new Map(columns.map((column) => [column.key, column.header]));
  return (key: string) => byKey.get(key) ?? key;
}

function result<T>(
  parsed: z.ZodSafeParseResult<T>,
  columns: Column[],
): MappedRow {
  return parsed.success
    ? { ok: true, data: parsed.data as Record<string, unknown> }
    : {
        ok: false,
        errors: describeIssues(parsed.error.issues, headerOf(columns)),
      };
}

export function mapStartupRow(row: ImportRow, today: string): MappedRow {
  const cell = cells(row, startupColumns);
  const year = cell.foundedYear ? Number(cell.foundedYear) : 0;
  return result(
    organizationSchema.safeParse({
      slug: cell.slug || slugify(cell.name),
      status: "draft",
      isDemo: false,
      name: cell.name,
      monogram: monogramFor(cell.name) || "?",
      shortDescription: cell.shortDescription,
      description: cell.description,
      industry: cell.industry,
      stage: cell.stage,
      teamSize: cell.teamSize,
      foundedYear: Number.isInteger(year) ? year : Number.NaN,
      city: cell.city,
      remotePolicy: cell.remotePolicy,
      websiteUrl: cell.websiteUrl,
      logoUrl: cell.logoUrl,
      sourceUrl: cell.sourceUrl,
      sourceLabel: cell.sourceLabel || "Fuente oficial",
      verifiedAt: isoDate(cell.verifiedAt, today),
    }),
    startupColumns,
  );
}

export function mapOpportunityRow(
  row: ImportRow,
  today: string,
  findStartup: (nameOrSlug: string) => string | undefined,
): MappedRow {
  const cell = cells(row, opportunityColumns);
  const organizationSlug = cell.organizationSlug
    ? findStartup(cell.organizationSlug)
    : undefined;
  if (!organizationSlug)
    return {
      ok: false,
      errors: [
        cell.organizationSlug
          ? `startup: no encontramos "${cell.organizationSlug}"; impórtala o créala primero`
          : "startup: falta",
      ],
    };
  const mode = normalizeText(cell.applicationMode);
  return result(
    opportunitySchema.safeParse({
      slug: cell.slug || slugify(`${cell.title} ${organizationSlug}`),
      status: "draft",
      isDemo: false,
      organizationSlug,
      title: cell.title,
      summary: cell.summary,
      description: cell.description,
      type: canonical(cell.type, opportunityTypes),
      area: cell.area,
      level: cell.level,
      modality: canonical(cell.modality, modalities),
      location: cell.location,
      countriesAccepted: cell.countriesAccepted,
      dedication: cell.dedication,
      compensation: cell.compensation,
      compensationType: canonical(cell.compensationType, [
        "Pagada",
        "Beca",
        "Por definir",
        "No pagada",
      ]),
      closesAt: isoDate(cell.closesAt, ""),
      applicationMode:
        mode === "linkup" || mode === "native" ? "native" : "external",
      applicationUrl: cell.applicationUrl,
      responsibilities: list(cell.responsibilities),
      requirements: list(cell.requirements),
      desirable: list(cell.desirable),
      sourceUrl: cell.sourceUrl,
      sourceLabel: cell.sourceLabel || "Aviso oficial",
      verifiedAt: isoDate(cell.verifiedAt, today),
    }),
    opportunityColumns,
  );
}
