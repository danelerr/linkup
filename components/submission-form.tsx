"use client";

import { clientRequest } from "@/lib/client-request";

import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FormError,
  textareaClass,
} from "@/components/ui/field";
import { eyebrowClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

type SubmissionKind = "startup" | "opportunity" | "claim" | "correction";

const labels: Record<
  SubmissionKind,
  { title: string; description: string; source: string }
> = {
  startup: {
    title: "Agregar una startup",
    description: "Una empresa que todavía no está en LinkUp.",
    source: "Página oficial de la startup",
  },
  opportunity: {
    title: "Agregar una oportunidad",
    description: "Una vacante, pasantía, proyecto o programa vigente.",
    source: "Enlace directo a la publicación",
  },
  claim: {
    title: "Reclamar una startup",
    description: "Representas a la startup y quieres gestionarla.",
    source: "Fuente que ayude a verificar tu relación",
  },
  correction: {
    title: "Corregir información",
    description: "Un dato publicado cambió o es incorrecto.",
    source: "Fuente que respalde la corrección",
  },
};

export function SubmissionForm({
  accountEmail,
  initialKind = "startup",
  initialOrganization = "",
}: {
  accountEmail: string;
  initialKind?: SubmissionKind;
  initialOrganization?: string;
}) {
  const [kind, setKind] = useState<SubmissionKind>(initialKind);
  const [organizationName, setOrganizationName] = useState(initialOrganization);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const response = await clientRequest("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        organizationName,
        websiteUrl,
        opportunityTitle,
        sourceUrl,
        notes,
        company: "",
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      id?: string;
    };
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
      <div
        className="mt-10 rounded-panel border border-success/25 bg-success-soft p-6 sm:p-8"
        role="status"
      >
        <CheckCircle2 className="size-7 text-success" aria-hidden="true" />
        <p className={cx(eyebrowClass, "mt-4 text-success")}>
          Recibido · {reference}
        </p>
        <h2 className="text-xl font-semibold tracking-[-0.02em]">
          Gracias. Lo revisaremos antes de publicarlo.
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-body">
          La información queda pendiente. Si necesitamos confirmar algo,
          escribiremos a {accountEmail}.
        </p>
        <button
          className={buttonClass({ variant: "secondary", className: "mt-6" })}
          type="button"
          onClick={() => {
            setState("idle");
            setSourceUrl("");
            setNotes("");
          }}
        >
          Enviar otro registro
        </button>
      </div>
    );
  }

  return (
    <form className="mt-10 grid gap-8" onSubmit={submit}>
      <fieldset>
        <legend className="text-sm font-semibold text-body">
          ¿Qué quieres hacer?
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(labels) as SubmissionKind[]).map((item) => (
            <label
              key={item}
              className={cx(
                "flex cursor-pointer gap-3 rounded-control border p-4 transition-colors",
                kind === item
                  ? "border-action bg-action/5 ring-1 ring-action"
                  : "border-line bg-paper hover:border-line-strong",
              )}
            >
              <input
                className="mt-1 size-4 shrink-0 accent-action"
                type="radio"
                name="kind"
                value={item}
                checked={kind === item}
                onChange={() => setKind(item)}
              />
              <span className="text-[15px] font-semibold text-ink">
                {labels[item].title}
                <span className="mt-0.5 block text-[13px] leading-5 font-normal text-muted">
                  {labels[item].description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 border-t border-line pt-8">
        <Field label="Nombre de la organización">
          <input
            className={controlClass}
            required
            minLength={2}
            maxLength={120}
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            placeholder="Nombre público"
          />
        </Field>
        {(kind === "startup" || kind === "opportunity") && (
          <Field label="Sitio web" optional>
            <input
              className={controlClass}
              type="url"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://"
            />
          </Field>
        )}
        {kind === "opportunity" && (
          <Field label="Título de la oportunidad">
            <input
              className={controlClass}
              required
              maxLength={160}
              value={opportunityTitle}
              onChange={(event) => setOpportunityTitle(event.target.value)}
              placeholder="Ej. Frontend developer junior"
            />
          </Field>
        )}
        <Field
          label={labels[kind].source}
          hint="No publicamos automáticamente: una persona revisa procedencia, vigencia y posibles duplicados."
        >
          <input
            className={controlClass}
            type="url"
            required
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="Contexto" optional>
          <textarea
            className={textareaClass}
            maxLength={1200}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={
              kind === "claim"
                ? "Cuéntanos cuál es tu rol y cómo podemos comprobarlo."
                : "Algo que debamos saber al verificar esta información."
            }
          />
        </Field>
      </div>

      <div className="grid gap-4 border-t border-line pt-6">
        <p className="text-[13px] leading-5 text-muted">
          Lo envías desde tu cuenta{" "}
          <strong className="text-body">{accountEmail}</strong>; si necesitamos
          confirmar algo, te escribiremos ahí. Al enviar confirmas que la
          información es pública o que tienes autorización para compartirla.
          Puedes enviar hasta 5 por día.
        </p>
        {state === "error" && <FormError>{message}</FormError>}
        <button
          className={buttonClass({ className: "sm:justify-self-start" })}
          type="submit"
          disabled={state === "sending"}
        >
          {state === "sending" && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          {state === "sending" ? "Enviando…" : "Enviar para revisión"}
        </button>
      </div>
    </form>
  );
}
