"use client";
import { useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { Download, FileUp } from "lucide-react";
import { clientRequest } from "@/lib/client-request";
import {
  detectKind,
  normalizeHeader,
  opportunityColumns,
  startupColumns,
  type ImportKind,
} from "@/lib/catalog-import-columns";
import { Badge } from "@/components/ui/badge";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";

type Result = {
  row: number;
  status: "created" | "duplicate" | "error";
  message: string;
  slug?: string;
};

const kindLabel: Record<ImportKind, string> = {
  startup: "startups",
  opportunity: "vacantes",
};

function cell(row: Record<string, unknown>, header: string) {
  const entry = Object.entries(row).find(
    ([key]) => normalizeHeader(key) === header,
  );
  return entry ? String(entry[1] ?? "").trim() : "";
}

function ColumnTable({ columns }: { columns: typeof startupColumns }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="font-meta text-xs tracking-[0.06em] text-muted uppercase">
          <tr>
            <th className="py-2 pr-4 font-semibold">Columna</th>
            <th className="py-2 pr-4 font-semibold">Qué va</th>
            <th className="py-2 font-semibold">Ejemplo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {columns.map((column) => (
            <tr key={column.header}>
              <td className="py-2 pr-4 align-top font-meta font-semibold whitespace-nowrap text-ink">
                {column.header}
              </td>
              <td className="py-2 pr-4 align-top text-body">{column.help}</td>
              <td className="py-2 align-top text-muted">{column.example}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Loads complete startups or openings from a template, as drafts. */
export function CatalogRecordsImport() {
  const [kind, setKind] = useState<ImportKind | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  async function read(file?: File) {
    setRows([]);
    setKind(null);
    setResults([]);
    setError("");
    if (!file) return;
    if (file.size > 1_000_000) {
      setError("El archivo no puede superar 1 MB.");
      return;
    }
    const text = await file.text();
    if (text.includes("�")) {
      setError(
        "El archivo no está en UTF-8 y se perderían los acentos. En Excel usa «Guardar como → CSV UTF-8»; en Google Sheets, «Descargar → Valores separados por comas».",
      );
      return;
    }
    const csv = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: "greedy",
    });
    const detected = detectKind(csv.meta.fields ?? []);
    if (!detected) {
      setError(
        "No reconocemos las columnas. Usa la plantilla de startups o la de vacantes.",
      );
      return;
    }
    if (csv.errors.length) {
      setError(
        `La fila ${(csv.errors[0].row ?? 0) + 2} tiene un formato que no pudimos leer. Revisa comillas y separadores.`,
      );
      return;
    }
    if (!csv.data.length || csv.data.length > 100) {
      setError("Cada archivo debe tener entre 1 y 100 filas.");
      return;
    }
    setKind(detected);
    setRows(csv.data);
  }

  async function submit() {
    if (!kind) return;
    setBusy(true);
    setError("");
    const response = await clientRequest("/api/admin/catalog-import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind, rows }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      results?: Result[];
    };
    setBusy(false);
    if (!response.ok || !data.results) {
      setError(data.error ?? "No se pudo importar.");
      return;
    }
    setResults(data.results);
    setRows([]);
  }

  const created = results.filter((item) => item.status === "created").length;
  const duplicates = results.filter(
    (item) => item.status === "duplicate",
  ).length;
  const failed = results.length - created - duplicates;

  return (
    <div className="grid gap-6">
      <ol className="grid gap-3 text-[15px] leading-6 text-body sm:grid-cols-3">
        {[
          <>
            Descarga las plantillas y llénalas en Excel o Google Sheets.
            <span className="mt-3 flex flex-wrap gap-2">
              <a
                className={buttonClass({ variant: "secondary", size: "sm" })}
                href="/api/admin/catalog-import?plantilla=startups"
              >
                <Download className="size-4" aria-hidden="true" />
                Startups
              </a>
              <a
                className={buttonClass({ variant: "secondary", size: "sm" })}
                href="/api/admin/catalog-import?plantilla=vacantes"
              >
                <Download className="size-4" aria-hidden="true" />
                Vacantes
              </a>
            </span>
          </>,
          "Sube primero la hoja de startups y después la de vacantes: cada vacante se une a su startup por nombre.",
          "Todo queda como borrador. Revísalo y publícalo desde el Catálogo.",
        ].map((step, index) => (
          <li
            className="rounded-panel border border-line bg-paper p-4"
            key={index}
          >
            <span className="font-meta text-xs font-bold tracking-[0.08em] text-muted">
              PASO {index + 1}
            </span>
            <span className="mt-1 block">{step}</span>
          </li>
        ))}
      </ol>

      <label className="grid cursor-pointer place-items-center gap-2 rounded-panel border-2 border-dashed border-line-strong bg-paper px-6 py-10 text-center transition-colors hover:border-action/50 hover:bg-action/5 has-[:disabled]:cursor-not-allowed">
        <FileUp className="size-6 text-action" aria-hidden="true" />
        <span className="font-semibold">
          Subir hoja de startups o de vacantes
        </span>
        <span className="text-sm text-muted">
          Archivo CSV, hasta 100 filas. Detectamos cuál es por sus columnas.
        </span>
        <input
          className="sr-only"
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={(event) => void read(event.target.files?.[0])}
        />
      </label>

      <FormError>{error}</FormError>

      {kind && rows.length > 0 && (
        <section className="grid gap-4 rounded-panel border border-line bg-paper p-5 sm:p-6">
          <h3 className="text-base font-semibold">
            Hoja de {kindLabel[kind]} · {rows.length}{" "}
            {rows.length === 1 ? "fila" : "filas"}
          </h3>
          <ol className="grid gap-1.5 text-sm text-body">
            {rows.slice(0, 8).map((row, index) => (
              <li key={index}>
                <span className="font-meta text-muted">Fila {index + 2}.</span>{" "}
                {kind === "startup"
                  ? cell(row, "nombre") || "Sin nombre"
                  : `${cell(row, "titulo") || "Sin título"} · ${cell(row, "startup") || "sin startup"}`}
              </li>
            ))}
          </ol>
          {rows.length > 8 && (
            <p className="text-[13px] text-muted">Y {rows.length - 8} más.</p>
          )}
          <button
            className={buttonClass({ className: "sm:justify-self-start" })}
            type="button"
            onClick={submit}
            disabled={busy}
          >
            {busy
              ? "Creando…"
              : `Crear ${rows.length} ${rows.length === 1 ? "borrador" : "borradores"}`}
          </button>
        </section>
      )}

      {results.length > 0 && (
        <section
          className="grid gap-3 rounded-panel border border-line bg-paper p-5 sm:p-6"
          role="status"
        >
          <h3 className="text-base font-semibold">
            {created} {created === 1 ? "borrador creado" : "borradores creados"}
            {duplicates > 0 && ` · ${duplicates} ya existían`}
            {failed > 0 && ` · ${failed} con errores`}
          </h3>
          <ul className="grid gap-2.5 text-sm">
            {results.map((item) => (
              <li
                className="flex flex-wrap items-baseline gap-2"
                key={item.row}
              >
                <span className="font-meta text-muted">Fila {item.row}</span>
                <Badge
                  tone={
                    item.status === "created"
                      ? "success"
                      : item.status === "duplicate"
                        ? "neutral"
                        : "danger"
                  }
                >
                  {item.status === "created"
                    ? "Borrador"
                    : item.status === "duplicate"
                      ? "Ya existe"
                      : "Error"}
                </Badge>
                <span className="text-body">{item.message}</span>
                {item.slug && (
                  <Link
                    className={textLinkClass}
                    href={`/admin/catalogo/editar?tipo=${kind}&slug=${item.slug}`}
                  >
                    Revisar
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <Link className={`${textLinkClass} text-sm`} href="/admin/catalogo">
            Ir al catálogo para publicar
          </Link>
        </section>
      )}

      <details className="rounded-control border border-line bg-paper">
        <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold">
          Qué va en cada columna
        </summary>
        <div className="grid gap-6 border-t border-line px-4 py-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Hoja de startups</h3>
            <ColumnTable columns={startupColumns} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Hoja de vacantes</h3>
            <ColumnTable columns={opportunityColumns} />
          </div>
          <p className="text-[13px] text-muted">
            Los títulos de columna no distinguen tildes ni mayúsculas. Las
            fechas pueden ir como 25/09/2026 o 2026-09-25. Para publicar, una
            startup necesita sitio web y fuente; una vacante externa, fuente y
            enlace para postular.
          </p>
        </div>
      </details>
    </div>
  );
}
