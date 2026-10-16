"use client";

import { clientRequest } from "@/lib/client-request";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import {
  Check,
  checkClass,
  FormError,
  hintClass,
  textareaClass,
} from "@/components/ui/field";
import { eyebrowClass } from "@/components/ui/layout";
import type { TalentProfile } from "@/lib/user-data";

const questions = [
  "¿Qué te interesa de esta oportunidad y qué esperas aprender?",
  "Cuéntanos sobre un proyecto, actividad o problema parecido que hayas abordado.",
  "¿Hay algo importante sobre tu disponibilidad que la organización deba saber?",
];

export function ApplicationForm({
  opportunitySlug,
  profile,
  isDemo,
}: {
  opportunitySlug: string;
  profile: TalentProfile;
  isDemo: boolean;
}) {
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
    const response = await clientRequest("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, answers, consent }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    if (!response.ok) {
      if (payload.code === "PROFILE_INCOMPLETE")
        router.push(
          `/para-ti/perfil?return_to=${encodeURIComponent(`/oportunidades/${opportunitySlug}/postular`)}`,
        );
      else {
        setState("error");
        setMessage(payload.error ?? "No pudimos enviar la postulación.");
      }
      return;
    }
    router.push("/para-ti/postulaciones?enviada=1");
  }

  const shared = [
    ["Objetivo", profile.objective],
    ["Ubicación", `${profile.city}, ${profile.country}`],
    ["Modalidad", profile.modality],
    ["Disponibilidad", profile.availability],
    ["Habilidades", profile.skills.join(" · ")],
    ["Sobre ti", profile.bio],
    ["Evidencia", profile.portfolioUrl],
  ].filter(([, value]) => value);

  return (
    <form className="grid gap-10" onSubmit={submit}>
      <section className="rounded-panel border border-line bg-paper p-5 sm:p-6">
        <div className="flex gap-3">
          <LockKeyhole
            className="mt-0.5 size-5 shrink-0 text-action"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-base font-semibold">
              Esto es lo que compartirás
            </h2>
            <p className="mt-1 text-sm leading-6 text-body">
              Tu nombre, tu correo y una copia de estos datos, solo con las
              personas autorizadas a revisar este proceso. La copia no cambia
              cuando edites tu perfil.
            </p>
          </div>
        </div>
        <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-2">
          {shared.map(([label, value]) => (
            <div
              key={label}
              className={label === "Sobre ti" ? "sm:col-span-2" : undefined}
            >
              <dt className="font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                {label}
              </dt>
              <dd className="mt-1 text-[15px] break-words text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-6">
        <div>
          <p className={eyebrowClass}>Tres preguntas</p>
          <h2 className="text-xl font-semibold tracking-[-0.02em]">
            Responde con ejemplos concretos.
          </h2>
        </div>
        {questions.map((question, index) => (
          <label className="grid gap-2" key={question}>
            <span className="text-[15px] leading-6 font-semibold text-ink">
              {index + 1}. {question}
              {index === 2 && (
                <span className="ml-1.5 font-normal text-muted">
                  (opcional)
                </span>
              )}
            </span>
            <textarea
              className={textareaClass}
              required={index < 2}
              maxLength={800}
              value={answers[index]}
              onChange={(event) =>
                setAnswers(
                  answers.map((answer, answerIndex) =>
                    answerIndex === index ? event.target.value : answer,
                  ),
                )
              }
              placeholder={
                index === 0
                  ? "En pocas frases…"
                  : "Puedes usar una experiencia académica, personal, voluntaria o laboral…"
              }
            />
            <span className={`${hintClass} text-right tabular-nums`}>
              {answers[index].length}/800
            </span>
          </label>
        ))}
      </section>

      <div className="grid gap-4 border-t border-line pt-6">
        <Check
          input={
            <input
              className={checkClass}
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
          }
        >
          Confirmo que revisé esta información y autorizo compartirla con la
          organización para este proceso.
        </Check>
        {isDemo && (
          <p className="rounded-control border border-warning/25 bg-warning-soft px-3.5 py-2.5 text-sm text-warning">
            Esta es una simulación. No compartas datos reales.
          </p>
        )}
        {state === "error" && <FormError>{message}</FormError>}
        <button
          className={buttonClass({ className: "sm:justify-self-start" })}
          type="submit"
          disabled={state === "sending"}
        >
          {state === "sending" && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          {state === "sending" ? "Enviando…" : "Confirmar postulación"}
        </button>
      </div>
    </form>
  );
}
