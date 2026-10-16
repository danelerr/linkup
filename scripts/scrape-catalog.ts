import "./env";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { mapOpportunityRow, mapStartupRow } from "../lib/catalog-import";
import {
  ashbyFeedSchema, ashbyOpportunity, contentHash, ripplingPublicJob, robotsAllow,
} from "../lib/catalog-scraping";
import type { ImportRow } from "../lib/catalog-import-columns";
import { feeds, pendingRippling, profiles } from "./catalog-sources";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--importar" && arg !== "--help"))
  throw new Error("Uso: npm run recopilar [-- --importar]. Sin --importar no toca la base.");
if (args.includes("--help")) {
  console.log("npm run recopilar: recopila fuentes oficiales y genera JSON.\nnpm run recopilar -- --importar: además crea borradores. Nunca publica ni modifica registros existentes.");
  process.exit(0);
}
if (args.includes("--importar") && process.env.LINKUP_SEED_DEMO === "true")
  throw new Error("Desactiva LINKUP_SEED_DEMO para recopilar datos reales.");

const capturedAt = new Date().toISOString();
const date = capturedAt.slice(0, 10);
const directory = resolve("datos/recopilaciones", capturedAt.replace(/[:.]/g, "-"));
const startups: ImportRow[] = [];
const opportunities: ImportRow[] = [];
const pending: Record<string, unknown>[] = [];
const rejected: { source: string; reason: string }[] = [];
const evidence: Record<string, unknown>[] = [];
const policies = new Map<string, string>();
const requestedAt = new Map<string, number>();

async function request(url: string) {
  const host = new URL(url).host;
  const wait = Math.max(0, (requestedAt.get(host) ?? 0) + 1100 - Date.now());
  if (wait) await new Promise((done) => setTimeout(done, wait));
  requestedAt.set(host, Date.now());
  const response = await fetch(url, {
    headers: { "User-Agent": "LinkUpCatalogBot/0.1 (public catalog research; no personal data)", Accept: "application/json, text/html, text/plain" },
    signal: AbortSignal.timeout(15000),
    redirect: "error", // Never follow a redirect into login or an unchecked domain.
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}; no se reintenta ni se elude el control.`);
  if (Number(response.headers.get("content-length")) > 5_000_000)
    throw new Error("Respuesta demasiado grande.");
  const body = await response.text();
  if (Buffer.byteLength(body) > 5_000_000) throw new Error("Respuesta demasiado grande.");
  return body;
}

async function officialPage(url: string) {
  const target = new URL(url);
  if (!policies.has(target.origin)) {
    const robotsUrl = `${target.origin}/robots.txt`;
    let policy = "";
    let observation = "Sin directivas robots disponibles; solo página pública revisada.";
    try {
      const body = await request(robotsUrl);
      if (/^\s*user-agent\s*:/im.test(body) && !/<html/i.test(body)) {
        policy = body;
        observation = "Directivas robots evaluadas para LinkUpCatalogBot.";
      } else if (/<html/i.test(body) && /just a moment|captcha|access denied/i.test(body)) {
        throw new Error("robots devolvió un control de acceso.");
      }
    } catch (error) {
      // A missing robots file isn't a prohibition. Auth/rate limits are not bypassed.
      if (!String(error).includes("HTTP 404") && !String(error).includes("HTTP 410")) throw error;
    }
    policies.set(target.origin, policy);
    evidence.push({ kind: "robots", source: robotsUrl, capturedAt, sha256: contentHash(policy), observation });
  }
  if (!robotsAllow(policies.get(target.origin)!, target))
    throw new Error("robots.txt no permite recopilar esta ruta.");
  return request(url);
}

for (const profile of profiles) {
  const url = String(profile.row.fuente);
  try {
    const html = await officialPage(url);
    if (!html.includes(profile.marker)) throw new Error("No se pudo confirmar la identidad/contenido de la fuente.");
    const row: ImportRow = { ...profile.row, comprobado: date };
    const mapped = mapStartupRow(row, date);
    if (!mapped.ok) throw new Error(mapped.errors.join(" · "));
    startups.push(row);
    evidence.push({ kind: "startup", source: url, capturedAt, sha256: contentHash(html), notes: profile.notes });
    console.log(`Startup: ${row.nombre}`);
  } catch (error) {
    rejected.push({ source: url, reason: String(error) });
    console.log(`Revisión pendiente: ${profile.row.nombre} (${String(error)})`);
  }
}

const knownStartups = new Set(startups.map((row) => String(row.enlace)));
for (const feed of feeds) {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${feed.board}?includeCompensation=true`;
  try {
    // Documented public posting API: no authenticated API or HTML access bypass.
    const body = await request(url);
    const data = ashbyFeedSchema.parse(JSON.parse(body));
    for (const review of feed.reviews) {
      try {
        if (!knownStartups.has(review.organization)) throw new Error("No se pudo confirmar la startup en esta captura.");
        const job = data.jobs.find((item) => item.id === review.id);
        if (!job) throw new Error("La vacante ya no figura en el feed oficial.");
        const row = ashbyOpportunity(job, review, date);
        const mapped = mapOpportunityRow(row, date, (slug) => knownStartups.has(slug) ? slug : undefined);
        if (!mapped.ok) throw new Error(mapped.errors.join(" · "));
        opportunities.push(row);
        evidence.push({ kind: "opportunity", source: job.jobUrl, feed: url, externalId: job.id, capturedAt, sourcePublishedAt: job.publishedAt, sha256: contentHash(JSON.stringify(job)), notes: review.notes ?? "Elegibilidad y condiciones sujetas a confirmación con la empresa; revisión humana antes de publicar." });
        console.log(`Vacante: ${job.title}`);
      } catch (error) {
        rejected.push({ source: `${url}#${review.id}`, reason: String(error) });
      }
    }
    evidence.push({ kind: "feed", source: url, capturedAt, listed: data.jobs.filter((job) => job.isListed).length, policy: "https://developers.ashbyhq.com/docs/public-job-posting-api", sha256: contentHash(body) });
  } catch (error) {
    rejected.push({ source: url, reason: String(error) });
  }
}

// These local positions have no reliable modality. Keep them outside the import
// rather than labelling them presencial/hybrid just to satisfy the schema.
try {
  const board = await officialPage("https://ats.rippling.com/decisions/jobs");
  for (const review of pendingRippling) {
    const url = `https://ats.rippling.com/decisions/jobs/${review.id}`;
    try {
      if (!board.includes(`/decisions/jobs/${review.id}`)) throw new Error("No figura en la lista oficial de puestos abiertos.");
      const html = await officialPage(url);
      const job = ripplingPublicJob(html);
      if (job.uuid !== review.id || job.name !== review.title || job.unlistedFromSearch || job.url !== url)
        throw new Error("La identidad o disponibilidad del aviso cambió.");
      pending.push({ organization: "decisions", title: job.name, source: job.url, locations: job.workLocations, sourcePublishedAt: job.createdOn, capturedAt, summary: review.summary, reason: review.reason });
      evidence.push({ kind: "pending-opportunity", source: url, capturedAt, sha256: contentHash(JSON.stringify(job)) });
    } catch (error) {
      rejected.push({ source: url, reason: String(error) });
    }
  }
} catch (error) {
  rejected.push({ source: "https://ats.rippling.com/decisions/jobs", reason: String(error) });
}

mkdirSync(directory, { recursive: true });
const write = (name: string, value: unknown) => writeFileSync(resolve(directory, name), `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
write("startups.json", startups);
write("vacantes.json", opportunities);
write("revision-pendiente.json", pending);
write("fuentes.json", { capturedAt, state: "draft", evidence, rejected, limitations: ["No recopila perfiles, formularios de candidatos ni contactos personales.", "No publica, actualiza ni cierra registros existentes.", "Solo se importan vacantes seleccionadas y resumidas editorialmente; no todas las posiciones del feed.", "La fecha de comprobación indica captura de fuente, no aval ni representación de la empresa.", "Los avisos nuevos o cambiados requieren revisión antes de ampliar la selección."] });
console.log(`Captura: ${startups.length} startups, ${opportunities.length} vacantes, ${pending.length} para completar, ${rejected.length} fuentes/avisos no admitidos.\nArchivos: ${directory}`);

if (args.includes("--importar")) {
  if (!startups.length && !opportunities.length) throw new Error("No hay registros válidos; la base no se modifica.");
  const { importCatalogRows } = await import("../lib/catalog-import");
  const { closeDb } = await import("../db/index");
  const results = {
    startups: await importCatalogRows("system", "startup", startups),
    opportunities: await importCatalogRows("system", "opportunity", opportunities),
  };
  await closeDb();
  write("importacion.json", { capturedAt, results });
  for (const [kind, rows] of Object.entries(results)) {
    const count = (status: string) => rows.filter((row) => row.status === status).length;
    console.log(`${kind}: ${count("created")} borradores creados; ${count("duplicate")} duplicados omitidos; ${count("error")} errores.`);
    for (const row of rows.filter((item) => item.status === "error")) console.error(row.message);
  }
  if (Object.values(results).flat().some((row) => row.status === "error")) process.exitCode = 1;
  console.log("Revisa los borradores en /admin/catalogo. No se ha publicado ningún registro.");
}
if (rejected.length) process.exitCode = 1;
