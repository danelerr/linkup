import { NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  createSavedSearch,
  deleteSavedSearch,
  listSavedSearches,
  syncUser,
} from "@/lib/user-data";

const createSchema = z.object({
  label: z.string().trim().min(2).max(80),
  query: z.record(z.string(), z.string().max(120)).refine((value) => Object.keys(value).length <= 10),
  frequency: z.enum(["diaria", "semanal"]),
});

const deleteSchema = z.object({ id: z.string().uuid() });

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  return NextResponse.json({ alerts: await listSavedSearches(user.userId) });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos de la alerta." }, { status: 400 });
  await syncUser(user);
  const id = await createSavedSearch({ userId: user.userId, ...parsed.data });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Alerta inválida." }, { status: 400 });
  await syncUser(user);
  await deleteSavedSearch(user.userId, parsed.data.id);
  return NextResponse.json({ ok: true });
}
