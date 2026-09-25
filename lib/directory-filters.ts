export type DirectoryFilters = {
  q: string;
  industria: string;
  area: string;
  tipo: string;
  modalidad: string;
  nivel: string;
  abiertas: string;
  orden: string;
  pagina: number;
};
export function parseFilters(
  values: Record<string, string | string[] | undefined>,
): DirectoryFilters {
  const text = (key: string) =>
    typeof values[key] === "string" ? values[key].trim().slice(0, 120) : "";
  return {
    q: text("q"),
    industria: text("industria"),
    area: text("area"),
    tipo: text("tipo"),
    modalidad: text("modalidad"),
    nivel: text("nivel"),
    abiertas: text("abiertas") === "1" ? "1" : "",
    orden: text("orden") === "nombre" ? "nombre" : "recientes",
    pagina: Math.floor(
      Math.max(1, Math.min(10000, Number(text("pagina")) || 1)),
    ),
  };
}
export function filterParams(filters: Partial<DirectoryFilters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters))
    if (
      value &&
      !(key === "pagina" && value === 1) &&
      !(key === "orden" && value === "recientes")
    )
      params.set(key, String(value));
  return params;
}
export function directoryHref(filters: Partial<DirectoryFilters>) {
  const query = filterParams(filters).toString();
  return query ? `/?${query}` : "/";
}
