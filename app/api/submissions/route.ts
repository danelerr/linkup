import { NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { createSubmission, syncUser, tooManyRecentSubmissions } from "@/lib/user-data";
import { httpUrlSchema } from "@/lib/validation";

const submissionSchema = z.object({
  kind: z.enum(["startup", "opportunity", "claim", "correction"]),
  contactEmail: z.email().max(200).transform((email) => email.toLocaleLowerCase()),
  organizationName: z.string().trim().min(2).max(120),
  websiteUrl: z.union([z.literal(""), httpUrlSchema]),
  opportunityTitle: z.string().trim().max(160),
  sourceUrl: httpUrlSchema,
  notes: z.string().trim().max(1200),
  company: z.literal("").optional(),
});

export async function POST(request: Request) {
  const parsed = submissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los datos y la fuente oficial." }, { status: 400 });
  }
  const user = await getChatGPTUser();
  if (user) await syncUser(user);
  const { company: _company, ...data } = parsed.data;
  void _company;
  if (await tooManyRecentSubmissions(data.contactEmail)) {
    return NextResponse.json({ error: "Recibimos varios envíos de este correo. Intenta de nuevo mañana." }, { status: 429 });
  }
  const id = await createSubmission({
    userId: user?.userId ?? null,
    ...data,
  });
  return NextResponse.json({ ok: true, id, status: "pending" }, { status: 201 });
}
