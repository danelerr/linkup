"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import type { TalentProfile } from "@/lib/user-data";

const questions = [
  "¿Qué te interesa de esta oportunidad y qué esperas aprender?",
  "Cuéntanos sobre un proyecto, actividad o problema parecido que hayas abordado.",
  "¿Hay algo importante sobre tu disponibilidad que la organización deba saber?",
];

export function ApplicationForm({ opportunitySlug, profile }: { opportunitySlug: string; profile: TalentProfile }) {
  const router = useRouter();
  const [answers, setAnswers] = useState(["", "", ""]);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setState("error");
      setMessage("Confirma qué información vas a compartir.");
      return;
    }
    setState("sending");
    setMessage("");
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, answers }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
    if (!response.ok) {
      if (payload.code === "PROFILE_INCOMPLETE") router.push(`/mi-linkup/perfil?return_to=${encodeURIComponent(`/oportunidades/${opportunitySlug}/postular`)}`);
      else {
        setState("error");
        setMessage(payload.error ?? "No pudimos enviar la postulación.");
      }
      return;
    }
    router.push("/mi-linkup/postulaciones?enviada=1");
  }

  return (
    <form className="application-form" onSubmit={submit}>
      <section className="share-review">
        <div className="share-review-heading">
          <LockKeyhole size={18} aria-hidden="true" />
          <div>
            <h2>Esto es lo que compartirás</h2>
            <p>Una copia de estos datos queda asociada a esta postulación, aunque luego edites tu perfil.</p>
          </div>
        </div>
        <dl>
          <div><dt>Objetivo</dt><dd>{profile.objective}</dd></div>
          <div><dt>Ubicación</dt><dd>{profile.city}, {profile.country}</dd></div>
          <div><dt>Modalidad</dt><dd>{profile.modality}</dd></div>
          <div><dt>Disponibilidad</dt><dd>{profile.availability}</dd></div>
          <div><dt>Habilidades</dt><dd>{profile.skills.join(" · ")}</dd></div>
          {profile.portfolioUrl && <div><dt>Evidencia</dt><dd>{profile.portfolioUrl}</dd></div>}
        </dl>
      </section>

      <section className="application-questions">
        <div>
          <span className="eyebrow">Tres preguntas</span>
          <h2>Responde con ejemplos concretos.</h2>
        </div>
        {questions.map((question, index) => (
          <label className="field-label" key={question}>
            <span>{index + 1}. {question}</span>
            <textarea
              required={index < 2}
              maxLength={800}
              value={answers[index]}
              onChange={(event) => setAnswers(answers.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))}
              placeholder={index === 0 ? "En pocas frases..." : "Puedes usar una experiencia académica, personal, voluntaria o laboral..."}
            />
            <small>{answers[index].length}/800</small>
          </label>
        ))}
      </section>

      <div className="application-consent">
        <label className="check-field">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>Confirmo que revisé esta información y autorizo compartirla con la organización para este proceso.</span>
        </label>
        <div className="demo-consent"><CheckCircle2 size={16} aria-hidden="true" /> Esta es una simulación. No será enviada a una organización real.</div>
      </div>

      <div className="form-submit-row">
        <p className="form-message is-error" role="alert">{message}</p>
        <button className="button-primary" type="submit" disabled={state === "sending"}>
          {state === "sending" && <LoaderCircle className="spin" size={17} aria-hidden="true" />}
          {state === "sending" ? "Enviando" : "Confirmar postulación"}
        </button>
      </div>
    </form>
  );
}
