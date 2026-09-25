import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import {
  opportunityBySlug,
  isOpportunityOpen,
  organizationForOpportunity,
} from "@/lib/catalog";
import {
  createApplication,
  getProfile,
  listApplications,
  profileReadiness,
  syncUser,
  updateApplicationStatus,
} from "@/lib/user-data";

const createSchema = z.object({
  opportunitySlug: z.string().min(1).max(160),
  answers: z.array(z.string().trim().max(800)).max(3).default([]),
  consent: z.boolean().default(false),
});

const updateSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    "contactada",
    "entrevista",
    "oferta",
    "seleccionada",
    "no_continua",
    "retirada",
    "sin_respuesta",
  ]),
  note: z.string().trim().max(400).default(""),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  return NextResponse.json({
    applications: await listApplications(user.userId),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  const opportunity = parsed.success
    ? opportunityBySlug(parsed.data.opportunitySlug)
    : null;
  if (!parsed.success || !opportunity) {
    return NextResponse.json(
      { error: "No encontramos esta oportunidad." },
      { status: 400 },
    );
  }
  if (
    !isOpportunityOpen(opportunity) ||
    organizationForOpportunity(opportunity)?.status !== "published"
  )
    return NextResponse.json(
      { error: "Esta oportunidad ya no recibe postulaciones." },
      { status: 409 },
    );
  if (
    opportunity.applicationMode === "native" &&
    (!parsed.data.consent ||
      parsed.data.answers.length < 2 ||
      !parsed.data.answers[0] ||
      !parsed.data.answers[1])
  )
    return NextResponse.json(
      {
        error:
          "Responde las dos preguntas obligatorias y autoriza compartir tu información.",
      },
      { status: 400 },
    );
  await syncUser(user);
  const profile = await getProfile(user.userId);
  if (
    opportunity.applicationMode === "native" &&
    !profileReadiness(profile).readyToApply
  ) {
    return NextResponse.json(
      {
        error: "Completa los datos esenciales de tu perfil antes de postular.",
        code: "PROFILE_INCOMPLETE",
      },
      { status: 409 },
    );
  }
  const result = await createApplication({
    userId: user.userId,
    opportunitySlug: opportunity.slug,
    mode: opportunity.applicationMode,
    answers: parsed.data.answers,
    profile,
  });
  return NextResponse.json(
    { ok: true, created: result.created, application: result.application },
    { status: result.created ? 201 : 200 },
  );
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  await syncUser(user);
  const ownApplications = await listApplications(user.userId);
  const application = ownApplications.find(
    (item) => item.id === parsed.data.applicationId,
  );
  if (!application)
    return NextResponse.json(
      { error: "Postulación no encontrada." },
      { status: 404 },
    );
  if (application.mode === "native" && parsed.data.status !== "retirada") {
    return NextResponse.json(
      { error: "La organización actualiza este proceso. Tú puedes retirarlo." },
      { status: 403 },
    );
  }
  const updated = await updateApplicationStatus(
    user.userId,
    parsed.data.applicationId,
    parsed.data.status,
    parsed.data.note,
  );
  if (!updated)
    return NextResponse.json(
      { error: "Este proceso ya está cerrado." },
      { status: 409 },
    );
  return NextResponse.json({ ok: true });
}
