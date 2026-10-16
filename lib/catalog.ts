import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { getDb, type Database, type Transaction } from "@/db";
import { catalogOrganizations, catalogOpportunities } from "@/db/schema";
import {
  organizations as demoOrganizations,
  opportunities as demoOpportunities,
} from "@/lib/demo-catalog";
import {
  isOpportunityOpen,
  normalizeText,
  type Organization,
  type Opportunity,
} from "@/lib/catalog-types";
import { todayIso } from "@/lib/dates";
export {
  formatShortDate,
  isOpportunityOpen,
  opportunityTypes,
  type Organization,
  type Opportunity,
} from "@/lib/catalog-types";

export function canonicalSource(value: string) {
  if (!value) return null;
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()])
    if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.toString().replace(/\/$/, "");
}

export function organizationValues(data: Organization) {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    industry: data.industry,
    websiteKey: data.websiteUrl
      ? new URL(data.websiteUrl).hostname.replace(/^www\./, "")
      : null,
    status: data.status,
    searchText: normalizeText(
      `${data.name} ${data.shortDescription} ${data.description} ${data.industry} ${data.city}`,
    ),
    data,
    updatedAt: new Date(data.updatedAt),
  };
}

export function opportunityValues(data: Opportunity) {
  return {
    id: data.id,
    slug: data.slug,
    organizationSlug: data.organizationSlug,
    title: data.title,
    area: data.area,
    type: data.type,
    modality: data.modality,
    level: data.level,
    status: data.status,
    closesAt: data.closesAt || null,
    sourceKey: canonicalSource(data.sourceUrl),
    searchText: normalizeText(
      [
        data.title,
        data.summary,
        data.description,
        data.area,
        data.type,
        data.modality,
        data.level,
        data.location,
        ...data.requirements,
        ...data.responsibilities,
        ...data.desirable,
      ].join(" "),
    ),
    data,
    publishedAt: new Date(data.publishedAt),
    updatedAt: new Date(data.updatedAt),
  };
}

let seeded: Promise<void> | undefined;
/**
 * Inserts the demo catalog once when LINKUP_SEED_DEMO=true. Never in
 * production, which shares its database with nothing else.
 */
export function ensureCatalog() {
  if (
    process.env.LINKUP_SEED_DEMO !== "true" ||
    process.env.VERCEL_ENV === "production"
  )
    return Promise.resolve();
  seeded ??= getDb().transaction(async (tx) => {
    for (const item of demoOrganizations)
      await tx
        .insert(catalogOrganizations)
        .values(
          organizationValues({
            ...item,
            websiteUrl: "",
            sourceUrl: "",
            status: "published",
            updatedAt: `${item.verifiedAt}T12:00:00.000Z`,
          }),
        )
        .onConflictDoNothing();
    for (const item of demoOpportunities)
      await tx
        .insert(catalogOpportunities)
        .values(
          opportunityValues({
            ...item,
            sourceUrl: "",
            applicationUrl: "",
            status: "published",
            updatedAt: `${item.verifiedAt}T12:00:00.000Z`,
          }),
        )
        .onConflictDoNothing();
  });
  return seeded;
}

export async function getOrganizations(
  includeDrafts = false,
): Promise<Organization[]> {
  await ensureCatalog();
  const rows = await getDb()
    .select({ data: catalogOrganizations.data })
    .from(catalogOrganizations)
    .where(
      includeDrafts ? undefined : ne(catalogOrganizations.status, "draft"),
    );
  return rows.map((row) => row.data);
}

export async function getOpportunities(
  includeDrafts = false,
): Promise<Opportunity[]> {
  await ensureCatalog();
  const rows = await getDb()
    .select({ data: catalogOpportunities.data })
    .from(catalogOpportunities)
    .where(
      includeDrafts ? undefined : ne(catalogOpportunities.status, "draft"),
    );
  return rows.map((row) => row.data);
}

/**
 * Inside a transaction, `lock` holds the row until it ends, so two editors
 * cannot both pass the same freshness check.
 */
export async function organizationBySlug(
  slug: string,
  includeDraft = false,
  {
    db = getDb(),
    lock = false,
  }: { db?: Database | Transaction; lock?: boolean } = {},
): Promise<Organization | undefined> {
  await ensureCatalog();
  const query = db
    .select({
      status: catalogOrganizations.status,
      data: catalogOrganizations.data,
    })
    .from(catalogOrganizations)
    .where(eq(catalogOrganizations.slug, slug));
  const [row] = await (lock ? query.for("update") : query);
  return row && (includeDraft || row.status !== "draft") ? row.data : undefined;
}

export async function opportunityBySlug(
  slug: string,
  includeDraft = false,
  {
    db = getDb(),
    lock = false,
  }: { db?: Database | Transaction; lock?: boolean } = {},
): Promise<Opportunity | undefined> {
  await ensureCatalog();
  const query = db
    .select({
      status: catalogOpportunities.status,
      organizationSlug: catalogOpportunities.organizationSlug,
      data: catalogOpportunities.data,
    })
    .from(catalogOpportunities)
    .where(eq(catalogOpportunities.slug, slug));
  const [row] = await (lock ? query.for("update") : query);
  if (
    !row ||
    (!includeDraft &&
      (row.status === "draft" ||
        !(await organizationBySlug(row.organizationSlug))))
  )
    return undefined;
  return row.data;
}

export async function opportunitiesForOrganization(
  slug: string,
  includeClosed = false,
): Promise<Opportunity[]> {
  await ensureCatalog();
  const rows = await getDb()
    .select({ data: catalogOpportunities.data })
    .from(catalogOpportunities)
    .where(
      and(
        eq(catalogOpportunities.organizationSlug, slug),
        ne(catalogOpportunities.status, "draft"),
      ),
    )
    .orderBy(desc(catalogOpportunities.publishedAt), catalogOpportunities.slug);
  return rows
    .map((row) => row.data)
    .filter((item) => includeClosed || isOpportunityOpen(item));
}

export function organizationForOpportunity(opportunity: Opportunity) {
  return organizationBySlug(opportunity.organizationSlug);
}

/**
 * Visible openings with their startup, in the order of `slugs`, in one query;
 * the same rule as opportunityBySlug plus organizationForOpportunity.
 */
export async function opportunitiesWithOrganizations(slugs: string[]) {
  await ensureCatalog();
  if (!slugs.length) return [];
  const { rows } = await getDb().execute<{
    opportunity: Opportunity;
    organization: Organization;
  }>(sql`
    SELECT p.data AS opportunity, o.data AS organization
    FROM catalog_opportunities p
    JOIN catalog_organizations o ON o.slug = p.organization_slug
    WHERE p.slug IN ${slugs} AND p.status <> 'draft' AND o.status <> 'draft'`);
  const bySlug = new Map(rows.map((row) => [row.opportunity.slug, row]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
}

/** Startup names by slug, drafts included, for lists of memberships. */
export async function organizationNames(slugs: string[]) {
  if (!slugs.length) return new Map<string, string>();
  const rows = await getDb()
    .select({
      slug: catalogOrganizations.slug,
      name: catalogOrganizations.name,
    })
    .from(catalogOrganizations)
    .where(inArray(catalogOrganizations.slug, slugs));
  return new Map(rows.map((row) => [row.slug, row.name]));
}

/** Same area and experience at other startups; prefer similar conditions. */
export async function similarOpportunities(
  opportunity: Opportunity,
  limit = 3,
) {
  await ensureCatalog();
  const { rows } = await getDb().execute<{
    opportunity: Opportunity;
    organization: Organization;
  }>(sql`
    SELECT p.data AS opportunity, o.data AS organization
    FROM catalog_opportunities p
    JOIN catalog_organizations o ON o.slug = p.organization_slug
    WHERE p.status = 'published' AND o.status = 'published'
      AND (p.closes_at IS NULL OR p.closes_at >= ${todayIso()})
      AND p.organization_slug <> ${opportunity.organizationSlug}
      AND p.area = ${opportunity.area} AND p.level = ${opportunity.level}
    ORDER BY (p.type = ${opportunity.type}) DESC,
      (p.modality = ${opportunity.modality}) DESC,
      p.published_at DESC, p.slug
    LIMIT ${limit}`);
  return rows;
}
