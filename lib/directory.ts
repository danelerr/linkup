import { getSqlite } from "@/db";
import { ensureCatalog } from "@/lib/catalog";
import {
  normalizeText,
  type Organization,
  type Opportunity,
} from "@/lib/catalog-types";
import type { DirectoryFilters } from "@/lib/directory-filters";

export const PAGE_SIZE = 12;
export type DirectoryResult = {
  organization: Organization;
  matchingOpportunities: Opportunity[];
  openingCount: number;
};
export type DirectoryPage = {
  rows: DirectoryResult[];
  total: number;
  opportunityCount: number;
  page: number;
  pageSize: number;
  facets: { industries: string[]; areas: string[]; levels: string[] };
  hasDemo: boolean;
  /** Whole published catalog, independent of the current search. */
  catalog: { startups: number; openings: number; newThisWeek: number };
  /** UTC date the page was computed for, so client labels match the server. */
  today: string;
};

export function directoryConditions(filters: DirectoryFilters) {
  const org: string[] = ["o.status = 'published'"];
  const opp: string[] = [
    "p.status = 'published'",
    "(p.closes_at IS NULL OR p.closes_at >= @today)",
  ];
  const params: Record<string, string | number> = {
    today: new Date().toISOString().slice(0, 10),
  };
  if (filters.industria) {
    org.push("o.industry = @industry");
    params.industry = filters.industria;
  }
  for (const [key, column] of [
    ["area", "area"],
    ["tipo", "type"],
    ["modalidad", "modality"],
    ["nivel", "level"],
  ] as const) {
    if (filters[key]) {
      opp.push(`p.${column} = @${key}`);
      params[key] = filters[key];
    }
  }
  for (const [i, word] of normalizeText(filters.q)
    .split(/\s+/)
    .filter(Boolean)
    .entries()) {
    params[`q${i}`] = `%${word.replace(/[\\%_]/g, "\\$&")}%`;
    opp.push(
      `(p.search_text LIKE @q${i} ESCAPE '\\' OR o.search_text LIKE @q${i} ESCAPE '\\')`,
    );
  }
  const matchOpportunities = opp.join(" AND ");
  const exists = `EXISTS(SELECT 1 FROM catalog_opportunities p WHERE p.organization_slug = o.slug AND ${matchOpportunities})`;
  if (
    filters.abiertas ||
    filters.area ||
    filters.tipo ||
    filters.modalidad ||
    filters.nivel
  )
    org.push(exists);
  else if (filters.q.trim()) {
    const words = normalizeText(filters.q)
      .split(/\s+/)
      .filter(Boolean)
      .map((_, i) => `o.search_text LIKE @q${i} ESCAPE '\\'`)
      .join(" AND ");
    org.push(`((${words}) OR ${exists})`);
  }
  return {
    organizations: org.join(" AND "),
    opportunities: matchOpportunities,
    hasOpenings: exists,
    params,
  };
}

export function getDirectory(filters: DirectoryFilters): DirectoryPage {
  ensureCatalog();
  const db = getSqlite();
  const condition = directoryConditions(filters);
  const total = (
    db
      .prepare(
        `SELECT count(*) value FROM catalog_organizations o WHERE ${condition.organizations}`,
      )
      .get(condition.params) as { value: number }
  ).value;
  const page = Math.min(
    Math.max(1, Math.ceil(total / PAGE_SIZE)),
    Math.floor(filters.pagina),
  );
  // Startups someone can join right now come first; the chosen order applies
  // within each group.
  const order = `${condition.hasOpenings} DESC, ${
    filters.orden === "nombre"
      ? "o.name COLLATE NOCASE ASC"
      : "o.updated_at DESC, o.slug ASC"
  }`;
  const orgRows = db
    .prepare(
      `SELECT o.data_json FROM catalog_organizations o WHERE ${condition.organizations} ORDER BY ${order} LIMIT @limit OFFSET @offset`,
    )
    .all({
      ...condition.params,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }) as { data_json: string }[];
  const count = db
    .prepare(
      `SELECT count(*) value FROM catalog_opportunities p JOIN catalog_organizations o ON o.slug = p.organization_slug WHERE ${condition.organizations} AND ${condition.opportunities}`,
    )
    .get(condition.params) as { value: number };
  const rows = orgRows.map((row) => {
    const organization = JSON.parse(row.data_json) as Organization;
    const params = { ...condition.params, slug: organization.slug };
    const where = `p.organization_slug = @slug AND ${condition.opportunities}`;
    const matching = db
      .prepare(
        `SELECT p.data_json FROM catalog_opportunities p JOIN catalog_organizations o ON o.slug=p.organization_slug WHERE ${where} ORDER BY p.published_at DESC, p.slug LIMIT 3`,
      )
      .all(params) as { data_json: string }[];
    const count = db
      .prepare(
        `SELECT count(*) value FROM catalog_opportunities p JOIN catalog_organizations o ON o.slug=p.organization_slug WHERE ${where}`,
      )
      .get(params) as { value: number };
    return {
      organization,
      matchingOpportunities: matching.map(
        (item) => JSON.parse(item.data_json) as Opportunity,
      ),
      openingCount: count.value,
    };
  });
  const values = (sql: string) =>
    (db.prepare(sql).all() as { value: string }[])
      .map((row) => row.value)
      .filter(Boolean);
  const catalog = db
    .prepare(
      `SELECT
        (SELECT count(*) FROM catalog_organizations WHERE status = 'published') startups,
        count(p.slug) openings,
        count(CASE WHEN julianday(@today) - julianday(p.published_at) < 7 THEN 1 END) newThisWeek
      FROM catalog_opportunities p JOIN catalog_organizations o ON o.slug = p.organization_slug
      WHERE p.status = 'published' AND o.status = 'published' AND (p.closes_at IS NULL OR p.closes_at >= @today)`,
    )
    .get({ today: condition.params.today }) as DirectoryPage["catalog"];
  return {
    rows,
    total,
    opportunityCount: count.value,
    catalog,
    today: String(condition.params.today),
    page,
    pageSize: PAGE_SIZE,
    hasDemo: rows.some((row) => row.organization.isDemo),
    facets: {
      industries: values(
        "SELECT DISTINCT industry value FROM catalog_organizations WHERE status='published' ORDER BY industry",
      ),
      areas: values(
        "SELECT DISTINCT area value FROM catalog_opportunities WHERE status='published' AND (closes_at IS NULL OR closes_at >= date('now')) ORDER BY area",
      ),
      levels: values(
        "SELECT DISTINCT level value FROM catalog_opportunities WHERE status='published' AND (closes_at IS NULL OR closes_at >= date('now')) ORDER BY level",
      ),
    },
  };
}
