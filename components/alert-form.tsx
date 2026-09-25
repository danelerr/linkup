"use client";

import { clientRequest } from "@/lib/client-request";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { StateIcon } from "@/components/state-icon";
import { buttonClass, textLinkClass } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FormError,
  FormSuccess,
  selectClass,
} from "@/components/ui/field";
import { directoryHref, parseFilters } from "@/lib/directory-filters";

const filterKeys = ["industria", "area", "tipo", "modalidad", "nivel"];

export function AlertForm({
  initialFilters = {},
}: {
  initialFilters?: Record<string, string>;
}) {
  const router = useRouter();
  const activeFilters = Object.entries(initialFilters)
    .filter(([key, value]) => value && filterKeys.includes(key))
    .map(([, value]) => value);
  const [label, setLabel] = useState(
    initialFilters.q || activeFilters.join(" · ").slice(0, 80),
  );
  const [query, setQuery] = useState(initialFilters.q || "");
  const [saved, setSaved] = useState(false);
  const [frequency, setFrequency] = useState<"diaria" | "semanal">("semanal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const response = await clientRequest("/api/alerts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label,
        query: { ...initialFilters, abiertas: "1", q: query },
        frequency,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (!response.ok) setError(payload.error ?? "No pudimos crear la alerta.");
    else {
      setLabel("");
      setSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form
      className="grid gap-5 rounded-panel border border-line bg-paper p-5 sm:p-6"
      onSubmit={submit}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-base font-semibold">Nueva alerta</h2>
        <p className="text-sm text-muted">
          Filtros: {activeFilters.join(" · ") || "todas las oportunidades"} ·{" "}
          <Link
            className={textLinkClass}
            href={directoryHref(parseFilters(initialFilters))}
          >
            Cambiar
          </Link>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Qué quieres buscar" optional>
          <input
            className={controlClass}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={120}
            placeholder="producto, frontend, operaciones…"
          />
        </Field>
        <Field label="Nombre de la alerta">
          <input
            className={controlClass}
            required
            minLength={2}
            maxLength={80}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Producto remoto"
          />
        </Field>
        <Field label="Frecuencia">
          <select
            className={selectClass}
            value={frequency}
            onChange={(event) =>
              setFrequency(event.target.value as "diaria" | "semanal")
            }
          >
            <option value="semanal">Una vez por semana</option>
            <option value="diaria">Todos los días</option>
          </select>
        </Field>
        <div className="flex items-end">
          <button
            className={buttonClass({ block: true })}
            type="submit"
            disabled={loading}
          >
            <StateIcon state={saved ? "alert" : "bell"} />
            {loading ? "Guardando…" : "Crear alerta"}
          </button>
        </div>
      </div>
      <FormError>{error}</FormError>
      {saved && (
        <FormSuccess>
          Alerta guardada. Verás las próximas coincidencias aquí.
        </FormSuccess>
      )}
    </form>
  );
}

export function DeleteAlertButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    setLoading(true);
    const response = await clientRequest("/api/alerts", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) router.refresh();
    else {
      setError("No se pudo eliminar. Intenta de nuevo.");
      setLoading(false);
    }
  }
  return (
    <>
      <button
        className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
        type="button"
        onClick={remove}
        disabled={loading}
        aria-label={`Eliminar alerta ${label}`}
      >
        {loading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="size-4" aria-hidden="true" />
        )}
      </button>
      {error && (
        <span className="text-[13px] text-danger" role="alert">
          {error}
        </span>
      )}
    </>
  );
}

export function MarkAlertsRead() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        className={`${textLinkClass} text-sm`}
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const result = await clientRequest("/api/alerts", {
            method: "PATCH",
          });
          setBusy(false);
          if (result.ok) router.refresh();
          else setError("No se pudieron marcar los avisos.");
        }}
      >
        Marcar como leídos
      </button>
      {error && (
        <p className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
