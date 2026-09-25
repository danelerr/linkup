import { getCurrentUser } from "@/lib/session";
import { exportUserData, syncUser } from "@/lib/user-data";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  const payload = await exportUserData(user.userId);
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": "attachment; filename=mis-datos-linkup.json",
      "cache-control": "private, no-store",
    },
  });
}
