import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { opportunityBySlug } from "@/lib/catalog";
import {
  listSavedOpportunitySlugs,
  setOpportunitySaved,
  syncUser,
} from "@/lib/user-data";

const saveSchema = z.object({
  opportunitySlug: z.string().min(1).max(160),
  save: z.boolean(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  return NextResponse.json({
    slugs: await listSavedOpportunitySlugs(user.userId),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !await opportunityBySlug(parsed.data.opportunitySlug)) {
    return NextResponse.json(
      { error: "Oportunidad inválida." },
      { status: 400 },
    );
  }
  await syncUser(user);
  await setOpportunitySaved(
    user.userId,
    parsed.data.opportunitySlug,
    parsed.data.save,
  );
  return NextResponse.json({ ok: true, saved: parsed.data.save });
}
