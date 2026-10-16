import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  createSubmission,
  syncUser,
  tooManyRecentSubmissions,
} from "@/lib/user-data";
import { submissionSchema } from "@/lib/submission-input";
import { duplicateSubmission } from "@/lib/submission-ingest";

export async function POST(request: Request) {
  // Every proposal is tied to an account, which is also its contact address.
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { error: "Ingresa a tu cuenta para proponer información." },
      { status: 401 },
    );
  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(
    body && typeof body === "object"
      ? { ...body, contactEmail: user.email }
      : body,
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa los datos y la fuente oficial." },
      { status: 400 },
    );
  }
  await syncUser(user);
  const { company: _company, ...data } = parsed.data;
  void _company;
  if (await duplicateSubmission(data.kind, data.sourceUrl, data.organizationName))
    return NextResponse.json(
      {
        error:
          "Esta fuente ya está registrada o en revisión. Puedes enviar una corrección si cambió.",
      },
      { status: 409 },
    );
  if (await tooManyRecentSubmissions(user.userId)) {
    return NextResponse.json(
      {
        error:
          "Llegaste al límite de 5 envíos por día. Intenta de nuevo mañana.",
      },
      { status: 429 },
    );
  }
  try {
    const id = await createSubmission({
      userId: user.userId,
      ...data,
    });
    return NextResponse.json(
      { ok: true, id, status: "pending" },
      { status: 201 },
    );
  } catch (error) {
    if (String(error).includes("UNIQUE constraint"))
      return NextResponse.json(
        { error: "Esta fuente ya está en revisión." },
        { status: 409 },
      );
    throw error;
  }
}
