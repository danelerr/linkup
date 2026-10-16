import { sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { ensureCatalog } from "@/lib/catalog";
import {
  normalizeText,
  type Organization,
  type Opportunity,
} from "@/lib/catalog-types";
import { todayIso } from "@/lib/dates";
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
  /** Matching startups with at least one matching opening; they sort first. */
  hiring: number;
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

const and = (conditions: SQL[]) => sql.join(conditions, sql` AND `);

/**
 * SQL conditions for the directory and saved alerts: `organizations` filters
 * startups (o) and `opportunities` filters their openings (p).
 */
export function directoryConditions(filters: DirectoryFilters, today: string) {
  const org: SQL[] = [sql`o.status = 'published'`];
  const opp: SQL[] = [
    sql`p.status = 'published'`,
    sql`(p.closes_at IS NULL OR p.closes_at >= ${today})`,
  ];
  if (filters.industria) org.push(sql`o.industry = ${filters.industria}`);
  if (filters.area) opp.push(sql`p.area = ${filters.area}`);
  if (filters.tipo) opp.push(sql`p.type = ${filters.tipo}`);
  if (filters.modalidad) opp.push(sql`p.modality = ${filters.modalidad}`);
  if (filters.nivel) opp.push(sql`p.level = ${filters.nivel}`);
  const words = normalizeText(filters.q)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `%${word.replace(/[\\%_]/g, "\\$&")}%`);
  for (const word of words)
    opp.push(sql`(p.search_text LIKE ${word} OR o.search_text LIKE ${word})`);
  const opportunities = and(opp);
  const hasOpenings = sql`EXISTS (SELECT 1 FROM catalog_opportunities p WHERE p.organization_slug = o.slug AND ${opportunities})`;
  if (
    filters.abiertas ||
    filters.area ||
    filters.tipo ||
    filters.modalidad ||
    filters.nivel
  )
    org.push(hasOpenings);
  else if (words.length)
    org.push(
      sql`((${and(words.map((word) => sql`o.search_text LIKE ${word}`))}) OR ${hasOpenings})`,
    );
  return { organizations: and(org), opportunities, hasOpenings };
}

const distinct = async (query: SQL) =>
  (await getDb().execute<{ value: string }>(query)).rows
    .map((row) => row.value)
    .filter(Boolean);

export async function getDirectory(
  filters: DirectoryFilters,
): Promise<DirectoryPage> {
  await ensureCatalog();
  const db = getDb();
  const today = todayIso();
  const condition = directoryConditions(filters, today);
  const [counts, catalog, industries, areas, levels] = await Promise.all([
    db.execute<{ total: number; hiring: number; openings: number }>(sql`
      SELECT
        (SELECT count(*)::int FROM catalog_organizations o
          WHERE ${condition.organizations}) AS total,
        (SELECT count(*)::int FROM catalog_organizations o
          WHERE ${condition.organizations} AND ${condition.hasOpenings}) AS hiring,
        (SELECT count(*)::int FROM catalog_opportunities p
          JOIN catalog_organizations o ON o.slug = p.organization_slug
          WHERE ${condition.organizations} AND ${condition.opportunities}) AS openings`),
    db.execute<DirectoryPage["catalog"]>(sql`
      SELECT
        (SELECT count(*)::int FROM catalog_organizations WHERE status = 'published') AS startups,
        count(p.slug)::int AS openings,
        count(*) FILTER (WHERE p.published_at > ${today}::date - 7)::int AS "newThisWeek"
      FROM catalog_opportunities p
      JOIN catalog_organizations o ON o.slug = p.organization_slug
      WHERE p.status = 'published' AND o.status = 'published'
        AND (p.closes_at IS NULL OR p.closes_at >= ${today})`),
    distinct(
      sql`SELECT DISTINCT industry AS value FROM catalog_organizations WHERE status = 'published' ORDER BY industry`,
    ),
    distinct(
      sql`SELECT DISTINCT area AS value FROM catalog_opportunities WHERE status = 'published' AND (closes_at IS NULL OR closes_at >= ${today}) ORDER BY area`,
    ),
    distinct(
      sql`SELECT DISTINCT level AS value FROM catalog_opportunities WHERE status = 'published' AND (closes_at IS NULL OR closes_at >= ${today}) ORDER BY level`,
    ),
  ]);
  const { total, hiring, openings } = counts.rows[0];
  const page = Math.min(
    Math.max(1, Math.ceil(total / PAGE_SIZE)),
    Math.floor(filters.pagina),
  );
  // Startups someone can join right now come first; the chosen order applies
  // within each group.
  const order =
    filters.orden === "nombre"
      ? sql`lower(o.name) ASC, o.slug ASC`
      : sql`o.updated_at DESC, o.slug ASC`;
  const organizations = (
    await db.execute<{ data: Organization }>(sql`
      SELECT o.data FROM catalog_organizations o
      WHERE ${condition.organizations}
      ORDER BY ${condition.hasOpenings} DESC, ${order}
      LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`)
  ).rows.map((row) => row.data);
  // Up to three matching openings per startup on this page, and how many
  // there are in total, in one query.
  const slugs = organizations.map((organization) => organization.slug);
  const matches = slugs.length
    ? (
        await db.execute<{
          slug: string;
          data: Opportunity;
          count: number;
        }>(sql`
          SELECT slug, data, count FROM (
            SELECT p.organization_slug AS slug, p.data,
              row_number() OVER (PARTITION BY p.organization_slug ORDER BY p.published_at DESC, p.slug) AS position,
              count(*) OVER (PARTITION BY p.organization_slug)::int AS count
            FROM catalog_opportunities p
            JOIN catalog_organizations o ON o.slug = p.organization_slug
            WHERE p.organization_slug IN ${slugs} AND ${condition.opportunities}
          ) ranked
          WHERE position <= 3
          ORDER BY slug, position`)
      ).rows
    : [];
  const rows = organizations.map((organization) => {
    const own = matches.filter((match) => match.slug === organization.slug);
    return {
      organization,
      matchingOpportunities: own.map((match) => match.data),
      openingCount: own[0]?.count ?? 0,
    };
  });
  return {
    rows,
    total,
    hiring,
    opportunityCount: openings,
    catalog: catalog.rows[0],
    today,
    page,
    pageSize: PAGE_SIZE,
    hasDemo: rows.some((row) => row.organization.isDemo),
    facets: { industries, areas, levels },
  };
}
