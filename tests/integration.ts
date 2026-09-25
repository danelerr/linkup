import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import Database from "better-sqlite3";
import { startup, opportunity } from "./fixtures";

const temporary = mkdtempSync(join(tmpdir(), "linkup-integration-"));
const database = join(temporary, "test.sqlite");
const portProbe = createServer();
await new Promise<void>((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
const address = portProbe.address();
assert(address && typeof address === "object");
const port = address.port;
await new Promise<void>((resolve) => portProbe.close(() => resolve()));
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      LINKUP_DATABASE_PATH: database,
      LINKUP_SEED_DEMO: "false",
      BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: crypto.randomUUID() + crypto.randomUUID(),
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (data) => {
  logs = (logs + data.toString()).slice(-8000);
});
server.stderr.on("data", (data) => {
  logs = (logs + data.toString()).slice(-8000);
});
let db: Database.Database | undefined;
let checks = 0;
const check = (label: string) => {
  checks++;
  console.log(`✓ ${label}`);
};
async function api(
  path: string,
  method = "GET",
  body?: unknown,
  cookie = "",
  extra: Record<string, string> = {},
) {
  const response = await fetch(origin + path, {
    method,
    headers: {
      "content-type": "application/json",
      origin,
      ...(cookie ? { cookie } : {}),
      ...extra,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}
try {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(origin);
      if (response.ok) break;
    } catch {
      /* startup */
    }
    if (attempt > 100) throw new Error("Server did not become ready. " + logs);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.equal((await api("/api/profile")).response.status, 401);
  assert.equal(
    (
      await api("/api/profile", "GET", undefined, "", {
        "oai-user-id": "forged",
        "oai-user-email": "admin@example.test",
      })
    ).response.status,
    401,
  );
  check("anonymous and forged-header requests cannot access private data");
  const password = "Integration-only-passphrase-2026";
  const registered = await api("/api/auth/sign-up/email", "POST", {
    email: "operator@example.test",
    password,
    name: "Test Operator",
  });
  assert.equal(
    registered.response.status,
    200,
    JSON.stringify(registered.data),
  );
  const adminCookie = registered.response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert(adminCookie.includes("session_token"));
  await api("/api/profile", "GET", undefined, adminCookie);
  db = new Database(database);
  db.prepare("UPDATE users SET role='admin' WHERE email=?").run(
    "operator@example.test",
  );
  check("own email/password registration creates a persistent session");
  const wrongLogin = await api("/api/auth/sign-in/email", "POST", {
    email: "operator@example.test",
    password: "Incorrect-passphrase-2026",
  });
  assert.equal(wrongLogin.response.status, 401);
  const login = await api("/api/auth/sign-in/email", "POST", {
    email: "operator@example.test",
    password,
  });
  assert.equal(login.response.status, 200);
  const loginCookie = login.response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.equal(
    (await api("/api/profile", "GET", undefined, loginCookie)).response.status,
    200,
  );
  assert.equal(
    (await api("/api/auth/sign-out", "POST", {}, loginCookie)).response.status,
    200,
  );
  assert.equal(
    (await api("/api/profile", "GET", undefined, loginCookie)).response.status,
    401,
  );
  check(
    "password sign-in rejects wrong credentials and signing out revokes the session",
  );
  const external = {
    kind: "opportunity",
    organizationName: "Estudio estudio",
    opportunityTitle: "Desarrollo de producto",
    sourceUrl: "https://jobs.example.com/desarrollo",
    contactEmail: "contributor@example.test",
    websiteUrl: "",
    notes: "Fuente pendiente de revisión",
  };
  assert.equal(
    (await api("/api/submissions", "POST", external)).response.status,
    401,
  );
  const submitted = await api(
    "/api/submissions",
    "POST",
    external,
    adminCookie,
  );
  assert.equal(submitted.response.status, 201);
  assert.equal(
    (
      db
        .prepare("SELECT contact_email FROM submissions WHERE id=?")
        .get(submitted.data.id) as { contact_email: string }
    ).contact_email,
    "operator@example.test",
  );
  assert.equal(
    (await api("/api/submissions", "POST", external, adminCookie)).response
      .status,
    409,
  );
  for (let index = 1; index <= 5; index++) {
    const proposal = await api(
      "/api/submissions",
      "POST",
      {
        kind: "startup",
        organizationName: `Límite ${index}`,
        sourceUrl: `https://limite-${index}.example.com`,
      },
      adminCookie,
    );
    assert.equal(proposal.response.status, index < 5 ? 201 : 429);
  }
  assert.equal(
    (
      await api(
        "/api/admin/submissions",
        "PATCH",
        { id: submitted.data.id, status: "approved", reason: "Revisado" },
        adminCookie,
      )
    ).response.status,
    400,
  );
  check(
    "intake requires an account, uses its email, deduplicates, limits volume and cannot approve without publishing",
  );
  let result = await api(
    "/api/admin/catalog",
    "POST",
    { kind: "startup", data: startup(), reason: "Fuente comprobada" },
    adminCookie,
  );
  assert.equal(result.response.status, 200, JSON.stringify(result.data));
  result = await api(
    "/api/admin/catalog",
    "POST",
    {
      kind: "opportunity",
      data: opportunity(),
      submissionId: submitted.data.id,
      reason: "Fuente comprobada",
    },
    adminCookie,
  );
  assert.equal(result.response.status, 200, JSON.stringify(result.data));
  assert.equal(
    (
      db
        .prepare("SELECT status FROM submissions WHERE id=?")
        .get(submitted.data.id) as { status: string }
    ).status,
    "approved",
  );
  const page = await fetch(origin + "/?q=Python&modalidad=Remoto");
  const html = await page.text();
  assert.equal(page.status, 200);
  assert(html.includes("Desarrollo de producto"));
  const detail = await fetch(
    origin +
      "/oportunidades/desarrollo?from=" +
      encodeURIComponent("/?q=Python&modalidad=Remoto"),
  );
  assert(
    (await detail.text()).includes("https://jobs.example.com/desarrollo/apply"),
  );
  check(
    "moderation atomically publishes a searchable record without rebuilding",
  );
  const registeredTalent = await api("/api/auth/sign-up/email", "POST", {
    email: "talent@example.test",
    password,
    name: "Test Talent",
  });
  assert.equal(registeredTalent.response.status, 200);
  const cookie = registeredTalent.response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.equal(
    (
      await api(
        "/api/admin/catalog",
        "POST",
        { kind: "startup", data: startup("denied"), reason: "Denegado" },
        cookie,
      )
    ).response.status,
    403,
  );
  assert.equal(
    (
      await api(
        "/api/saved-opportunities",
        "POST",
        { opportunitySlug: "desarrollo", save: true },
        cookie,
        { origin: "https://outside.example" },
      )
    ).response.status,
    403,
  );
  assert.equal(
    (
      await api(
        "/api/saved-opportunities",
        "POST",
        { opportunitySlug: "desarrollo", save: true },
        cookie,
      )
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api(
        "/api/saved-opportunities",
        "POST",
        { opportunitySlug: "desarrollo", save: false },
        cookie,
      )
    ).response.status,
    200,
  );
  check("operator permissions, cross-origin protection, save and unsave work");
  assert.equal(
    (
      await api(
        "/api/applications",
        "POST",
        { opportunitySlug: "desarrollo", answers: [] },
        cookie,
      )
    ).response.status,
    201,
  );
  const native = {
    ...opportunity("native"),
    applicationMode: "native",
    applicationUrl: "",
  };
  assert.equal(
    (
      await api(
        "/api/admin/catalog",
        "POST",
        { kind: "opportunity", data: native, reason: "Proceso interno" },
        adminCookie,
      )
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api(
        "/api/applications",
        "POST",
        { opportunitySlug: "native", answers: ["Me interesa", "Mi proyecto"] },
        cookie,
      )
    ).response.status,
    400,
  );
  assert.equal(
    (
      await api(
        "/api/applications",
        "POST",
        {
          opportunitySlug: "native",
          answers: ["Me interesa", "Mi proyecto"],
          consent: true,
        },
        cookie,
      )
    ).response.status,
    409,
  );
  assert.equal(
    (
      await api(
        "/api/profile",
        "PUT",
        {
          objective: "Primer empleo",
          city: "Ciudad",
          country: "País",
          modality: "Remoto",
          availability: "Inmediata",
          skills: ["Python"],
          bio: "",
          portfolioUrl: "",
          privacy: "private",
          isAdult: true,
        },
        cookie,
      )
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api(
        "/api/applications",
        "POST",
        {
          opportunitySlug: "native",
          answers: ["Me interesa", "Mi proyecto"],
          consent: true,
        },
        cookie,
      )
    ).response.status,
    201,
  );
  assert.equal(
    (
      await api(
        "/api/applications",
        "POST",
        {
          opportunitySlug: "native",
          answers: ["Me interesa", "Mi proyecto"],
          consent: true,
        },
        cookie,
      )
    ).response.status,
    200,
  );
  check(
    "external tracking needs no full profile; native applications enforce profile, consent and idempotency",
  );
  const alert = {
    label: "Python remoto",
    query: {
      q: "Python",
      modalidad: "Remoto",
      area: "Ingeniería",
      tipo: "Empleo",
      nivel: "Junior",
    },
    frequency: "diaria",
  };
  assert.equal(
    (await api("/api/alerts", "POST", alert, cookie)).response.status,
    201,
  );
  assert.equal(
    (await api("/api/alerts", "POST", alert, cookie)).response.status,
    409,
  );
  const saved = await api("/api/alerts", "GET", undefined, cookie);
  assert.equal(JSON.parse(saved.data.alerts[0].queryJson).modalidad, "Remoto");
  db.prepare(
    "UPDATE saved_searches SET updated_at='2020-01-01', created_at='2020-01-01'",
  ).run();
  const notified = await api("/api/alerts", "GET", undefined, cookie);
  assert.equal(notified.data.notifications.length, 2);
  assert.equal(
    (await api("/api/alerts", "PATCH", undefined, cookie)).response.status,
    200,
  );
  assert(
    (
      await api("/api/alerts", "GET", undefined, cookie)
    ).data.notifications.every((item: { read_at: string }) =>
      Boolean(item.read_at),
    ),
  );
  check(
    "saved searches retain filters and deliver deduplicated in-app notifications",
  );
  const stored = JSON.parse(
    (
      db
        .prepare(
          "SELECT data_json FROM catalog_opportunities WHERE slug='desarrollo'",
        )
        .get() as { data_json: string }
    ).data_json,
  );
  assert.equal(
    (
      await api(
        "/api/admin/catalog",
        "POST",
        {
          kind: "opportunity",
          data: { ...stored, status: "closed" },
          existingSlug: stored.slug,
          expectedUpdatedAt: "outdated",
          reason: "Cambios simultáneos",
        },
        adminCookie,
      )
    ).response.status,
    409,
  );
  assert.equal(
    (
      await api(
        "/api/admin/catalog",
        "POST",
        {
          kind: "opportunity",
          data: { ...stored, status: "closed" },
          existingSlug: stored.slug,
          expectedUpdatedAt: stored.updatedAt,
          reason: "Vacante cerrada",
        },
        adminCookie,
      )
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api(
        "/api/applications",
        "POST",
        { opportunitySlug: "desarrollo" },
        adminCookie,
      )
    ).response.status,
    409,
  );
  check(
    "stale edits are rejected and closed opportunities cannot receive applications",
  );
  const imported = await api(
    "/api/admin/import",
    "POST",
    {
      rows: [
        external,
        {
          kind: "startup",
          organizationName: "Nuevo equipo",
          sourceUrl: "https://nuevo.example.com",
        },
        {
          kind: "startup",
          organizationName: "Bad",
          sourceUrl: "javascript:alert(1)",
        },
      ],
    },
    adminCookie,
  );
  assert.deepEqual(
    imported.data.results.map((item: { status: string }) => item.status),
    ["duplicate", "created", "error"],
  );
  check(
    "batch imports report duplicates and validation errors without auto-publication",
  );
  assert.equal(
    (await api("/api/submissions", "POST", { ...external, kind: "claim" }))
      .response.status,
    401,
  );
  const claim = await api(
    "/api/submissions",
    "POST",
    { ...external, kind: "claim", contactEmail: "talent@example.test" },
    cookie,
  );
  assert.equal(claim.response.status, 201);
  assert.equal(
    (
      await api(
        "/api/admin/submissions",
        "PATCH",
        {
          id: claim.data.id,
          status: "approved",
          organizationSlug: "estudio",
          reason: "Representación comprobada para prueba",
        },
        cookie,
      )
    ).response.status,
    403,
  );
  assert.equal(
    (
      await api(
        "/api/admin/submissions",
        "PATCH",
        {
          id: claim.data.id,
          status: "approved",
          organizationSlug: "estudio",
          reason: "Representación comprobada para prueba",
        },
        adminCookie,
      )
    ).response.status,
    200,
  );
  assert.equal(
    (
      await api(
        "/api/admin/submissions",
        "PATCH",
        {
          id: claim.data.id,
          status: "approved",
          organizationSlug: "estudio",
          reason: "Segunda revisión",
        },
        adminCookie,
      )
    ).response.status,
    409,
  );
  check(
    "organization claims require a session, explicit admin approval and cannot be approved twice",
  );
  const nativeStored = JSON.parse(
    (
      db
        .prepare(
          "SELECT data_json FROM catalog_opportunities WHERE slug='native'",
        )
        .get() as { data_json: string }
    ).data_json,
  );
  assert.equal(
    (
      await api(
        "/api/admin/catalog",
        "POST",
        {
          kind: "opportunity",
          data: { ...nativeStored, status: "closed" },
          existingSlug: nativeStored.slug,
          expectedUpdatedAt: nativeStored.updatedAt,
          reason: "Convocatoria cerrada",
        },
        adminCookie,
      )
    ).response.status,
    200,
  );
  const candidatesPage = await fetch(
    origin + "/organizacion/estudio/candidatos",
    { headers: { cookie: adminCookie }, redirect: "manual" },
  );
  assert.equal(candidatesPage.status, 200);
  assert((await candidatesPage.text()).includes("Test Talent"));
  const nativeApplication = db
    .prepare("SELECT id FROM applications WHERE opportunity_slug='native'")
    .get() as { id: string };
  const review = (status: string) =>
    api(
      "/api/organization/applications",
      "PATCH",
      {
        applicationId: nativeApplication.id,
        organizationSlug: "estudio",
        status,
      },
      adminCookie,
    );
  assert.equal((await review("entrevista")).response.status, 200);
  assert.equal(
    (
      await api(
        "/api/applications",
        "PATCH",
        { applicationId: nativeApplication.id, status: "retirada" },
        cookie,
      )
    ).response.status,
    200,
  );
  assert.equal((await review("oferta")).response.status, 409);
  check(
    "organizations keep reviewing candidates after closing and cannot reopen withdrawn processes",
  );
  assert.equal(
    (await api("/api/account/export", "GET", undefined, cookie)).response
      .status,
    200,
  );
  assert.equal(
    (await api("/api/account", "DELETE", { confirmation: "no" }, cookie))
      .response.status,
    400,
  );
  assert.equal(
    (await api("/api/account", "DELETE", { confirmation: "ELIMINAR" }, cookie))
      .response.status,
    200,
  );
  assert.equal(
    (await api("/api/profile", "GET", undefined, cookie)).response.status,
    401,
  );
  assert.equal(
    (
      db.prepare("SELECT count(*) value FROM alert_notifications").get() as {
        value: number;
      }
    ).value,
    0,
  );
  check(
    "data export and atomic account deletion also revoke sessions and clear notifications",
  );
  console.log(
    `${checks} integration scenarios passed against the production server.`,
  );
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  db?.close();
  server.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    if (server.exitCode !== null) resolve();
    else server.once("exit", () => resolve());
  });
  rmSync(temporary, { recursive: true, force: true });
}
