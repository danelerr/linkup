import { desc, eq, ne } from "drizzle-orm";
import { getDb, getSqlite } from "@/db";
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
    dataJson: JSON.stringify(data),
    updatedAt: data.updatedAt,
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
    dataJson: JSON.stringify(data),
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
  };
}

let seeded = false;
export function ensureCatalog() {
  if (seeded) return;
  const db = getDb();
  if (process.env.LINKUP_SEED_DEMO === "true") {
    db.transaction((tx) => {
      for (const item of demoOrganizations) {
        const data: Organization = {
          ...item,
          websiteUrl: "",
          sourceUrl: "",
          status: "published",
          updatedAt: `${item.verifiedAt}T12:00:00.000Z`,
        };
        tx.insert(catalogOrganizations)
          .values(organizationValues(data))
          .onConflictDoNothing()
          .run();
      }
      for (const item of demoOpportunities) {
        const data: Opportunity = {
          ...item,
          sourceUrl: "",
          applicationUrl: "",
          status: "published",
          updatedAt: `${item.verifiedAt}T12:00:00.000Z`,
        };
        tx.insert(catalogOpportunities)
          .values(opportunityValues(data))
          .onConflictDoNothing()
          .run();
      }
    });
  }
  seeded = true;
}

export function getOrganizations(includeDrafts = false): Organization[] {
  ensureCatalog();
  return getDb()
    .select()
    .from(catalogOrganizations)
    .where(includeDrafts ? undefined : ne(catalogOrganizations.status, "draft"))
    .all()
    .map((row) => JSON.parse(row.dataJson));
}
export function getOpportunities(includeDrafts = false): Opportunity[] {
  ensureCatalog();
  return getDb()
    .select()
    .from(catalogOpportunities)
    .where(includeDrafts ? undefined : ne(catalogOpportunities.status, "draft"))
    .all()
    .map((row) => JSON.parse(row.dataJson));
}
export function organizationBySlug(
  slug: string,
  includeDraft = false,
): Organization | undefined {
  ensureCatalog();
  const row = getDb()
    .select()
    .from(catalogOrganizations)
    .where(eq(catalogOrganizations.slug, slug))
    .get();
  return row && (includeDraft || row.status !== "draft")
    ? JSON.parse(row.dataJson)
    : undefined;
}
export function opportunityBySlug(
  slug: string,
  includeDraft = false,
): Opportunity | undefined {
  ensureCatalog();
  const row = getDb()
    .select()
    .from(catalogOpportunities)
    .where(eq(catalogOpportunities.slug, slug))
    .get();
  if (
    !row ||
    (!includeDraft &&
      (row.status === "draft" || !organizationBySlug(row.organizationSlug)))
  )
    return undefined;
  return JSON.parse(row.dataJson);
}
export function opportunitiesForOrganization(
  slug: string,
  includeClosed = false,
): Opportunity[] {
  ensureCatalog();
  return getDb()
    .select()
    .from(catalogOpportunities)
    .where(eq(catalogOpportunities.organizationSlug, slug))
    .orderBy(desc(catalogOpportunities.publishedAt), catalogOpportunities.slug)
    .all()
    .map((row) => JSON.parse(row.dataJson) as Opportunity)
    .filter(
      (item) =>
        item.status !== "draft" && (includeClosed || isOpportunityOpen(item)),
    );
}
export function organizationForOpportunity(opportunity: Opportunity) {
  return organizationBySlug(opportunity.organizationSlug);
}

/** Open opportunities at other startups, closest area first. */
export function similarOpportunities(opportunity: Opportunity, limit = 3) {
  ensureCatalog();
  const rows = getSqlite()
    .prepare(
      `SELECT p.data_json opportunity, o.data_json organization
      FROM catalog_opportunities p JOIN catalog_organizations o ON o.slug = p.organization_slug
      WHERE p.status = 'published' AND o.status = 'published'
        AND (p.closes_at IS NULL OR p.closes_at >= @today)
        AND p.organization_slug != @organization
        AND (p.area = @area OR p.type = @type OR p.level = @level)
      ORDER BY (p.area = @area) DESC, (p.level = @level) DESC, p.published_at DESC
      LIMIT @limit`,
    )
    .all({
      today: new Date().toISOString().slice(0, 10),
      organization: opportunity.organizationSlug,
      area: opportunity.area,
      type: opportunity.type,
      level: opportunity.level,
      limit,
    }) as { opportunity: string; organization: string }[];
  return rows.map((row) => ({
    opportunity: JSON.parse(row.opportunity) as Opportunity,
    organization: JSON.parse(row.organization) as Organization,
  }));
}
