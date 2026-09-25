import { getCurrentUser } from "@/lib/session";
import { getUserRole, syncUser } from "@/lib/user-data";

export async function apiOperator() {
  const user = await getCurrentUser();
  if (!user)
    return {
      error: Response.json({ error: "Debes ingresar." }, { status: 401 }),
    };
  await syncUser(user);
  const role = await getUserRole(user.userId);
  if (role !== "admin" && role !== "curator")
    return {
      error: Response.json({ error: "No tienes acceso." }, { status: 403 }),
    };
  return { user, role };
}
