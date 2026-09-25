import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { normalizedAlertQuery, listNotifications } from "@/lib/alerts";
import { getSqlite } from "@/db";
import {
  createSavedSearch,
  deleteSavedSearch,
  listSavedSearches,
  syncUser,
} from "@/lib/user-data";

const createSchema = z.object({
  label: z.string().trim().min(2).max(80),
  query: z
    .record(z.string(), z.string().max(120))
    .refine((value) => Object.keys(value).length <= 10),
  frequency: z.enum(["diaria", "semanal"]),
});

const deleteSchema = z.object({ id: z.string().uuid() });

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  return NextResponse.json({
    alerts: await listSavedSearches(user.userId),
    notifications: listNotifications(user.userId),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Revisa los datos de la alerta." },
      { status: 400 },
    );
  await syncUser(user);
  const query = normalizedAlertQuery(parsed.data.query);
  const existing = await listSavedSearches(user.userId);
  if (
    existing.some(
      (row) =>
        JSON.stringify(normalizedAlertQuery(JSON.parse(row.queryJson))) ===
        JSON.stringify(query),
    )
  )
    return NextResponse.json(
      { error: "Ya guardaste una alerta con estos filtros." },
      { status: 409 },
    );
  if (existing.length >= 20)
    return NextResponse.json(
      {
        error:
          "Puedes guardar hasta 20 alertas. Elimina una antes de crear otra.",
      },
      { status: 409 },
    );
  const id = await createSavedSearch({
    userId: user.userId,
    ...parsed.data,
    query,
  });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Alerta inválida." }, { status: 400 });
  await syncUser(user);
  await deleteSavedSearch(user.userId, parsed.data.id);
  getSqlite()
    .prepare("DELETE FROM alert_notifications WHERE search_id=? AND user_id=?")
    .run(parsed.data.id, user.userId);
  return NextResponse.json({ ok: true });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  getSqlite()
    .prepare(
      "UPDATE alert_notifications SET read_at=? WHERE user_id=? AND read_at IS NULL",
    )
    .run(new Date().toISOString(), user.userId);
  return NextResponse.json({ ok: true });
}
