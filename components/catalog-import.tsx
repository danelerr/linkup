"use client";
import { useState } from "react";
import Papa from "papaparse";
import { FileUp } from "lucide-react";
import { clientRequest } from "@/lib/client-request";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";

const resultTone = {
  created: "success",
  duplicate: "neutral",
  error: "danger",
} as const;

export function CatalogImport() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<
    { row: number; status: string; message: string }[]
  >([]);
  async function read(file?: File) {
    setRows([]);
    setResults([]);
    setError("");
    if (!file) return;
    if (file.size > 1000000) {
      setError("El archivo no puede superar 1 MB.");
      return;
    }
    try {
      const text = await file.text();
      let parsed: unknown;
      if (file.name.toLowerCase().endsWith(".json")) parsed = JSON.parse(text);
      else {
        const csv = Papa.parse<Record<string, unknown>>(text, {
          header: true,
          skipEmptyLines: "greedy",
        });
        if (csv.errors.length)
          throw new Error("El CSV tiene filas o encabezados mal formados.");
        parsed = csv.data;
      }
      if (
        !Array.isArray(parsed) ||
        !parsed.length ||
        parsed.length > 100 ||
        parsed.some(
          (row) => !row || typeof row !== "object" || Array.isArray(row),
        )
      )
        throw new Error("Usa una lista de 1 a 100 registros.");
      setRows(parsed);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No pudimos leer el archivo.",
      );
    }
  }
  async function submit() {
    setBusy(true);
    setError("");
    const response = await clientRequest("/api/admin/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "No se pudo importar.");
      return;
    }
    setResults(data.results);
    setRows([]);
  }
  const code =
    "rounded bg-surface px-1.5 py-0.5 font-meta text-[13px] text-ink";
  return (
    <div className="grid gap-6">
      <label className="grid cursor-pointer place-items-center gap-2 rounded-panel border-2 border-dashed border-line-strong bg-paper px-6 py-10 text-center transition-colors hover:border-action/50 hover:bg-action/5 has-[:disabled]:cursor-not-allowed">
        <FileUp className="size-6 text-action" aria-hidden="true" />
        <span className="font-semibold">Seleccionar archivo CSV o JSON</span>
        <span className="text-sm text-muted">
          Hasta 100 registros y 1 MB. Los duplicados se omiten.
        </span>
        <input
          className="sr-only"
          type="file"
          accept=".csv,.json,text/csv,application/json"
          disabled={busy}
          onChange={(event) => void read(event.target.files?.[0])}
        />
      </label>
      <details className="rounded-control border border-line bg-paper">
        <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold">
          Formato de las columnas
        </summary>
        <div className="grid gap-2 border-t border-line px-4 py-4 text-sm leading-7 text-body">
          <p>
            <code className={code}>kind</code>: startup u opportunity.{" "}
            <code className={code}>organizationName</code>: nombre.{" "}
            <code className={code}>sourceUrl</code>: fuente oficial. Para
            oportunidades: <code className={code}>opportunityTitle</code>.
          </p>
          <p>
            Opcionales: <code className={code}>websiteUrl</code>,{" "}
            <code className={code}>notes</code>,{" "}
            <code className={code}>contactEmail</code>.
          </p>
          <p className="text-muted">
            No se visitan los enlaces ni se descarga contenido automáticamente.
          </p>
        </div>
      </details>
      <FormError>{error}</FormError>
      {rows.length > 0 && (
        <section className="grid gap-4 rounded-panel border border-line bg-paper p-5 sm:p-6">
          <h2 className="text-base font-semibold">
            Vista previa · {rows.length} registros
          </h2>
          <ol className="grid gap-1.5 text-sm text-body">
            {rows.slice(0, 10).map((row, index) => (
              <li key={index}>
                <span className="font-meta text-muted">{index + 1}.</span>{" "}
                {String(row.organizationName || "Sin nombre")} ·{" "}
                {String(row.opportunityTitle || row.kind || "Sin tipo")}
              </li>
            ))}
          </ol>
          {rows.length > 10 && (
            <p className="text-[13px] text-muted">Y {rows.length - 10} más.</p>
          )}
          <button
            className={buttonClass({ className: "sm:justify-self-start" })}
            type="button"
            onClick={submit}
            disabled={busy}
          >
            {busy ? "Importando…" : "Enviar a revisión"}
          </button>
        </section>
      )}
      {results.length > 0 && (
        <section
          className="grid gap-3 rounded-panel border border-line bg-paper p-5 sm:p-6"
          role="status"
        >
          <h2 className="text-base font-semibold">
            {results.filter((row) => row.status === "created").length} enviados
            a revisión
          </h2>
          <ul className="grid gap-2 text-sm">
            {results.map((row) => (
              <li className="flex flex-wrap items-center gap-2" key={row.row}>
                <span className="font-meta text-muted">Fila {row.row}</span>
                <Badge
                  tone={
                    resultTone[row.status as keyof typeof resultTone] ??
                    "neutral"
                  }
                >
                  {row.status === "created"
                    ? "En revisión"
                    : row.status === "duplicate"
                      ? "Duplicado"
                      : "Error"}
                </Badge>
                <span className="text-body">{row.message}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
