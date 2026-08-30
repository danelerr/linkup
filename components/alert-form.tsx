"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

export function AlertForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState(initialQuery);
  const [frequency, setFrequency] = useState<"diaria" | "semanal">("semanal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/alerts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label, query: { vista: "oportunidades", q: query }, frequency }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) setError(payload.error ?? "No pudimos crear la alerta.");
    else {
      setLabel("");
      setQuery("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form className="alert-form" onSubmit={submit}>
      <div className="form-grid alert-grid">
        <label className="field-label">
          Nombre de la alerta
          <input required minLength={2} maxLength={80} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Producto remoto" />
        </label>
        <label className="field-label">
          Qué quieres buscar
          <input value={query} onChange={(event) => setQuery(event.target.value)} maxLength={120} placeholder="producto, frontend, operaciones..." />
        </label>
        <label className="field-label">
          Frecuencia
          <select value={frequency} onChange={(event) => setFrequency(event.target.value as "diaria" | "semanal")}>
            <option value="semanal">Semanal</option><option value="diaria">Diaria</option>
          </select>
        </label>
        <button className="button-primary" type="submit" disabled={loading}>
          {loading && <LoaderCircle className="spin" size={16} aria-hidden="true" />}
          Crear alerta
        </button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}

export function DeleteAlertButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function remove() {
    setLoading(true);
    const response = await fetch("/api/alerts", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) router.refresh();
    else setLoading(false);
  }
  return (
    <button className="icon-button" type="button" onClick={remove} disabled={loading} aria-label="Eliminar alerta">
      {loading ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
    </button>
  );
}
