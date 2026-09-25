import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import {
  opportunitiesForOrganization,
  organizationBySlug,
} from "@/lib/catalog";
import {
  hasOrganizationCandidateAccess,
  syncUser,
  updateOrganizationApplicationStatus,
} from "@/lib/user-data";

const schema = z.object({
  applicationId: z.string().uuid(),
  organizationSlug: z.string().min(1).max(120),
  status: z.enum([
    "vista",
    "contactada",
    "entrevista",
    "oferta",
    "seleccionada",
    "no_continua",
  ]),
  note: z.string().trim().max(400).default(""),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !organizationBySlug(parsed.data.organizationSlug))
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  await syncUser(user);
  if (
    !(await hasOrganizationCandidateAccess(
      user.userId,
      parsed.data.organizationSlug,
    ))
  )
    return NextResponse.json(
      { error: "No tienes acceso a candidatos de esta organización." },
      { status: 403 },
    );
  const opportunitySlugs = opportunitiesForOrganization(
    parsed.data.organizationSlug,
    true,
  ).map((item) => item.slug);
  const updated = await updateOrganizationApplicationStatus(
    user.userId,
    parsed.data.applicationId,
    parsed.data.organizationSlug,
    opportunitySlugs,
    parsed.data.status,
    parsed.data.note,
  );
  if (!updated)
    return NextResponse.json(
      { error: "No se puede actualizar esta postulación." },
      { status: 409 },
    );
  return NextResponse.json({ ok: true });
}
