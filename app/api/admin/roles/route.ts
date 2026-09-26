import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import {
  findAccountByEmail,
  getUserRole,
  setUserRole,
  syncUser,
} from "@/lib/user-data";

const schema = z.object({
  email: z.email().max(200),
  role: z.enum(["talent", "curator", "admin"]),
});

/** Only administrators name curators or other administrators. */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  if ((await getUserRole(user.userId)) !== "admin")
    return Response.json(
      { error: "Solo una persona administradora puede cambiar roles." },
      { status: 403 },
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Revisa el correo y el rol." },
      { status: 400 },
    );
  const account = await findAccountByEmail(parsed.data.email);
  if (!account)
    return Response.json(
      {
        error:
          "No encontramos una cuenta con ese correo. La persona debe crearla primero.",
      },
      { status: 404 },
    );
  // Nobody changes their own role, so at least one administrator remains.
  if (account.id === user.userId)
    return Response.json(
      { error: "No puedes cambiar tu propio rol." },
      { status: 409 },
    );
  await setUserRole(user.userId, account.id, parsed.data.role);
  return Response.json({ ok: true });
}
