import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, isUniqueViolation } from "@/db";
import {
  auditEvents,
  catalogOrganizations,
  catalogOpportunities,
  submissions,
  moderationDecisions,
} from "@/db/schema";
import {
  ensureCatalog,
  organizationBySlug,
  opportunityBySlug,
  organizationValues,
  opportunityValues,
} from "@/lib/catalog";
import {
  modalities,
  opportunityTypes,
  type Organization,
  type Opportunity,
} from "@/lib/catalog-types";
import { httpUrlSchema } from "@/lib/validation";

const short = z.string().trim().max(160);
const date = z.union([z.literal(""), z.iso.date()]);
const url = z.union([z.literal(""), httpUrlSchema]);
const common = {
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  status: z.enum(["draft", "published", "closed"]),
  sourceLabel: short.default("Fuente oficial"),
  sourceUrl: url,
  verifiedAt: z.iso.date(),
  isDemo: z.boolean().default(false),
};
export const organizationSchema = z
  .object({
    ...common,
    name: short.min(2),
    monogram: z.string().trim().min(1).max(3),
    shortDescription: z.string().trim().min(10).max(220),
    description: z.string().trim().min(20).max(10000),
    industry: short.min(2),
    stage: short,
    teamSize: short,
    foundedYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear())
      .or(z.literal(0)),
    city: short,
    remotePolicy: short,
    websiteUrl: url,
    logoUrl: url.default(""),
  })
  .superRefine((data, ctx) => {
    if (
      !data.isDemo &&
      data.status === "published" &&
      (!data.sourceUrl || !data.websiteUrl)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Una startup publicada necesita sitio web y fuente verificable.",
      });
  });
const lines = z
  .array(z.string().trim().max(500))
  .max(30)
  .transform((items) => items.filter(Boolean));
export const opportunitySchema = z
  .object({
    ...common,
    organizationSlug: short.min(1),
    title: short.min(3),
    summary: z.string().trim().min(10).max(300),
    description: z.string().trim().min(20).max(10000),
    type: z.enum(opportunityTypes),
    area: short.min(2),
    level: short.min(2),
    modality: z.enum(modalities),
    location: short,
    countriesAccepted: short,
    dedication: short.min(2),
    compensation: short.min(2),
    compensationType: z.enum(["Pagada", "Beca", "Por definir", "No pagada"]),
    closesAt: date,
    applicationMode: z.enum(["external", "native"]),
    applicationUrl: url,
    responsibilities: lines,
    requirements: lines,
    desirable: lines,
  })
  .superRefine((data, ctx) => {
    if (!data.isDemo && data.status === "published") {
      if (!data.sourceUrl)
        ctx.addIssue({ code: "custom", message: "Falta la fuente oficial." });
      if (data.applicationMode === "external" && !data.applicationUrl)
        ctx.addIssue({
          code: "custom",
          message: "Falta el enlace de postulación.",
        });
      if (
        data.closesAt &&
        data.closesAt < new Date().toISOString().slice(0, 10)
      )
        ctx.addIssue({
          code: "custom",
          message:
            "La fecha de cierre ya pasó. Guarda el registro como cerrado.",
        });
    }
  });
export const catalogEditSchema = z.object({
  kind: z.enum(["startup", "opportunity"]),
  data: z.unknown(),
  existingSlug: z.string().max(120).optional(),
  expectedUpdatedAt: z.string().max(40).optional(),
  submissionId: z.string().uuid().optional(),
  reason: z.string().trim().min(3).max(300),
});
/** Spanish names of the editor fields, for validation messages. */
export const fieldLabels: Record<string, string> = {
  slug: "Enlace permanente",
  name: "Nombre",
  monogram: "Iniciales",
  shortDescription: "Descripción en una línea",
  description: "Descripción",
  industry: "Industria",
  stage: "Etapa",
  teamSize: "Tamaño del equipo",
  foundedYear: "Año de fundación",
  city: "Ubicación",
  remotePolicy: "Política de trabajo",
  websiteUrl: "Sitio web",
  logoUrl: "Logo",
  sourceUrl: "Fuente oficial",
  sourceLabel: "Nombre de la fuente",
  verifiedAt: "Fecha de comprobación",
  status: "Estado",
  organizationSlug: "Startup",
  title: "Título",
  summary: "Resumen",
  type: "Tipo",
  area: "Área",
  level: "Nivel de experiencia",
  modality: "Modalidad",
  location: "Ubicación",
  countriesAccepted: "Desde dónde se puede postular",
  dedication: "Dedicación",
  compensation: "Compensación",
  compensationType: "Tipo de compensación",
  closesAt: "Fecha de cierre",
  applicationMode: "Postulación",
  applicationUrl: "Enlace para postular",
  responsibilities: "Responsabilidades",
  requirements: "Lo indispensable",
  desirable: "Suma, pero no es requisito",
};

/** Turns zod issues into short Spanish reasons, one per field. */
export function describeIssues(
  issues: z.core.$ZodIssue[],
  label: (key: string) => string = (key) => fieldLabels[key] ?? key,
) {
  return [
    ...new Set(
      issues.map((issue) => {
        const key = String(issue.path[0] ?? "");
        const reason =
          issue.code === "too_small"
            ? issue.origin === "number"
              ? `debe ser al menos ${issue.minimum}`
              : Number(issue.minimum) <= 1
                ? "falta"
                : `falta o es muy corto (mínimo ${issue.minimum} caracteres)`
            : issue.code === "too_big"
              ? issue.origin === "number"
                ? `debe ser como máximo ${issue.maximum}`
                : `es muy largo (máximo ${issue.maximum})`
              : issue.code === "invalid_value"
                ? `usa uno de estos valores: ${issue.values.join(", ")}`
                : issue.code === "invalid_format"
                  ? issue.format === "date"
                    ? "usa una fecha AAAA-MM-DD"
                    : issue.format === "url"
                      ? "usa un enlace que empiece con https://"
                      : "tiene un formato inválido"
                  : issue.code === "invalid_union"
                    ? "usa un enlace que empiece con https://"
                    : issue.code === "invalid_type"
                      ? "falta o tiene un tipo inválido"
                      : issue.message;
        return key ? `${label(key)}: ${reason}` : reason;
      }),
    ),
  ];
}

export class CatalogError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function saveCatalogEntry(
  actorId: string,
  input: z.infer<typeof catalogEditSchema>,
) {
  await ensureCatalog();
  const parsed = (
    input.kind === "startup" ? organizationSchema : opportunitySchema
  ).safeParse(input.data);
  if (!parsed.success)
    throw new CatalogError(describeIssues(parsed.error.issues).join(" · "));
  const value = parsed.data;
  if (input.existingSlug && input.existingSlug !== value.slug)
    throw new CatalogError("El enlace de un registro existente no se cambia.");
  try {
    return await getDb().transaction(async (tx) => {
      // Locked until the transaction ends, so a concurrent edit waits and
      // then fails the freshness check instead of overwriting this one.
      const existing =
        input.kind === "startup"
          ? await organizationBySlug(value.slug, true, { db: tx, lock: true })
          : await opportunityBySlug(value.slug, true, { db: tx, lock: true });
      if (input.existingSlug && !existing)
        throw new CatalogError("El registro ya no existe.", 404);
      if (existing && !input.existingSlug)
        throw new CatalogError("Ya existe un registro con ese enlace.", 409);
      if (existing && existing.updatedAt !== input.expectedUpdatedAt)
        throw new CatalogError(
          "Otra persona actualizó este registro. Recarga antes de editar.",
          409,
        );
      let submission;
      if (input.submissionId) {
        [submission] = await tx
          .select()
          .from(submissions)
          .where(eq(submissions.id, input.submissionId))
          .for("update");
        if (!submission || submission.status !== "pending")
          throw new CatalogError(
            "Este envío ya fue revisado o no existe.",
            409,
          );
        if (submission.kind !== input.kind && submission.kind !== "correction")
          throw new CatalogError(
            "El tipo de registro no coincide con el envío.",
          );
        if (submission.kind === "correction" && !existing)
          throw new CatalogError(
            "Una corrección se aplica a un registro existente.",
          );
        if (value.status === "draft")
          throw new CatalogError(
            "Publica el registro para aprobar el envío; un borrador no cuenta como aprobación.",
          );
      }
      const previousTime = existing ? Date.parse(existing.updatedAt) : 0;
      const now = new Date(Math.max(Date.now(), (previousTime || 0) + 1));
      const base = {
        ...value,
        id: existing?.id ?? crypto.randomUUID(),
        updatedAt: now.toISOString(),
      };
      if (input.kind === "startup") {
        const data = { ...base, hiring: false } as Organization;
        const values = organizationValues(data);
        if (existing)
          await tx
            .update(catalogOrganizations)
            .set(values)
            .where(eq(catalogOrganizations.slug, value.slug));
        else await tx.insert(catalogOrganizations).values(values);
      } else {
        const publishedAt =
          value.status === "published" && existing?.status !== "published"
            ? now.toISOString()
            : ((existing as Opportunity | undefined)?.publishedAt ??
              now.toISOString());
        const data = {
          ...base,
          publishedAt,
          managedByLinkUp:
            (value as z.infer<typeof opportunitySchema>).applicationMode ===
            "native",
        } as Opportunity;
        const organization = await organizationBySlug(
          data.organizationSlug,
          true,
          { db: tx },
        );
        if (!organization)
          throw new CatalogError(
            "Primero agrega la startup a la que pertenece esta oportunidad.",
          );
        if (data.status === "published" && organization.status !== "published")
          throw new CatalogError("La startup también debe estar publicada.");
        const values = opportunityValues(data);
        if (existing)
          await tx
            .update(catalogOpportunities)
            .set(values)
            .where(eq(catalogOpportunities.slug, value.slug));
        else await tx.insert(catalogOpportunities).values(values);
      }
      if (submission) {
        await tx
          .update(submissions)
          .set({ status: "approved", updatedAt: now })
          .where(eq(submissions.id, submission.id));
        await tx.insert(moderationDecisions).values({
          id: crypto.randomUUID(),
          submissionId: submission.id,
          actorId,
          status: "approved",
          reason: input.reason,
          createdAt: now,
        });
      }
      await tx.insert(auditEvents).values({
        id: crypto.randomUUID(),
        actorId,
        action: existing ? "catalog.updated" : "catalog.created",
        entityType: input.kind,
        entityId: value.slug,
        detail: {
          reason: input.reason,
          submissionId: input.submissionId,
          status: value.status,
          before: existing ?? null,
        },
        createdAt: now,
      });
      return { slug: value.slug, updatedAt: base.updatedAt };
    });
  } catch (error) {
    if (error instanceof CatalogError) throw error;
    if (isUniqueViolation(error))
      throw new CatalogError(
        "Ya existe un registro con ese sitio, fuente o enlace. Edita el existente.",
        409,
      );
    throw error;
  }
}
