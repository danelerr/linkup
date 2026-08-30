import { NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getProfile, syncUser, updateProfile } from "@/lib/user-data";
import { httpUrlSchema } from "@/lib/validation";

const profileSchema = z.object({
  objective: z.string().trim().max(100),
  city: z.string().trim().max(80),
  country: z.string().trim().max(80),
  modality: z.enum(["", "Remoto", "Híbrido", "Presencial", "Flexible"]),
  availability: z.string().trim().max(100),
  skills: z.array(z.string().trim().min(1).max(40)).max(12),
  bio: z.string().trim().max(800),
  portfolioUrl: z.union([z.literal(""), httpUrlSchema]),
  privacy: z.enum(["private", "applications"]),
  isAdult: z.boolean(),
});

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  await syncUser(user);
  return NextResponse.json({ profile: await getProfile(user.userId) });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Debes ingresar." }, { status: 401 });
  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los campos del perfil.", details: parsed.error.flatten() }, { status: 400 });
  }
  await syncUser(user);
  await updateProfile(user.userId, parsed.data);
  return NextResponse.json({ ok: true, profile: await getProfile(user.userId) });
}
