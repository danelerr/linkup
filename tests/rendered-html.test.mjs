import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

function request(pathname, init = {}) {
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", ...init.headers },
      method: init.method,
      body: init.body,
    }),
    env,
    context,
  );
}

test("renders the directory as the product entry point", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Descubre startups y oportunidades — LinkUp<\/title>/i);
  assert.match(html, /Descubre quién está construyendo y dónde puedes sumarte/);
  assert.match(html, /Busca una startup, industria o rol/);
  assert.match(html, /Con oportunidades/);
  assert.match(html, /Práctica de producto/);
  assert.doesNotMatch(html, /role="tablist"/i);
  assert.doesNotMatch(html, /Latam|Latinoamérica|Bolivia/i);
  assert.match(html, /Menta/);
  assert.match(html, /registros actuales son demostrativos/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|react-loading-skeleton/i);
});

test("renders stable public entity pages with provenance", async () => {
  const [startupResponse, trustResponse] = await Promise.all([
    request("/startups/menta"),
    request("/confianza"),
  ]);
  assert.equal(startupResponse.status, 200);
  assert.equal(trustResponse.status, 200);
  const [startupHtml, trustHtml] = await Promise.all([
    startupResponse.text(),
    trustResponse.text(),
  ]);
  assert.match(startupHtml, /Registro demostrativo/);
  assert.match(startupHtml, /Revisado el/);
  assert.match(trustHtml, /Una fuente visible vale más que una insignia vacía/);
  assert.match(trustHtml, /La procedencia/);
  assert.match(trustHtml, /Gestionada por LinkUp/);
});

test("protects private product routes and APIs in server code", async () => {
  const [privatePage, privateProfilePage, profileApi, organizationApi, auth] = await Promise.all([
    readFile(new URL("../app/mi-linkup/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mi-linkup/perfil/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/profile/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/organization/applications/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/chatgpt-auth.ts", import.meta.url), "utf8"),
  ]);
  assert.match(privatePage, /requireSyncedUser\("\/mi-linkup"\)/);
  assert.match(privateProfilePage, /requireSyncedUser\("\/mi-linkup\/perfil"\)/);
  assert.match(profileApi, /if \(!user\).*status: 401/);
  assert.match(organizationApi, /hasOrganizationCandidateAccess/);
  assert.match(organizationApi, /status: 403/);
  assert.match(auth, /safeRelativeReturnPath/);
  assert.match(auth, /url\.origin !== "https:\/\/app\.local"/);
});

test("keeps the historical mark and canonical product definition", async () => {
  const [readme] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    access(new URL("../public/linkup-mark.png", import.meta.url)),
  ]);
  assert.match(readme, /directorio que reúne startups y sus oportunidades en una sola búsqueda/i);
  assert.match(readme, /La página principal no es una landing de marketing/i);
});
