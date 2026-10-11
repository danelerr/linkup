import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startup, opportunity } from "./fixtures";
import { parseFilters, directoryHref } from "../lib/directory-filters";
import { isOpportunityOpen, normalizeText } from "../lib/catalog-types";
import { safeRelativeReturnPath } from "../lib/navigation";

const directory = mkdtempSync(join(tmpdir(), "linkup-unit-"));
process.env.LINKUP_DATABASE_PATH = join(directory, "test.sqlite");
process.env.LINKUP_SEED_DEMO = "false";
const { getSqlite } = await import("../db");
const { saveCatalogEntry } = await import("../lib/catalog-editor");
const {
  canonicalSource,
  opportunityBySlug,
  organizationBySlug,
  similarOpportunities,
} = await import("../lib/catalog");
const { getDirectory } = await import("../lib/directory");
const { normalizedAlertQuery, generateNotifications, listNotifications } =
  await import("../lib/alerts");
after(() => {
  getSqlite().close();
  rmSync(directory, { recursive: true, force: true });
});

test("normalizes filters, pagination and safe return URLs", () => {
  assert.equal(parseFilters({ pagina: "-9", q: " Python " }).pagina, 1);
  assert.equal(parseFilters({ pagina: "Infinity" }).pagina, 10000);
  assert.equal(
    directoryHref(parseFilters({ q: "Python", modalidad: "Remoto" })),
    "/?q=Python&modalidad=Remoto",
  );
  for (const path of [
    "https://outside.test",
    "//outside.test",
    "/\\outside.test",
    "/api/account",
    "/ingresar",
  ])
    assert.equal(safeRelativeReturnPath(path), "/");
  assert.equal(safeRelativeReturnPath("/?tipo=Empleo"), "/?tipo=Empleo");
  assert.equal(normalizeText("  Ingeniería  "), "ingenieria");
});

test("expiry is inclusive and drafts/closed entries are never active", () => {
  assert.equal(
    isOpportunityOpen(
      { status: "published", closesAt: "2026-09-24" },
      "2026-09-24",
    ),
    true,
  );
  assert.equal(
    isOpportunityOpen(
      { status: "published", closesAt: "2026-09-23" },
      "2026-09-24",
    ),
    false,
  );
  assert.equal(isOpportunityOpen({ status: "draft" }), false);
  assert.equal(isOpportunityOpen({ status: "closed" }), false);
});

test("canonical sources strip tracking but preserve identifying query parameters", () => {
  assert.equal(
    canonicalSource("https://jobs.example.com/role?id=42&utm_source=x#apply"),
    "https://jobs.example.com/role?id=42",
  );
});

test("catalog starts empty, publishes dynamically, searches requirements, filters and paginates", () => {
  assert.equal(getDirectory(parseFilters({})).total, 0);
  saveCatalogEntry("test-operator", {
    kind: "startup",
    data: startup(),
    reason: "Fuente comprobada",
  });
  saveCatalogEntry("test-operator", {
    kind: "opportunity",
    data: opportunity(),
    reason: "Fuente comprobada",
  });
  const found = getDirectory(
    parseFilters({ q: "Python", modalidad: "Remoto", area: "Ingeniería" }),
  );
  assert.equal(found.total, 1);
  assert.equal(found.opportunityCount, 1);
  assert.equal(found.rows[0].matchingOpportunities[0].slug, "desarrollo");
  assert.equal(getDirectory(parseFilters({ q: "%' OR 1=1 --" })).total, 0);
  assert.equal(
    getDirectory(parseFilters({ modalidad: "Presencial" })).total,
    0,
  );
  for (let index = 0; index < 14; index++)
    saveCatalogEntry("test-operator", {
      kind: "startup",
      data: startup(`equipo-${index}`),
      reason: "Prueba de paginación",
    });
  const second = getDirectory(parseFilters({ pagina: "2" }));
  assert.equal(second.total, 15);
  assert.equal(second.rows.length, 3);
  assert.equal(second.page, 2);
  assert.equal(getDirectory(parseFilters({ pagina: "999" })).page, 2);
});

test("deduplication, optimistic edits and atomic moderation preserve previous content", () => {
  assert.throws(
    () =>
      saveCatalogEntry("test", {
        kind: "startup",
        data: startup(),
        reason: "Duplicado",
      }),
    /Ya existe/,
  );
  assert.throws(
    () =>
      saveCatalogEntry("test", {
        kind: "opportunity",
        data: {
          ...opportunity("otra"),
          sourceUrl: "https://jobs.example.com/desarrollo?utm_source=x",
        },
        reason: "Duplicado",
      }),
    /Ya existe/,
  );
  const existing = opportunityBySlug("desarrollo")!;
  assert.throws(
    () =>
      saveCatalogEntry("test", {
        kind: "opportunity",
        data: { ...existing, title: "Cambio incorrecto" },
        existingSlug: existing.slug,
        expectedUpdatedAt: "old",
        reason: "Desactualizado",
      }),
    /Otra persona/,
  );
  assert.equal(opportunityBySlug(existing.slug)?.title, existing.title);
  assert.throws(
    () =>
      saveCatalogEntry("test", {
        kind: "opportunity",
        data: { ...existing, closesAt: "2020-01-01" },
        existingSlug: existing.slug,
        expectedUpdatedAt: existing.updatedAt,
        reason: "Fecha pasada",
      }),
    /ya pasó/,
  );
  assert.throws(
    () =>
      saveCatalogEntry("test", {
        kind: "startup",
        data: startup("atomic"),
        submissionId: crypto.randomUUID(),
        reason: "Sin envío",
      }),
    /ya fue revisado/,
  );
  assert.equal(organizationBySlug("atomic"), undefined);
});

test("draft parent hides published children and closed offers leave active search", () => {
  const old = opportunityBySlug("desarrollo")!;
  saveCatalogEntry("test", {
    kind: "opportunity",
    data: { ...old, status: "closed" },
    existingSlug: old.slug,
    expectedUpdatedAt: old.updatedAt,
    reason: "Cierre confirmado",
  });
  assert.equal(
    getDirectory(parseFilters({ abiertas: "1" })).opportunityCount,
    0,
  );
  const org = organizationBySlug("estudio")!;
  saveCatalogEntry("test", {
    kind: "startup",
    data: { ...org, status: "draft" },
    existingSlug: org.slug,
    expectedUpdatedAt: org.updatedAt,
    reason: "Revisar startup",
  });
  assert.equal(opportunityBySlug("desarrollo"), undefined);
});

test("notifications preserve every filter, select new matches and do not duplicate", () => {
  const query = normalizedAlertQuery({
    q: "Python",
    tipo: "Empleo",
    modalidad: "Remoto",
    area: "Ingeniería",
    nivel: "Junior",
    industria: "Software",
    pagina: "3",
    arbitrary: "ignored",
  });
  assert.equal(Object.keys(query).length, 7);
  assert.equal(query.arbitrary, undefined);
  assert.equal(query.pagina, undefined);
  const db = getSqlite();
  db.prepare(
    "INSERT INTO saved_searches(id,user_id,label,query_json,frequency,created_at,updated_at) VALUES (?,?,?,?,?,?,?)",
  ).run(
    "search",
    "user",
    "Python",
    JSON.stringify(query),
    "diaria",
    "2020-01-01",
    "2020-01-01",
  );
  saveCatalogEntry("test", {
    kind: "opportunity",
    data: opportunity("nuevo", "equipo-0"),
    reason: "Nueva vacante",
  });
  assert.equal(generateNotifications("user"), 1);
  assert.equal(listNotifications("user")[0].slug, "nuevo");
  db.prepare("UPDATE saved_searches SET updated_at='2020-01-01'").run();
  assert.equal(generateNotifications("user"), 0);
});

test("startups someone can join come first, the summary ignores the search and similar roles skip the same startup", () => {
  saveCatalogEntry("test", {
    kind: "opportunity",
    data: opportunity("similar", "equipo-7"),
    reason: "Otra startup",
  });
  saveCatalogEntry("test", {
    kind: "opportunity",
    data: opportunity("hermana", "equipo-0"),
    reason: "Misma startup",
  });
  // A–Z alone would put "equipo-1" second.
  const page = getDirectory(parseFilters({ orden: "nombre" }));
  assert.deepEqual(
    page.rows.slice(0, 2).map((row) => row.organization.slug),
    ["equipo-0", "equipo-7"],
  );
  assert.ok(page.rows.slice(2).every((row) => row.openingCount === 0));
  assert.deepEqual(page.catalog, { startups: 14, openings: 3, newThisWeek: 3 });
  assert.deepEqual(
    getDirectory(parseFilters({ q: "sin coincidencias" })).catalog,
    page.catalog,
  );
  assert.deepEqual(
    similarOpportunities(opportunityBySlug("nuevo")!).map(
      (item) => item.opportunity.slug,
    ),
    ["similar"],
  );
});

test("visits only write the account when something changed or an hour passed", async () => {
  const { syncUser } = await import("../lib/user-data");
  const db = getSqlite();
  const person = {
    userId: "sync-user",
    displayName: "Ana",
    email: "ana@example.test",
    fullName: "Ana",
  };
  const row = () =>
    db
      .prepare("SELECT display_name, last_seen_at FROM users WHERE id=?")
      .get(person.userId) as { display_name: string; last_seen_at: string };
  await syncUser(person);
  db.prepare("UPDATE users SET last_seen_at=? WHERE id=?").run(
    new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    person.userId,
  );
  const recent = row().last_seen_at;
  await syncUser(person);
  assert.equal(row().last_seen_at, recent);
  await syncUser({ ...person, fullName: "Ana María" });
  assert.equal(row().display_name, "Ana María");
  assert.notEqual(row().last_seen_at, recent);
  // SQLite's CURRENT_TIMESTAMP format, two hours ago.
  db.prepare(
    "UPDATE users SET last_seen_at=datetime('now','-2 hours') WHERE id=?",
  ).run(person.userId);
  const stale = row().last_seen_at;
  await syncUser({ ...person, fullName: "Ana María" });
  assert.notEqual(row().last_seen_at, stale);
});

test("similar opportunities require the same area and experience, not just employment type", () => {
  const roles = [
    { slug: "match-reference", area: "Ingeniería", level: "Senior" },
    { slug: "match-same", area: "Ingeniería", level: "Senior" },
    { slug: "match-recruiting", area: "Reclutamiento", level: "Senior" },
    { slug: "match-junior", area: "Ingeniería", level: "Junior" },
    {
      slug: "match-project",
      area: "Ingeniería",
      level: "Senior",
      type: "Proyecto pagado" as const,
    },
    {
      slug: "match-onsite",
      area: "Ingeniería",
      level: "Senior",
      modality: "Presencial" as const,
    },
    {
      slug: "match-closed",
      area: "Ingeniería",
      level: "Senior",
      status: "closed" as const,
    },
    {
      slug: "match-draft",
      area: "Ingeniería",
      level: "Senior",
      status: "draft" as const,
    },
  ];
  for (const role of roles) {
    saveCatalogEntry("test", {
      kind: "startup",
      data: startup(role.slug),
      reason: "Prueba de afinidad",
    });
    saveCatalogEntry("test", {
      kind: "opportunity",
      data: { ...opportunity(role.slug, role.slug), ...role },
      reason: "Prueba de afinidad",
    });
  }
  const reference = opportunityBySlug("match-reference")!;
  assert.deepEqual(
    similarOpportunities(reference).map((item) => item.opportunity.slug),
    ["match-same", "match-onsite", "match-project"],
  );
  assert.equal(similarOpportunities(reference, 1).length, 1);
  assert.deepEqual(
    similarOpportunities(opportunityBySlug("match-recruiting")!),
    [],
  );
});
