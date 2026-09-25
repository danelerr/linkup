import { getSqlite } from "@/db";
import { canonicalSource, ensureCatalog } from "@/lib/catalog";
import { normalizeText } from "@/lib/catalog-types";

export function duplicateSubmission(
  kind: string,
  source: string,
  organizationName: string,
) {
  if (kind === "claim" || kind === "correction") return false;
  ensureCatalog();
  const key = canonicalSource(source);
  const db = getSqlite();
  if (
    kind === "opportunity" &&
    db
      .prepare("SELECT 1 FROM catalog_opportunities WHERE source_key = ?")
      .get(key)
  )
    return true;
  if (
    kind === "startup" &&
    db
      .prepare("SELECT 1 FROM catalog_organizations WHERE website_key = ?")
      .get(new URL(source).hostname.replace(/^www\./, ""))
  )
    return true;
  if (
    db
      .prepare(
        "SELECT 1 FROM submissions WHERE kind=? AND status='pending' AND canonical_key=?",
      )
      .get(kind, key)
  )
    return true;
  if (
    kind === "startup" &&
    db
      .prepare(
        "SELECT 1 FROM submissions WHERE kind='startup' AND status='pending' AND normalized_name=?",
      )
      .get(normalizeText(organizationName))
  )
    return true;
  // Compatibility with entries created before the indexed intake migration.
  const legacy = db
    .prepare(
      "SELECT source_url, organization_name FROM submissions WHERE kind=? AND status='pending' AND canonical_key IS NULL",
    )
    .all(kind) as { source_url: string; organization_name: string }[];
  return legacy.some(
    (row) =>
      canonicalSource(row.source_url) === key ||
      (kind === "startup" &&
        normalizeText(row.organization_name) ===
          normalizeText(organizationName)),
  );
}
