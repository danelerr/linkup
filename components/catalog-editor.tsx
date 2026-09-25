"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { modalities, opportunityTypes } from "@/lib/catalog-types";
import { clientRequest } from "@/lib/client-request";
import { StateIcon } from "@/components/state-icon";
import { Notice } from "@/components/detail";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import {
  controlClass,
  Field as FieldShell,
  FormError,
  FormSuccess,
  hintClass,
  selectClass,
  textareaClass,
} from "@/components/ui/field";
import { StartupLogo } from "@/components/ui/startup-logo";
import { isSafeHttpUrl } from "@/lib/validation";

type Field = {
  key: string;
  label: string;
  type?: string;
  options?: readonly string[];
  wide?: boolean;
  optional?: boolean;
  hint?: string;
};
const startupFields: Field[] = [
  { key: "name", label: "Nombre" },
  { key: "monogram", label: "Iniciales (hasta 3)" },
  { key: "shortDescription", label: "Descripción en una línea", wide: true },
  {
    key: "description",
    label: "Sobre la startup",
    type: "textarea",
    wide: true,
  },
  { key: "industry", label: "Industria" },
  { key: "websiteUrl", label: "Sitio web", type: "url" },
  {
    key: "logoUrl",
    label: "Logo",
    type: "url",
    optional: true,
    wide: true,
    hint: "Enlace a la imagen oficial (PNG, SVG o JPG). Sin logo se muestran las iniciales.",
  },
  { key: "city", label: "Ubicación", optional: true },
  { key: "stage", label: "Etapa", optional: true },
  { key: "teamSize", label: "Tamaño del equipo", optional: true },
  { key: "remotePolicy", label: "Política de trabajo", optional: true },
  {
    key: "foundedYear",
    label: "Año de fundación",
    type: "number",
    hint: "0 si no se conoce.",
  },
];
const opportunityFields: Field[] = [
  { key: "title", label: "Título", wide: true },
  { key: "summary", label: "Resumen", wide: true },
  { key: "description", label: "Descripción", type: "textarea", wide: true },
  { key: "type", label: "Tipo", options: opportunityTypes },
  { key: "area", label: "Área" },
  { key: "level", label: "Nivel de experiencia" },
  { key: "modality", label: "Modalidad", options: modalities },
  { key: "location", label: "Ubicación", optional: true },
  {
    key: "countriesAccepted",
    label: "Desde dónde se puede postular",
    optional: true,
  },
  { key: "dedication", label: "Dedicación" },
  {
    key: "compensation",
    label: "Compensación",
    hint: "Monto, moneda y período. Ej. USD 900–1.300 / mes.",
  },
  {
    key: "compensationType",
    label: "Tipo de compensación",
    options: ["Pagada", "Beca", "Por definir", "No pagada"],
  },
  { key: "closesAt", label: "Fecha de cierre", type: "date", optional: true },
  {
    key: "applicationMode",
    label: "Postulación",
    options: ["external", "native"],
  },
  {
    key: "applicationUrl",
    label: "Enlace para postular",
    type: "url",
    optional: true,
    hint: "Obligatorio si la postulación es externa.",
  },
  {
    key: "responsibilities",
    label: "Responsabilidades",
    type: "lines",
    wide: true,
    optional: true,
    hint: "Una por línea.",
  },
  {
    key: "requirements",
    label: "Lo indispensable",
    type: "lines",
    wide: true,
    optional: true,
    hint: "Uno por línea. Solo lo que de verdad es requisito.",
  },
  {
    key: "desirable",
    label: "Suma, pero no es requisito",
    type: "lines",
    wide: true,
    optional: true,
    hint: "Uno por línea.",
  },
];

const optionLabels: Record<string, string> = {
  native: "Dentro de LinkUp",
  external: "En la fuente original",
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
};

export function CatalogEditor({
  kind,
  initial,
  organizations,
  existingSlug,
  submissionId,
}: {
  kind: "startup" | "opportunity";
  initial: Record<string, unknown>;
  organizations: { slug: string; name: string }[];
  existingSlug?: string;
  submissionId?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const set = (key: string, value: unknown) => {
    setSaved(false);
    setData((current) => ({ ...current, [key]: value }));
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await clientRequest("/api/admin/catalog", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        data,
        existingSlug,
        submissionId,
        expectedUpdatedAt: data.updatedAt,
        reason,
      }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(result.error || "No se pudo guardar.");
      return;
    }
    setSaved(true);
    setData((current) => ({ ...current, updatedAt: result.updatedAt }));
    router.replace(
      `/admin/catalogo/editar?tipo=${kind}&slug=${encodeURIComponent(result.slug)}`,
    );
    router.refresh();
  }
  function field(field: Field) {
    const { key, label, type, options } = field;
    const value = data[key];
    const text = Array.isArray(value) ? value.join("\n") : String(value ?? "");
    const control = options ? (
      <select
        className={selectClass}
        value={text}
        onChange={(event) => set(key, event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels[option] || option}
          </option>
        ))}
      </select>
    ) : type === "textarea" || type === "lines" ? (
      <textarea
        className={textareaClass}
        required={!field.optional}
        rows={type === "lines" ? 4 : 6}
        maxLength={10000}
        value={text}
        onChange={(event) =>
          set(
            key,
            type === "lines"
              ? event.target.value.split("\n")
              : event.target.value,
          )
        }
      />
    ) : (
      <input
        className={controlClass}
        required={!field.optional && !data.isDemo}
        type={type || "text"}
        maxLength={key === "slug" ? 120 : key === "monogram" ? 3 : 500}
        value={text}
        readOnly={key === "slug" && Boolean(existingSlug)}
        onChange={(event) =>
          set(
            key,
            type === "number" ? Number(event.target.value) : event.target.value,
          )
        }
      />
    );
    return (
      <FieldShell
        className={field.wide ? "sm:col-span-2" : undefined}
        key={key}
        label={label}
        optional={field.optional}
        hint={field.hint}
      >
        {key === "logoUrl" ? (
          <span className="flex items-center gap-3">
            <StartupLogo
              monogram={String(data.monogram || "·")}
              logoUrl={isSafeHttpUrl(text) ? text : undefined}
              size={44}
            />
            {control}
          </span>
        ) : (
          control
        )}
      </FieldShell>
    );
  }
  return (
    <form className="grid gap-8" onSubmit={submit}>
      {submissionId && (
        <Notice>
          Al publicar se aprobará el envío asociado. Comprueba la fuente antes
          de continuar.
        </Notice>
      )}
      {Boolean(data.isDemo) && (
        <Notice>
          Registro demostrativo. No se presenta como información real.
        </Notice>
      )}
      <div className="grid gap-5 rounded-panel border border-line bg-paper p-5 sm:grid-cols-2 sm:p-6">
        {field({
          key: "slug",
          label: "Enlace permanente",
          hint: "Minúsculas y guiones. No se puede cambiar después.",
          wide: true,
        })}
        {kind === "opportunity" && (
          <FieldShell
            className="sm:col-span-2"
            label="Startup"
            hint={
              <>
                ¿No existe?{" "}
                <Link
                  className={textLinkClass}
                  href="/admin/catalogo/editar?tipo=startup"
                  target="_blank"
                >
                  Crea primero su ficha
                </Link>{" "}
                y luego recarga este formulario.
              </>
            }
          >
            <select
              className={selectClass}
              required
              value={String(data.organizationSlug || "")}
              onChange={(event) => set("organizationSlug", event.target.value)}
            >
              <option value="">Seleccionar</option>
              {organizations.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </FieldShell>
        )}
        {(kind === "startup" ? startupFields : opportunityFields).map(field)}
      </div>

      <div className="grid gap-5 rounded-panel border border-line bg-paper p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="text-base font-semibold sm:col-span-2">
          Fuente y publicación
        </h2>
        {field({
          key: "sourceUrl",
          label: "Fuente oficial",
          type: "url",
          wide: true,
        })}
        {field({ key: "sourceLabel", label: "Nombre de la fuente" })}
        {field({
          key: "verifiedAt",
          label: "Fecha de comprobación",
          type: "date",
        })}
        {field({
          key: "status",
          label: "Estado",
          options: ["draft", "published", "closed"],
        })}
        <FieldShell label="Motivo del cambio">
          <input
            className={controlClass}
            required
            minLength={3}
            maxLength={300}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Fuente y vigencia comprobadas"
          />
        </FieldShell>
        <p className={`${hintClass} sm:col-span-2`}>
          Los borradores no son públicos. Cerrar un registro retira sus
          oportunidades de la búsqueda activa.
        </p>
      </div>

      <div className="grid gap-3">
        <FormError>{error}</FormError>
        {saved && <FormSuccess>Cambios guardados correctamente.</FormSuccess>}
        <div className="flex flex-wrap gap-2">
          <button className={buttonClass()} disabled={busy}>
            <StateIcon state={saved ? "check" : "send"} />
            {busy ? "Guardando…" : saved ? "Guardado" : "Guardar cambios"}
          </button>
          <Link
            className={buttonClass({ variant: "secondary" })}
            href="/admin/catalogo"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    </form>
  );
}
