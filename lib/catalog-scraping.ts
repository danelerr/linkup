import { createHash } from "node:crypto";
import { z } from "zod";
import type { ImportRow } from "./catalog-import-columns";

const publicUrl = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
});

const salarySchema = z.object({
  compensationType: z.string(),
  interval: z.string(),
  currencyCode: z.string().nullable(),
  minValue: z.number().nullable(),
  maxValue: z.number().nullable(),
});

export const ashbyFeedSchema = z.object({
  jobs: z.array(z.object({
    id: z.string(),
    title: z.string().min(3),
    location: z.string(),
    secondaryLocations: z.array(z.object({ location: z.string() })).optional(),
    isListed: z.boolean(),
    isRemote: z.boolean().nullable(),
    workplaceType: z.string().nullable().optional(),
    employmentType: z.string(),
    publishedAt: z.string().datetime({ offset: true }),
    jobUrl: publicUrl,
    applyUrl: publicUrl,
    descriptionPlain: z.string().min(20),
    compensation: z.object({
      summaryComponents: z.array(salarySchema).optional(),
    }).nullable().optional(),
  })),
});

export type AshbyJob = z.infer<typeof ashbyFeedSchema>["jobs"][number];
export type JobReview = {
  id: string;
  title: string;
  organization: string;
  area: string;
  level?: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  expectedLocation: string;
  countries: string;
  notes?: string;
};

export function contentHash(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function salaryFor(job: AshbyJob) {
  const salaries = job.compensation?.summaryComponents?.filter(
    (item) => item.compensationType === "Salary",
  ) ?? [];
  // Do not combine country-specific tiers or infer a currency/pay period.
  if (salaries.length !== 1) return null;
  const salary = salaries[0];
  const intervals: Record<string, string> = {
    "1 YEAR": "año", "1 MONTH": "mes", "1 HOUR": "hora",
  };
  const period = intervals[salary.interval];
  if (!salary.currencyCode || !period || salary.minValue === null ||
      salary.maxValue === null || salary.minValue < 0 ||
      salary.maxValue < salary.minValue) return null;
  const number = new Intl.NumberFormat("es", { maximumFractionDigits: 2 });
  return `${salary.currencyCode} ${number.format(salary.minValue)}–${number.format(salary.maxValue)} / ${period}`;
}

export function ashbyOpportunity(job: AshbyJob, review: JobReview, date: string): ImportRow {
  if (!job.isListed) throw new Error("La vacante no está listada públicamente.");
  if (job.id !== review.id || job.title.trim() !== review.title)
    throw new Error("Cambió la identidad o el título; requiere una nueva revisión.");
  if (job.location !== review.expectedLocation)
    throw new Error("Cambió la ubicación; revisar restricciones de contratación.");
  if (job.isRemote !== true && job.workplaceType !== "Remote" &&
      !/^Remote(?:,|$)/i.test(job.location))
    throw new Error("No se pudo confirmar la modalidad remota.");
  if (!["FullTime", "PartTime", "Contract", "Intern"].includes(job.employmentType))
    throw new Error("Tipo de dedicación sin correspondencia; revisar manualmente.");
  if (Date.parse(job.publishedAt) > Date.parse(`${date}T23:59:59Z`))
    throw new Error("La fecha del anuncio está en el futuro.");
  for (const value of [job.jobUrl, job.applyUrl]) {
    const url = new URL(value);
    if (url.hostname !== "jobs.ashbyhq.com" || !url.pathname.split("/").includes(job.id))
      throw new Error("El enlace no corresponde a esta vacante en Ashby.");
  }
  const compensation = salaryFor(job);
  const dedications: Record<string, string> = {
    FullTime: "Tiempo completo", PartTime: "Medio tiempo",
    Contract: "Contrato", Intern: "Pasantía; horario no especificado",
  };
  return {
    startup: review.organization,
    titulo: job.title.trim(),
    resumen: review.summary,
    descripcion: `${review.summary}\n\n${review.responsibilities.join(". ")}.\n\nConsulta las condiciones completas y postula en el anuncio oficial. La ficha es una síntesis editorial, no una oferta gestionada por LinkUp.`,
    tipo: job.employmentType === "Intern" ? "Pasantía" : "Empleo",
    area: review.area,
    nivel: review.level ?? "No especificado",
    modalidad: "Remoto",
    dedicacion: dedications[job.employmentType],
    compensacion: compensation ?? "Monto no publicado",
    tipo_compensacion: compensation ? "Pagada" : "Por definir",
    ubicacion: job.location,
    desde_donde: review.countries,
    postulacion: "externa",
    enlace_postulacion: job.applyUrl,
    responsabilidades: review.responsibilities.join(" | "),
    requisitos: review.requirements.join(" | "),
    fuente: job.jobUrl,
    nombre_fuente: `${review.organization} · anuncio oficial en Ashby`,
    comprobado: date,
  };
}

/** Read JSON, never execute remote scripts or retain candidate/form data. */
export function ripplingPublicJob(html: string) {
  const script = html.match(/<script\b(?=[^>]*\bid=["']__NEXT_DATA__["'])[^>]*>([\s\S]*?)<\/script>/i);
  if (!script) throw new Error("La página ya no incluye datos públicos de la vacante.");
  const schema = z.object({ props: z.object({ pageProps: z.object({
    apiData: z.object({ jobPost: z.object({
      uuid: z.string(), name: z.string(), url: publicUrl,
      createdOn: z.string(), workLocations: z.array(z.string()),
      unlistedFromSearch: z.boolean(),
    }) }),
  }) }) });
  return schema.parse(JSON.parse(script[1])).props.pageProps.apiData.jobPost;
}

/** RFC-style longest-path match for our user agent; Allow wins equal ties. */
export function robotsAllow(text: string, target: URL, agent = "linkupcatalogbot") {
  const groups: { agents: string[]; rules: { path: string; allow: boolean }[] }[] = [];
  let group: (typeof groups)[number] | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split("#")[0].trim();
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (key === "user-agent") {
      if (!group || group.rules.length) {
        group = { agents: [], rules: [] };
        groups.push(group);
      }
      group.agents.push(value.toLowerCase());
    } else if (group && value && (key === "allow" || key === "disallow")) {
      group.rules.push({ path: value, allow: key === "allow" });
    }
  }
  const score = (item: (typeof groups)[number]) => Math.max(-1, ...item.agents.map(
    (name) => name === "*" ? 0 : agent.toLowerCase().includes(name) ? name.length : -1,
  ));
  const best = Math.max(-1, ...groups.map(score));
  const path = `${target.pathname}${target.search}`;
  const rules = groups.filter((item) => score(item) === best && best >= 0)
    .flatMap((item) => item.rules).filter((rule) => {
      const end = rule.path.endsWith("$");
      const pattern = (end ? rule.path.slice(0, -1) : rule.path)
        .split("*").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
      return new RegExp(`^${pattern}${end ? "$" : ""}`).test(path);
    }).sort((a, b) => b.path.replace(/\*/g, "").length - a.path.replace(/\*/g, "").length || Number(b.allow) - Number(a.allow));
  return rules[0]?.allow ?? true;
}
