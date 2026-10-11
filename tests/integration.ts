import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import Database from "better-sqlite3";
import { startup, opportunity } from "./fixtures";

const secret = crypto.randomUUID() + crypto.randomUUID();
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
      BETTER_AUTH_SECRET: secret,
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
  const signupHtml = await (await fetch(`${origin}/ingresar?cuenta=nueva`)).text();
  const signupPassword = signupHtml.match(/<input\b[^>]*name="password"[^>]*>/)?.[0];
  assert(signupPassword);
  assert.match(signupPassword, /minlength="4"/i);
  assert.doesNotMatch(signupHtml, /12 caracteres/);
  const tooShort = await api("/api/auth/sign-up/email", "POST", {
    email: "too-short@example.test",
    password: "abc",
    name: "Short Password",
  });
  assert.equal(tooShort.response.status, 400);
  assert.equal(tooShort.data.code, "PASSWORD_TOO_SHORT");
  const password = "test";
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
  check("registration accepts four lowercase characters, rejects three and matches the form");
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
  let cookie = registeredTalent.response.headers
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
  const template = await fetch(
    origin + "/api/admin/catalog-import?plantilla=vacantes",
    { headers: { cookie: adminCookie } },
  );
  assert.equal(template.status, 200);
  const templateBytes = Buffer.from(await template.arrayBuffer());
  // UTF-8 BOM so Excel keeps accents; fetch's text() would strip it.
  assert.deepEqual([...templateBytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]);
  assert.ok(templateBytes.toString("utf8", 3).startsWith("startup,titulo,"));
  const startupsImport = await api(
    "/api/admin/catalog-import",
    "POST",
    {
      kind: "startup",
      rows: [
        {
          Nombre: "Importada Uno",
          "Descripción corta": "Herramientas de cobro para ferias y mercados.",
          Descripción:
            "Permite a vendedores de mercados cobrar y llevar su caja.",
          Industria: "Fintech",
          "Sitio web": "https://importada.example.com",
          Comprobado: "20/09/2026",
        },
        { Nombre: "Sin datos" },
      ],
    },
    adminCookie,
  );
  assert.deepEqual(
    startupsImport.data.results.map((item: { row: number; status: string }) => [
      item.row,
      item.status,
    ]),
    [
      [2, "created"],
      [3, "error"],
    ],
  );
  assert.match(startupsImport.data.results[1].message, /descripcion_corta/);
  const opportunitiesImport = await api(
    "/api/admin/catalog-import",
    "POST",
    {
      kind: "opportunity",
      rows: [
        {
          startup: "importada uno",
          titulo: "Pasantía de operaciones",
          resumen: "Acompaña a vendedores en su primera semana con la app.",
          descripcion: "Visitarás mercados con el equipo y documentarás dudas.",
          tipo: "pasantia",
          area: "Operaciones",
          nivel: "Estudiante",
          modalidad: "presencial",
          dedicacion: "Medio tiempo",
          compensacion: "Beca USD 250 / mes",
          tipo_compensacion: "Beca",
        },
      ],
    },
    adminCookie,
  );
  assert.equal(opportunitiesImport.data.results[0].status, "created");
  const draftRow = db
    .prepare("SELECT status FROM catalog_opportunities WHERE slug=?")
    .get(opportunitiesImport.data.results[0].slug) as { status: string };
  assert.equal(draftRow.status, "draft");
  assert.ok(
    !(await (await fetch(origin + "/?q=Importada")).text()).includes(
      "Pasantía de operaciones",
    ),
  );
  const repeated = await api(
    "/api/admin/catalog-import",
    "POST",
    {
      kind: "startup",
      rows: [
        {
          nombre: "Importada Uno",
          descripcion_corta: "Herramientas de cobro para ferias y mercados.",
          descripcion:
            "Permite a vendedores de mercados cobrar y llevar su caja.",
          industria: "Fintech",
        },
      ],
    },
    adminCookie,
  );
  assert.equal(repeated.data.results[0].status, "duplicate");
  assert.equal(
    (
      await api(
        "/api/admin/catalog-import",
        "POST",
        { kind: "startup", rows: [{ nombre: "X" }] },
        cookie,
      )
    ).response.status,
    403,
  );
  check(
    "complete spreadsheet imports create drafts, explain row errors in Spanish and skip duplicates",
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
  const resetOutput = execFileSync(
    join("node_modules", ".bin", "tsx"),
    ["scripts/password.ts", "--email", "talent@example.test"],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        LINKUP_DATABASE_PATH: database,
        BETTER_AUTH_URL: origin,
        BETTER_AUTH_SECRET: secret,
      },
    },
  );
  const temporaryPassword = resetOutput.match(
    /Contraseña temporal: (\S+)/,
  )?.[1];
  assert(temporaryPassword, resetOutput);
  assert.equal(
    (await api("/api/profile", "GET", undefined, cookie)).response.status,
    401,
  );
  const temporaryLogin = await api("/api/auth/sign-in/email", "POST", {
    email: "talent@example.test",
    password: temporaryPassword,
  });
  assert.equal(temporaryLogin.response.status, 200);
  const temporaryCookie = temporaryLogin.response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  const profileHtml = await (await fetch(`${origin}/mi-linkup/perfil`, {
    headers: { cookie: temporaryCookie },
  })).text();
  const newPasswordInput = profileHtml.match(/<input\b[^>]*name="newPassword"[^>]*>/)?.[0];
  assert(newPasswordInput);
  assert.match(newPasswordInput, /minlength="4"/i);
  const shortChange = await api(
    "/api/auth/change-password",
    "POST",
    { currentPassword: temporaryPassword, newPassword: "abc" },
    temporaryCookie,
  );
  assert.equal(shortChange.response.status, 400);
  assert.equal(shortChange.data.code, "PASSWORD_TOO_SHORT");
  const changed = await api(
    "/api/auth/change-password",
    "POST",
    {
      currentPassword: temporaryPassword,
      newPassword: "next",
      revokeOtherSessions: true,
    },
    temporaryCookie,
  );
  assert.equal(changed.response.status, 200, JSON.stringify(changed.data));
  // Changing the password closes the other sessions and opens a new one.
  // (Signing in again here would trip Better Auth's sign-in rate limit.)
  cookie = changed.response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.equal(
    (await api("/api/profile", "GET", undefined, cookie)).response.status,
    200,
  );
  assert.equal(
    (await api("/api/profile", "GET", undefined, temporaryCookie)).response
      .status,
    401,
  );
  check(
    "password reset and change accept four characters, reject three and match the form",
  );
  const member = (method: string, body: unknown, as = cookie) =>
    api("/api/organization/members", method, body, as);
  const operatorAccount = db
    .prepare("SELECT id FROM auth_user WHERE email='operator@example.test'")
    .get() as { id: string };
  const talentAccount = db
    .prepare("SELECT id FROM auth_user WHERE email='talent@example.test'")
    .get() as { id: string };
  const team = { organizationSlug: "estudio" };
  assert.equal(
    (
      await member("POST", {
        ...team,
        email: "operator@example.test",
        memberRole: "recruiter",
      })
    ).response.status,
    201,
  );
  assert.equal(
    (
      await member("POST", {
        ...team,
        email: "operator@example.test",
        memberRole: "viewer",
      })
    ).response.status,
    200,
  );
  assert.equal(
    (
      await member("POST", {
        ...team,
        email: "talent@example.test",
        memberRole: "viewer",
      })
    ).response.status,
    409,
  );
  assert.equal(
    (
      await member("POST", {
        ...team,
        email: "nadie@example.test",
        memberRole: "viewer",
      })
    ).response.status,
    404,
  );
  assert.equal(
    (await member("DELETE", { ...team, userId: operatorAccount.id })).response
      .status,
    200,
  );
  assert.equal(
    (await member("DELETE", { ...team, userId: operatorAccount.id })).response
      .status,
    404,
  );
  assert.equal(
    (await member("DELETE", { ...team, userId: talentAccount.id })).response
      .status,
    409,
  );
  assert.equal(
    (
      await member(
        "POST",
        { ...team, email: "operator@example.test", memberRole: "viewer" },
        "",
      )
    ).response.status,
    401,
  );
  check("startup owners manage their team and a startup always keeps an owner");
  const assignRole = (email: string, value: string, as: string) =>
    api("/api/admin/roles", "PATCH", { email, role: value }, as);
  // Denied pages render the not-found view; with the root loading.tsx the
  // response may already be streaming, so check content rather than status.
  const pageText = async (path: string, as: string) =>
    (await fetch(origin + path, { headers: { cookie: as } })).text();
  assert.equal(
    (await assignRole("operator@example.test", "talent", cookie)).response
      .status,
    403,
  );
  assert.equal(
    (await assignRole("talent@example.test", "curator", adminCookie)).response
      .status,
    200,
  );
  assert.ok(
    (await pageText("/admin", cookie)).includes("Todo cambio queda asociado"),
  );
  assert.ok(
    !(await pageText("/admin/personas", cookie)).includes("Asignar rol"),
  );
  assert.ok(
    (await pageText("/admin/personas", adminCookie)).includes("Asignar rol"),
  );
  assert.equal(
    (await assignRole("operator@example.test", "talent", adminCookie)).response
      .status,
    409,
  );
  assert.equal(
    (await assignRole("talent@example.test", "talent", adminCookie)).response
      .status,
    200,
  );
  assert.ok(
    !(await pageText("/admin", cookie)).includes("Todo cambio queda asociado"),
  );
  check(
    "only administrators assign roles, never their own, and curators cannot manage people",
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
    (await api("/api/account", "DELETE", { confirmation: "ELIMINAR" }))
      .response.status,
    401,
  );
  const beforeBlockedDeletion = await api(
    "/api/account/export",
    "GET",
    undefined,
    cookie,
  );
  const blockedDeletion = await api(
    "/api/account",
    "DELETE",
    { confirmation: "ELIMINAR" },
    cookie,
  );
  assert.equal(blockedDeletion.response.status, 409);
  assert.equal(blockedDeletion.data.code, "LAST_ORGANIZATION_OWNER");
  assert.deepEqual(blockedDeletion.data.organizations, [
    { slug: "estudio", name: "Estudio estudio" },
  ]);
  assert.match(blockedDeletion.data.error, /asigna a otra persona/);
  assert.equal(
    (await api("/api/profile", "GET", undefined, cookie)).response.status,
    200,
  );
  const afterBlockedDeletion = await api(
    "/api/account/export",
    "GET",
    undefined,
    cookie,
  );
  for (const key of [
    "account",
    "profile",
    "savedOpportunities",
    "alerts",
    "notifications",
    "applications",
    "applicationEvents",
    "organizationMemberships",
    "auditEvents",
  ])
    assert.deepEqual(
      afterBlockedDeletion.data[key],
      beforeBlockedDeletion.data[key],
      key,
    );
  // The owner explicitly chooses a successor. Closing the account must not
  // promote a recruiter or viewer automatically.
  assert.equal(
    (
      await member("POST", {
        ...team,
        email: "operator@example.test",
        memberRole: "owner",
      })
    ).response.status,
    201,
  );
  check(
    "account deletion preserves data and sessions until another active owner is assigned",
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
  assert.deepEqual(
    db
      .prepare(
        "SELECT user_id FROM organization_members WHERE organization_slug=? AND member_role='owner' AND status='active'",
      )
      .all("estudio"),
    [{ user_id: operatorAccount.id }],
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
