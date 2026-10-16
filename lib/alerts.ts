import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { alertNotifications, savedSearches } from "@/db/schema";
import { ensureCatalog } from "@/lib/catalog";
import { todayIso } from "@/lib/dates";
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

/**
 * Turns saved searches that are due into in-app notices for openings
 * published after the search was saved. Nothing is emailed.
 */
export async function generateNotifications(userId?: string) {
  await ensureCatalog();
  const db = getDb();
  const searches = await db
    .select()
    .from(savedSearches)
    .where(
      and(
        eq(savedSearches.active, true),
        userId ? eq(savedSearches.userId, userId) : undefined,
        sql`now() - ${savedSearches.updatedAt} >= CASE WHEN ${savedSearches.frequency} = 'diaria' THEN interval '1 day' ELSE interval '7 days' END`,
      ),
    )
    .orderBy(asc(savedSearches.updatedAt))
    .limit(200);
  const today = todayIso();
  let created = 0;
  for (const search of searches) {
    const condition = directoryConditions(parseFilters(search.query), today);
    await db.transaction(async (tx) => {
      const inserted = await tx.execute(sql`
        INSERT INTO alert_notifications (id, user_id, search_id, opportunity_slug)
        SELECT gen_random_uuid()::text, ${search.userId}, ${search.id}, p.slug
        FROM catalog_opportunities p
        JOIN catalog_organizations o ON o.slug = p.organization_slug
        WHERE ${condition.organizations} AND ${condition.opportunities}
          AND p.published_at > ${search.createdAt}
          AND NOT coalesce((p.data ->> 'isDemo')::boolean, false)
        ON CONFLICT DO NOTHING`);
      created += inserted.rowCount ?? 0;
      await tx
        .update(savedSearches)
        .set({ updatedAt: new Date() })
        .where(eq(savedSearches.id, search.id));
    });
  }
  return created;
}

export async function listNotifications(userId: string) {
  await generateNotifications(userId);
  const { rows } = await getDb().execute<{
    id: string;
    read_at: Date | null;
    slug: string;
    title: string;
    label: string;
  }>(sql`
    SELECT n.id, n.read_at, p.slug, p.title, s.label
    FROM alert_notifications n
    JOIN catalog_opportunities p ON p.slug = n.opportunity_slug
    JOIN saved_searches s ON s.id = n.search_id
    JOIN catalog_organizations o ON o.slug = p.organization_slug
    WHERE n.user_id = ${userId} AND p.status = 'published'
      AND o.status = 'published'
      AND (p.closes_at IS NULL OR p.closes_at >= ${todayIso()})
    ORDER BY n.created_at DESC
    LIMIT 50`);
  return rows;
}

export async function markNotificationsRead(userId: string) {
  await getDb()
    .update(alertNotifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(alertNotifications.userId, userId),
        isNull(alertNotifications.readAt),
      ),
    );
}
