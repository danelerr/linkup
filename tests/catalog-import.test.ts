import assert from "node:assert/strict";
import test from "node:test";
import {
  detectKind,
  mapOpportunityRow,
  mapStartupRow,
  normalizeHeader,
  templateCsv,
} from "../lib/catalog-import";

const today = "2026-09-25";

test("spreadsheet headers match without accents, case or spaces", () => {
  assert.equal(normalizeHeader(" Descripción corta "), "descripcion_corta");
  assert.equal(detectKind(["Nombre", "Industria"]), "startup");
  assert.equal(detectKind(["Startup", "Título", "Resumen"]), "opportunity");
  assert.equal(detectKind(["columna"]), null);
  assert.ok(templateCsv("startup").startsWith("\uFEFFnombre,descripcion_corta"));
});

test("a startup row becomes a draft with generated link, initials and ISO date", () => {
  const mapped = mapStartupRow(
    {
      Nombre: "Ruta Viva",
      "Descripción corta": "Entregas de última milla para comercios.",
      Descripción: "Ayuda a comercios pequeños a coordinar entregas y cobros.",
      Industria: "Logística",
      "Sitio web": "https://rutaviva.example.com",
      Fundación: "2023",
      Comprobado: "5/9/2026",
    },
    today,
  );
  assert.equal(mapped.ok, true);
  if (!mapped.ok) return;
  assert.equal(mapped.data.slug, "ruta-viva");
  assert.equal(mapped.data.monogram, "RV");
  assert.equal(mapped.data.status, "draft");
  assert.equal(mapped.data.verifiedAt, "2026-09-05");
  assert.equal(mapped.data.foundedYear, 2023);
});

test("row errors name the spreadsheet column in Spanish", () => {
  const mapped = mapStartupRow(
    {
      nombre: "Ruta Viva",
      descripcion_corta: "Corta",
      industria: "Logística",
      sitio_web: "rutaviva.bo",
    },
    today,
  );
  assert.equal(mapped.ok, false);
  if (mapped.ok) return;
  assert.ok(
    mapped.errors.includes(
      "descripcion_corta: falta o es muy corto (mínimo 10 caracteres)",
    ),
    mapped.errors.join(" / "),
  );
  assert.ok(mapped.errors.some((error) => error.startsWith("descripcion: ")));
  assert.ok(
    mapped.errors.includes("sitio_web: usa un enlace que empiece con https://"),
    mapped.errors.join(" / "),
  );
});

test("an opportunity row resolves its startup and tolerates loose values", () => {
  const find = (value: string) =>
    value === "Ruta Viva" ? "ruta-viva" : undefined;
  const row = {
    startup: "Ruta Viva",
    titulo: "Pasantía de datos",
    resumen: "Aprende a construir tableros con datos reales.",
    descripcion:
      "Trabajarás con el equipo de operaciones en tableros semanales.",
    tipo: "pasantia",
    area: "Datos",
    nivel: "Estudiante",
    modalidad: "HIBRIDO",
    dedicacion: "Medio tiempo",
    compensacion: "Beca USD 300 / mes",
    tipo_compensacion: "beca",
    cierre: "31/10/2026",
    postulacion: "LinkUp",
    requisitos: "Bases de SQL | Un proyecto propio",
  };
  const mapped = mapOpportunityRow(row, today, find);
  assert.equal(mapped.ok, true, mapped.ok ? "" : mapped.errors.join(" / "));
  if (!mapped.ok) return;
  assert.equal(mapped.data.slug, "pasantia-de-datos-ruta-viva");
  assert.equal(mapped.data.type, "Pasantía");
  assert.equal(mapped.data.modality, "Híbrido");
  assert.equal(mapped.data.compensationType, "Beca");
  assert.equal(mapped.data.closesAt, "2026-10-31");
  assert.equal(mapped.data.applicationMode, "native");
  assert.deepEqual(mapped.data.requirements, [
    "Bases de SQL",
    "Un proyecto propio",
  ]);

  const unknown = mapOpportunityRow({ ...row, startup: "Otra" }, today, find);
  assert.deepEqual(unknown.ok ? [] : unknown.errors, [
    'startup: no encontramos "Otra"; impórtala o créala primero',
  ]);
  const badType = mapOpportunityRow(
    { ...row, tipo: "Voluntariado" },
    today,
    find,
  );
  assert.ok(
    !badType.ok &&
      badType.errors.some((error) =>
        error.startsWith("tipo: usa uno de estos valores: Empleo, Pasantía"),
      ),
  );
});
