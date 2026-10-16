import "./env";
import { readFileSync } from "node:fs";
import Papa from "papaparse";
import { closeDb } from "../db/index";
import { detectKind, importCatalogRows } from "../lib/catalog-import";

// Loads the same spreadsheet templates as /admin/importar from the terminal,
// without the 100-row limit. Every record is created as a draft attributed to
// "system"; an operator reviews and publishes it in /admin/catalogo.
const files = process.argv.slice(2);
if (!files.length)
  throw new Error(
    "Uso: npm run importar -- datos/catalogo/startups.csv datos/catalogo/vacantes.csv",
  );

const sheets = files.map((file) => {
  const text = readFileSync(file, "utf8");
  if (text.includes("�"))
    throw new Error(`${file}: no está en UTF-8; guárdalo como CSV UTF-8.`);
  const csv = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: "greedy",
  });
  const kind = detectKind(csv.meta.fields ?? []);
  if (!kind)
    throw new Error(
      `${file}: no reconocemos las columnas; usa la plantilla de startups o la de vacantes.`,
    );
  if (csv.errors.length)
    throw new Error(
      `${file}: la fila ${(csv.errors[0].row ?? 0) + 2} tiene un formato que no pudimos leer.`,
    );
  return { file, kind, rows: csv.data };
});

// Openings point at startups, so startups go first whatever the order given.
sheets.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "startup" ? -1 : 1));

let failed = 0;
for (const sheet of sheets) {
  const results = await importCatalogRows("system", sheet.kind, sheet.rows);
  const created = results.filter((result) => result.status === "created");
  const duplicates = results.filter((result) => result.status === "duplicate");
  const errors = results.filter((result) => result.status === "error");
  failed += errors.length;
  console.log(
    `${sheet.file}: ${created.length} borradores creados, ${duplicates.length} ya existían, ${errors.length} con errores.`,
  );
  for (const result of [...duplicates, ...errors])
    console.log(`  fila ${result.row}: ${result.message}`);
}
await closeDb();
if (failed) process.exitCode = 1;
else console.log("Revisa y publica los borradores en /admin/catalogo.");
