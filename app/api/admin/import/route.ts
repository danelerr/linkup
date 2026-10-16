import { z } from "zod";
import { apiOperator } from "@/lib/api-operator";
import { submissionSchema } from "@/lib/submission-input";
import { duplicateSubmission } from "@/lib/submission-ingest";
import { createSubmission } from "@/lib/user-data";

export async function POST(request: Request) {
  const access = await apiOperator();
  if (access.error) return access.error;
  const body = z
    .object({ rows: z.array(z.unknown()).min(1).max(100) })
    .safeParse(await request.json().catch(() => null));
  if (!body.success)
    return Response.json(
      { error: "Importa entre 1 y 100 filas por archivo." },
      { status: 400 },
    );
  const results: { row: number; status: string; message: string }[] = [];
  for (const [index, raw] of body.data.rows.entries()) {
    const parsed = submissionSchema.safeParse({
      contactEmail: access.user.email,
      ...(typeof raw === "object" && raw ? raw : {}),
    });
    if (
      !parsed.success ||
      !["startup", "opportunity"].includes(parsed.data.kind)
    ) {
      results.push({
        row: index + 1,
        status: "error",
        message: "Revisa tipo, nombre, título y URL de fuente.",
      });
      continue;
    }
    const { company: _company, ...data } = parsed.data;
    void _company;
    if (await duplicateSubmission(data.kind, data.sourceUrl, data.organizationName)) {
      results.push({
        row: index + 1,
        status: "duplicate",
        message: "Ya existe o está en revisión.",
      });
      continue;
    }
    try {
      await createSubmission({ ...data, userId: access.user.userId });
      results.push({
        row: index + 1,
        status: "created",
        message: "En cola de revisión.",
      });
    } catch (error) {
      if (String(error).includes("UNIQUE constraint"))
        results.push({
          row: index + 1,
          status: "duplicate",
          message: "Ya está en revisión.",
        });
      else throw error;
    }
  }
  return Response.json({ results });
}
