import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { organizationBySlug } from "@/lib/catalog";
import {
  approveSubmission,
  getSubmissionById,
  getUserRole,
  syncUser,
  updateSubmissionStatus,
} from "@/lib/user-data";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().trim().min(3).max(300),
  organizationSlug: z.string().min(1).max(120).optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  const role = await getUserRole(user.userId);
  if (role !== "admin" && role !== "curator")
    return NextResponse.json({ error: "No tienes acceso." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Decisión inválida." }, { status: 400 });
  if (
    parsed.data.organizationSlug &&
    !organizationBySlug(parsed.data.organizationSlug)
  ) {
    return NextResponse.json(
      { error: "La organización vinculada no existe." },
      { status: 400 },
    );
  }
  const submission = await getSubmissionById(parsed.data.id);
  if (!submission)
    return NextResponse.json(
      { error: "Envío no encontrado." },
      { status: 404 },
    );
  if (submission.status !== "pending")
    return NextResponse.json(
      { error: "Este envío ya fue revisado." },
      { status: 409 },
    );
  if (parsed.data.status === "approved" && submission.kind !== "claim")
    return NextResponse.json(
      { error: "Revisa y publica el registro desde el editor para aprobarlo." },
      { status: 400 },
    );
  if (parsed.data.status === "approved" && submission.kind === "claim") {
    if (role !== "admin")
      return NextResponse.json(
        { error: "Solo una persona administradora puede conceder acceso." },
        { status: 403 },
      );
    if (!submission.userId || !parsed.data.organizationSlug) {
      return NextResponse.json(
        {
          error:
            "La reclamación requiere una cuenta y una organización vinculadas. Verifica la representación antes de conceder acceso.",
        },
        { status: 400 },
      );
    }
  }
  if (parsed.data.status === "approved") {
    const found = await approveSubmission(
      user.userId,
      parsed.data.id,
      parsed.data.reason,
      parsed.data.organizationSlug,
    );
    if (!found)
      return NextResponse.json(
        { error: "Envío no encontrado." },
        { status: 404 },
      );
  } else {
    const updated = await updateSubmissionStatus(
      user.userId,
      parsed.data.id,
      parsed.data.status,
      parsed.data.reason,
    );
    if (!updated)
      return NextResponse.json(
        { error: "Este envío ya fue revisado." },
        { status: 409 },
      );
  }
  return NextResponse.json({ ok: true });
}
