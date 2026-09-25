import { getSqlite } from "@/db";
import { ensureCatalog } from "@/lib/catalog";
import { directoryConditions } from "@/lib/directory";
import { parseFilters, filterParams } from "@/lib/directory-filters";

export function normalizedAlertQuery(query: Record<string, string>) {
  const params = filterParams({
    ...parseFilters(query),
    abiertas: "1",
    pagina: 1,
    orden: "recientes",
  });
  params.sort();
  return Object.fromEntries(params.entries());
}

/** Local notifications only. No email provider is configured or contacted. */
export function generateNotifications(userId?: string) {
  ensureCatalog();
  const db = getSqlite();
  const searches = db
    .prepare(
      `SELECT * FROM saved_searches WHERE active = 1 ${userId ? "AND user_id = @userId" : ""} AND julianday('now') - julianday(updated_at) >= CASE WHEN frequency = 'diaria' THEN 1 ELSE 7 END ORDER BY updated_at LIMIT 200`,
    )
    .all(userId ? { userId } : {}) as {
    id: string;
    user_id: string;
    query_json: string;
    created_at: string;
  }[];
  let created = 0;
  const now = new Date().toISOString();
  db.transaction(() => {
    for (const search of searches) {
      const filters = parseFilters(JSON.parse(search.query_json));
      const condition = directoryConditions(filters);
      const matches = db
        .prepare(
          `SELECT p.slug FROM catalog_opportunities p JOIN catalog_organizations o ON o.slug=p.organization_slug WHERE ${condition.organizations} AND ${condition.opportunities} AND julianday(p.published_at) > julianday(@since) AND json_extract(p.data_json, '$.isDemo') = 0`,
        )
        .all({ ...condition.params, since: search.created_at }) as {
        slug: string;
      }[];
      for (const match of matches)
        created += db
          .prepare(
            "INSERT OR IGNORE INTO alert_notifications (id,user_id,search_id,opportunity_slug,created_at) VALUES (?,?,?,?,?)",
          )
          .run(
            crypto.randomUUID(),
            search.user_id,
            search.id,
            match.slug,
            now,
          ).changes;
      db.prepare("UPDATE saved_searches SET updated_at=? WHERE id=?").run(
        now,
        search.id,
      );
    }
  })();
  return created;
}

export function listNotifications(userId: string) {
  generateNotifications(userId);
  return getSqlite()
    .prepare(
      "SELECT n.id, n.read_at, p.slug, p.title, s.label FROM alert_notifications n JOIN catalog_opportunities p ON p.slug=n.opportunity_slug JOIN saved_searches s ON s.id=n.search_id JOIN catalog_organizations o ON o.slug=p.organization_slug WHERE n.user_id=? AND p.status='published' AND o.status='published' AND (p.closes_at IS NULL OR p.closes_at>=date('now')) ORDER BY n.created_at DESC LIMIT 50",
    )
    .all(userId) as {
    id: string;
    read_at: string | null;
    slug: string;
    title: string;
    label: string;
  }[];
}
