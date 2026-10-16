import { apiOperator } from "@/lib/api-operator";
import {
  CatalogError,
  catalogEditSchema,
  saveCatalogEntry,
} from "@/lib/catalog-editor";

export async function POST(request: Request) {
  const access = await apiOperator();
  if (access.error) return access.error;
  const input = catalogEditSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!input.success)
    return Response.json(
      { error: "Revisa el registro y añade un motivo." },
      { status: 400 },
    );
  try {
    return Response.json({
      ok: true,
      ...(await saveCatalogEntry(access.user.userId, input.data)),
    });
  } catch (error) {
    if (error instanceof CatalogError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error("catalog.save", error);
    return Response.json(
      { error: "No se pudo guardar. El registro anterior se conservó." },
      { status: 500 },
    );
  }
}
