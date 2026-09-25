import { z } from "zod";
import { httpUrlSchema } from "@/lib/validation";
export const submissionSchema = z
  .object({
    kind: z.enum(["startup", "opportunity", "claim", "correction"]),
    contactEmail: z
      .email()
      .max(200)
      .transform((email) => email.toLocaleLowerCase()),
    organizationName: z.string().trim().min(2).max(120),
    websiteUrl: z.union([z.literal(""), httpUrlSchema]).default(""),
    opportunityTitle: z.string().trim().max(160).default(""),
    sourceUrl: httpUrlSchema,
    notes: z.string().trim().max(1200).default(""),
    company: z.literal("").optional(),
  })
  .refine(
    (data) => data.kind !== "opportunity" || data.opportunityTitle.length >= 3,
    "Falta el título de la oportunidad.",
  );
