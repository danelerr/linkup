import { z } from "zod";
import { organizationBySlug } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/session";
import {
  findAccountByEmail,
  hasOrganizationOwnerAccess,
  removeOrganizationMember,
  saveOrganizationMember,
  syncUser,
} from "@/lib/user-data";

// A Response body can be read once, so build a new one per request.
const lastOwner = () =>
  Response.json(
    { error: "La startup necesita al menos una persona responsable." },
    { status: 409 },
  );

/** The startup's owners (or an administrator) manage its team. */
async function authorize(organizationSlug: string) {
  const user = await getCurrentUser();
  if (!user)
    return {
      error: Response.json({ error: "Debes ingresar." }, { status: 401 }),
    };
  await syncUser(user);
  if (!await organizationBySlug(organizationSlug, true))
    return {
      error: Response.json(
        { error: "No encontramos esa startup." },
        { status: 404 },
      ),
    };
  if (!(await hasOrganizationOwnerAccess(user.userId, organizationSlug)))
    return {
      error: Response.json(
        { error: "Solo las personas responsables gestionan el equipo." },
        { status: 403 },
      ),
    };
  return { user };
}

const saveSchema = z.object({
  organizationSlug: z.string().min(1).max(120),
  email: z.email().max(200),
  memberRole: z.enum(["owner", "recruiter", "viewer"]),
});

export async function POST(request: Request) {
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Revisa el correo y el rol." },
      { status: 400 },
    );
  const access = await authorize(parsed.data.organizationSlug);
  if (access.error) return access.error;
  const account = await findAccountByEmail(parsed.data.email);
  if (!account)
    return Response.json(
      {
        error:
          "No encontramos una cuenta con ese correo. Pídele que la cree primero en LinkUp.",
      },
      { status: 404 },
    );
  const result = await saveOrganizationMember(
    access.user.userId,
    parsed.data.organizationSlug,
    account.id,
    parsed.data.memberRole,
  );
  if (result === "last_owner") return lastOwner();
  return Response.json(
    { ok: true, result },
    { status: result === "added" ? 201 : 200 },
  );
}

const removeSchema = z.object({
  organizationSlug: z.string().min(1).max(120),
  userId: z.string().min(1).max(200),
});

export async function DELETE(request: Request) {
  const parsed = removeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  const access = await authorize(parsed.data.organizationSlug);
  if (access.error) return access.error;
  const result = await removeOrganizationMember(
    access.user.userId,
    parsed.data.organizationSlug,
    parsed.data.userId,
  );
  if (result === "last_owner") return lastOwner();
  if (result === "not_found")
    return Response.json(
      { error: "Esa persona ya no está en el equipo." },
      { status: 404 },
    );
  return Response.json({ ok: true });
}
