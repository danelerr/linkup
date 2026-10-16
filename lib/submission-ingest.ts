import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  catalogOpportunities,
  catalogOrganizations,
  submissions,
} from "@/db/schema";
import { canonicalSource, ensureCatalog } from "@/lib/catalog";
import { normalizeText } from "@/lib/catalog-types";

/** The proposal repeats a catalog record or another pending proposal. */
export async function duplicateSubmission(
  kind: string,
  source: string,
  organizationName: string,
) {
  if (kind === "claim" || kind === "correction") return false;
  await ensureCatalog();
  const key = canonicalSource(source);
  const db = getDb();
  const exists = async (query: Promise<unknown[]>) => (await query).length > 0;
  if (
    kind === "opportunity" &&
    key &&
    (await exists(
      db
        .select({ id: catalogOpportunities.id })
        .from(catalogOpportunities)
        .where(eq(catalogOpportunities.sourceKey, key))
        .limit(1),
    ))
  )
    return true;
  if (
    kind === "startup" &&
    (await exists(
      db
        .select({ id: catalogOrganizations.id })
        .from(catalogOrganizations)
        .where(
          eq(
            catalogOrganizations.websiteKey,
            new URL(source).hostname.replace(/^www\./, ""),
          ),
        )
        .limit(1),
    ))
  )
    return true;
  const pending = and(
    eq(submissions.kind, kind),
    eq(submissions.status, "pending"),
  );
  if (
    key &&
    (await exists(
      db
        .select({ id: submissions.id })
        .from(submissions)
        .where(and(pending, eq(submissions.canonicalKey, key)))
        .limit(1),
    ))
  )
    return true;
  return (
    kind === "startup" &&
    (await exists(
      db
        .select({ id: submissions.id })
        .from(submissions)
        .where(
          and(
            pending,
            eq(submissions.normalizedName, normalizeText(organizationName)),
          ),
        )
        .limit(1),
    ))
  );
}
