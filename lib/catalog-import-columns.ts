import {
  normalizeText,
  modalities,
  opportunityTypes,
} from "@/lib/catalog-types";

/*
 * Spreadsheet templates for loading complete records. Headers are matched
 * without accents, case or spaces, so "Descripción corta" and
 * "descripcion_corta" are the same column. Every record is created as a draft.
 */

type Column = { key: string; header: string; help: string; example: string };

export const startupColumns: Column[] = [
  {
    key: "name",
    header: "nombre",
    help: "Nombre público (obligatorio)",
    example: "Ruta Viva",
  },
  {
    key: "shortDescription",
    header: "descripcion_corta",
    help: "Una línea, 10 a 220 caracteres (obligatorio)",
    example: "Entregas de última milla para comercios de barrio.",
  },
  {
    key: "description",
    header: "descripcion",
    help: "Qué hace la startup, 20 caracteres o más (obligatorio)",
    example:
      "Ayuda a comercios pequeños a coordinar entregas y cobros desde el celular.",
  },
  {
    key: "industry",
    header: "industria",
    help: "Obligatorio",
    example: "Logística",
  },
  {
    key: "websiteUrl",
    header: "sitio_web",
    help: "Necesario para publicar",
    example: "https://rutaviva.bo",
  },
  {
    key: "sourceUrl",
    header: "fuente",
    help: "Página oficial que respalda los datos; necesaria para publicar",
    example: "https://rutaviva.bo/nosotros",
  },
  {
    key: "sourceLabel",
    header: "nombre_fuente",
    help: "Opcional",
    example: "Sitio oficial",
  },
  {
    key: "logoUrl",
    header: "logo",
    help: "Enlace a la imagen del logo (opcional)",
    example: "https://rutaviva.bo/logo.png",
  },
  { key: "city", header: "ciudad", help: "Opcional", example: "Santa Cruz" },
  { key: "stage", header: "etapa", help: "Opcional", example: "Semilla" },
  {
    key: "teamSize",
    header: "equipo",
    help: "Opcional",
    example: "11–25 personas",
  },
  {
    key: "remotePolicy",
    header: "modalidad_trabajo",
    help: "Opcional",
    example: "Híbrida",
  },
  {
    key: "foundedYear",
    header: "fundacion",
    help: "Año (opcional)",
    example: "2023",
  },
  {
    key: "verifiedAt",
    header: "comprobado",
    help: "Fecha de revisión; si falta, hoy",
    example: "25/09/2026",
  },
  {
    key: "slug",
    header: "enlace",
    help: "Opcional; se genera desde el nombre",
    example: "ruta-viva",
  },
];

export const opportunityColumns: Column[] = [
  {
    key: "organizationSlug",
    header: "startup",
    help: "Nombre o enlace de una startup ya cargada (obligatorio)",
    example: "Ruta Viva",
  },
  {
    key: "title",
    header: "titulo",
    help: "Obligatorio",
    example: "Desarrollador/a backend junior",
  },
  {
    key: "summary",
    header: "resumen",
    help: "Una línea, 10 a 300 caracteres (obligatorio)",
    example: "Construye funciones pequeñas con acompañamiento.",
  },
  {
    key: "description",
    header: "descripcion",
    help: "20 caracteres o más (obligatorio)",
    example: "Te sumarás a un equipo pequeño que publica cambios cada semana.",
  },
  {
    key: "type",
    header: "tipo",
    help: opportunityTypes.join(", "),
    example: "Empleo",
  },
  { key: "area", header: "area", help: "Obligatorio", example: "Ingeniería" },
  { key: "level", header: "nivel", help: "Obligatorio", example: "Junior" },
  {
    key: "modality",
    header: "modalidad",
    help: modalities.join(", "),
    example: "Remoto",
  },
  {
    key: "dedication",
    header: "dedicacion",
    help: "Obligatorio",
    example: "Tiempo completo",
  },
  {
    key: "compensation",
    header: "compensacion",
    help: "Monto, moneda y período (obligatorio)",
    example: "USD 1.000–1.400 / mes",
  },
  {
    key: "compensationType",
    header: "tipo_compensacion",
    help: "Pagada, Beca, Por definir o No pagada",
    example: "Pagada",
  },
  {
    key: "location",
    header: "ubicacion",
    help: "Opcional",
    example: "Santa Cruz",
  },
  {
    key: "countriesAccepted",
    header: "desde_donde",
    help: "Desde dónde se puede postular (opcional)",
    example: "Bolivia",
  },
  {
    key: "closesAt",
    header: "cierre",
    help: "Fecha de cierre (opcional)",
    example: "31/10/2026",
  },
  {
    key: "applicationMode",
    header: "postulacion",
    help: "externa (por defecto) o linkup",
    example: "externa",
  },
  {
    key: "applicationUrl",
    header: "enlace_postulacion",
    help: "Necesario para publicar si es externa",
    example: "https://rutaviva.bo/empleos/backend",
  },
  {
    key: "responsibilities",
    header: "responsabilidades",
    help: "Separadas por | o en líneas",
    example: "Construir funciones | Revisar métricas",
  },
  {
    key: "requirements",
    header: "requisitos",
    help: "Lo indispensable; separados por | o en líneas",
    example: "Bases de programación | Un proyecto propio",
  },
  {
    key: "desirable",
    header: "deseables",
    help: "Suma, pero no es requisito (opcional)",
    example: "Experiencia con SQL",
  },
  {
    key: "sourceUrl",
    header: "fuente",
    help: "Publicación oficial; necesaria para publicar",
    example: "https://rutaviva.bo/empleos",
  },
  {
    key: "sourceLabel",
    header: "nombre_fuente",
    help: "Opcional",
    example: "Aviso oficial",
  },
  {
    key: "verifiedAt",
    header: "comprobado",
    help: "Fecha de revisión; si falta, hoy",
    example: "25/09/2026",
  },
  {
    key: "slug",
    header: "enlace",
    help: "Opcional; se genera desde el título",
    example: "backend-junior-ruta-viva",
  },
];

export type ImportKind = "startup" | "opportunity";
export type ImportRow = Record<string, unknown>;
export type MappedRow =
  { ok: true; data: Record<string, unknown> } | { ok: false; errors: string[] };

export function normalizeHeader(header: string) {
  return normalizeText(header)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Which template a file follows, from its headers. */
export function detectKind(headers: string[]): ImportKind | null {
  const normalized = new Set(headers.map(normalizeHeader));
  if (normalized.has("titulo") && normalized.has("startup"))
    return "opportunity";
  if (normalized.has("nombre")) return "startup";
  return null;
}

export function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/, "");
}

/** CSV text of a template: headers only, with a UTF-8 BOM for Excel. */
export function templateCsv(kind: ImportKind) {
  const columns = kind === "startup" ? startupColumns : opportunityColumns;
  return `\uFEFF${columns.map((column) => column.header).join(",")}\n`;
}
