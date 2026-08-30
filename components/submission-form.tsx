"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

type SubmissionKind = "startup" | "opportunity" | "claim" | "correction";

const labels: Record<SubmissionKind, { title: string; source: string }> = {
  startup: { title: "Agregar una startup", source: "Página oficial de la startup" },
  opportunity: { title: "Agregar una oportunidad", source: "Enlace directo a la publicación" },
  claim: { title: "Reclamar una startup", source: "Fuente que ayude a verificar tu relación" },
  correction: { title: "Corregir información", source: "Fuente que respalde la corrección" },
};

export function SubmissionForm({ initialKind = "startup", initialOrganization = "" }: { initialKind?: SubmissionKind; initialOrganization?: string }) {
  const [kind, setKind] = useState<SubmissionKind>(initialKind);
  const [organizationName, setOrganizationName] = useState(initialOrganization);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        organizationName,
        websiteUrl,
        opportunityTitle,
        sourceUrl,
        contactEmail,
        notes,
        company: "",
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; id?: string };
    if (!response.ok || !payload.id) {
      setState("error");
      setMessage(payload.error ?? "No pudimos enviar la información.");
      return;
    }
    setReference(payload.id.slice(0, 8).toUpperCase());
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="submission-success">
        <CheckCircle2 size={26} aria-hidden="true" />
        <div>
          <p className="eyebrow">Recibido · {reference}</p>
          <h2>Gracias. Lo revisaremos antes de publicarlo.</h2>
          <p>La información queda pendiente. Si necesitamos confirmar algo, escribiremos a {contactEmail}.</p>
        </div>
        <button className="button-secondary" type="button" onClick={() => { setState("idle"); setSourceUrl(""); setNotes(""); }}>
          Enviar otro registro
        </button>
      </div>
    );
  }

  return (
    <form className="submission-form" onSubmit={submit}>
      <fieldset className="kind-options">
        <legend>¿Qué quieres hacer?</legend>
        {(["startup", "opportunity", "claim", "correction"] as SubmissionKind[]).map((item) => (
          <label key={item} className={kind === item ? "is-selected" : ""}>
            <input type="radio" name="kind" value={item} checked={kind === item} onChange={() => setKind(item)} />
            <span>{labels[item].title}</span>
          </label>
        ))}
      </fieldset>

      <div className="submission-fields">
        <label className="field-label">
          Nombre de la organización
          <input required minLength={2} maxLength={120} value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Nombre público" />
        </label>
        {(kind === "startup" || kind === "opportunity") && (
          <label className="field-label">
            Sitio web <em>Opcional</em>
            <input type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://" />
          </label>
        )}
        {kind === "opportunity" && (
          <label className="field-label">
            Título de la oportunidad
            <input required maxLength={160} value={opportunityTitle} onChange={(event) => setOpportunityTitle(event.target.value)} placeholder="Ej. Frontend developer junior" />
          </label>
        )}
        <label className="field-label">
          {labels[kind].source}
          <input type="url" required value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://" />
          <small>No publicamos automáticamente: una persona revisará procedencia, vigencia y posibles duplicados.</small>
        </label>
        <label className="field-label">
          Tu correo
          <input type="email" required value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="tu@correo.com" />
        </label>
        <label className="field-label">
          Contexto <em>Opcional</em>
          <textarea maxLength={1200} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={kind === "claim" ? "Cuéntanos cuál es tu rol y cómo podemos comprobarlo." : "Algo que debamos saber al verificar esta información."} />
        </label>
      </div>

      <div className="submission-submit">
        <p>Al enviar confirmas que la información es pública o que tienes autorización para compartirla.</p>
        {state === "error" && <p className="form-error" role="alert">{message}</p>}
        <button className="button-primary" type="submit" disabled={state === "sending"}>
          {state === "sending" && <LoaderCircle className="spin" size={17} aria-hidden="true" />}
          {state === "sending" ? "Enviando" : "Enviar para revisión"}
        </button>
      </div>
    </form>
  );
}
