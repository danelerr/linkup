import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
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
export class CatalogError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function saveCatalogEntry(
  actorId: string,
  input: z.infer<typeof catalogEditSchema>,
) {
  ensureCatalog();
  const parsed = (
    input.kind === "startup" ? organizationSchema : opportunitySchema
  ).safeParse(input.data);
  if (!parsed.success)
    throw new CatalogError(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(" · "),
    );
  const value = parsed.data;
  if (input.existingSlug && input.existingSlug !== value.slug)
    throw new CatalogError("El enlace de un registro existente no se cambia.");
  const db = getDb();
  try {
    return db.transaction((tx) => {
      const existing =
        input.kind === "startup"
          ? organizationBySlug(value.slug, true)
          : opportunityBySlug(value.slug, true);
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
        submission = tx
          .select()
          .from(submissions)
          .where(eq(submissions.id, input.submissionId))
          .get();
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
      const now = new Date(
        Math.max(Date.now(), (previousTime || 0) + 1),
      ).toISOString();
      const base = {
        ...value,
        id: existing?.id ?? crypto.randomUUID(),
        updatedAt: now,
      };
      if (input.kind === "startup") {
        const data = { ...base, hiring: false } as Organization;
        const values = organizationValues(data);
        if (existing)
          tx.update(catalogOrganizations)
            .set(values)
            .where(eq(catalogOrganizations.slug, value.slug))
            .run();
        else tx.insert(catalogOrganizations).values(values).run();
      } else {
        const publishedAt =
          value.status === "published" && existing?.status !== "published"
            ? now
            : ((existing as Opportunity | undefined)?.publishedAt ?? now);
        const data = {
          ...base,
          publishedAt,
          managedByLinkUp:
            (value as z.infer<typeof opportunitySchema>).applicationMode ===
            "native",
        } as Opportunity;
        const organization = organizationBySlug(data.organizationSlug, true);
        if (!organization)
          throw new CatalogError(
            "Primero agrega la startup a la que pertenece esta oportunidad.",
          );
        if (data.status === "published" && organization.status !== "published")
          throw new CatalogError("La startup también debe estar publicada.");
        const values = opportunityValues(data);
        if (existing)
          tx.update(catalogOpportunities)
            .set(values)
            .where(eq(catalogOpportunities.slug, value.slug))
            .run();
        else tx.insert(catalogOpportunities).values(values).run();
      }
      if (submission) {
        tx.update(submissions)
          .set({ status: "approved", updatedAt: now })
          .where(eq(submissions.id, submission.id))
          .run();
        tx.insert(moderationDecisions)
          .values({
            id: crypto.randomUUID(),
            submissionId: submission.id,
            actorId,
            status: "approved",
            reason: input.reason,
            createdAt: now,
          })
          .run();
      }
      tx.insert(auditEvents)
        .values({
          id: crypto.randomUUID(),
          actorId,
          action: existing ? "catalog.updated" : "catalog.created",
          entityType: input.kind,
          entityId: value.slug,
          detailJson: JSON.stringify({
            reason: input.reason,
            submissionId: input.submissionId,
            status: value.status,
            before: existing ?? null,
          }),
          createdAt: now,
        })
        .run();
      return { slug: value.slug, updatedAt: now };
    });
  } catch (error) {
    if (error instanceof CatalogError) throw error;
    if (String(error).includes("UNIQUE constraint"))
      throw new CatalogError(
        "Ya existe un registro con ese sitio, fuente o enlace. Edita el existente.",
        409,
      );
    throw error;
  }
}
