import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { deleteUserData, syncUser } from "@/lib/user-data";

const deleteSchema = z.object({ confirmation: z.literal("ELIMINAR") });

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Escribe ELIMINAR para confirmar." },
      { status: 400 },
    );
  await syncUser(user);
  await deleteUserData(user.userId);
  return Response.json({ ok: true, signOutPath: "/" });
}
