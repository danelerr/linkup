"use client";

import { clientRequest } from "@/lib/client-request";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import {
  Check,
  checkClass,
  controlClass,
  Field,
  FormError,
  FormSuccess,
  selectClass,
  textareaClass,
} from "@/components/ui/field";
import type { TalentProfile } from "@/lib/user-data";

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-line pt-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10">
      <div>
        <p className="font-meta text-xs font-bold tracking-[0.08em] text-muted">
          {number}
        </p>
        <h2 className="mt-1 text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-body">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ProfileForm({
  initialProfile,
  returnTo,
}: {
  initialProfile: TalentProfile;
  returnTo?: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [skillsText, setSkillsText] = useState(
    initialProfile.skills.join(", "),
  );
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const skills = skillsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const response = await clientRequest("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...profile, skills }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      profile?: TalentProfile;
    };
    if (!response.ok) {
      setState("error");
      setMessage(payload.error ?? "No pudimos guardar el perfil.");
      return;
    }
    if (!payload.profile) {
      setState("error");
      setMessage("No pudimos leer el perfil guardado.");
      return;
    }
    setProfile(payload.profile);
    setSkillsText(payload.profile.skills.join(", "));
    setState("saved");
    setMessage("Perfil guardado.");
    if (returnTo) router.push(returnTo);
  }

  return (
    <form className="grid gap-8" onSubmit={submit}>
      <FormSection
        number="01"
        title="Lo que buscas"
        description="Nos permite explicarte por qué una oportunidad puede encajar."
      >
        <Field className="sm:col-span-2" label="Rol u objetivo principal">
          <input
            className={controlClass}
            value={profile.objective}
            onChange={(event) =>
              setProfile({ ...profile, objective: event.target.value })
            }
            placeholder="Ej. Primera experiencia en producto"
            maxLength={100}
          />
        </Field>
        <Field label="Ciudad">
          <input
            className={controlClass}
            value={profile.city}
            onChange={(event) =>
              setProfile({ ...profile, city: event.target.value })
            }
            placeholder="La Paz"
            autoComplete="address-level2"
            maxLength={80}
          />
        </Field>
        <Field label="País">
          <input
            className={controlClass}
            value={profile.country}
            onChange={(event) =>
              setProfile({ ...profile, country: event.target.value })
            }
            placeholder="Tu país"
            autoComplete="country-name"
            maxLength={80}
          />
        </Field>
        <Field label="Modalidad preferida">
          <select
            className={selectClass}
            value={profile.modality}
            onChange={(event) =>
              setProfile({ ...profile, modality: event.target.value })
            }
          >
            <option value="">Seleccionar</option>
            <option>Remoto</option>
            <option>Híbrido</option>
            <option>Presencial</option>
            <option>Flexible</option>
          </select>
        </Field>
        <Field label="Disponibilidad">
          <input
            className={controlClass}
            value={profile.availability}
            onChange={(event) =>
              setProfile({ ...profile, availability: event.target.value })
            }
            placeholder="Ej. 20 horas por semana"
            maxLength={100}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          label="Habilidades o áreas"
          hint="Sepáralas con comas. Empieza con las que puedas explicar o demostrar."
        >
          <input
            className={controlClass}
            value={skillsText}
            onChange={(event) => setSkillsText(event.target.value)}
            placeholder="React, investigación, operaciones"
          />
        </Field>
      </FormSection>

      <FormSection
        number="02"
        title="Tu señal"
        description="No exigimos años de experiencia. Un proyecto concreto también cuenta."
      >
        <Field className="sm:col-span-2" label="Presentación breve" optional>
          <textarea
            className={textareaClass}
            value={profile.bio}
            onChange={(event) =>
              setProfile({ ...profile, bio: event.target.value })
            }
            placeholder="Qué te interesa, qué hiciste y qué quieres aprender…"
            maxLength={800}
          />
        </Field>
        <Field
          className="sm:col-span-2"
          label="Proyecto, portafolio o perfil público"
          optional
        >
          <input
            className={controlClass}
            type="url"
            value={profile.portfolioUrl}
            onChange={(event) =>
              setProfile({ ...profile, portfolioUrl: event.target.value })
            }
            placeholder="https://"
          />
        </Field>
      </FormSection>

      <FormSection
        number="03"
        title="Privacidad y consentimiento"
        description="Tu perfil es privado. Solo compartimos una copia cuando tú postulas."
      >
        <Check
          className="sm:col-span-2"
          input={
            <input
              className={checkClass}
              type="checkbox"
              checked={profile.isAdult}
              onChange={(event) =>
                setProfile({ ...profile, isAdult: event.target.checked })
              }
            />
          }
        >
          Confirmo que tengo 18 años o más y acepto el uso de estos datos para
          gestionar mis acciones en LinkUp.
        </Check>
        <Field className="sm:col-span-2" label="Visibilidad">
          <select
            className={selectClass}
            value={profile.privacy}
            onChange={(event) =>
              setProfile({ ...profile, privacy: event.target.value })
            }
          >
            <option value="private">Privado: solo yo</option>
            <option value="applications">
              Compartir únicamente al postular
            </option>
          </select>
        </Field>
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 grid gap-3 border-t border-line bg-canvas/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        {state === "error" && <FormError>{message}</FormError>}
        {state === "saved" && <FormSuccess>{message}</FormSuccess>}
        <button
          className={buttonClass({ className: "sm:justify-self-end" })}
          type="submit"
          disabled={state === "saving"}
        >
          {state === "saving" && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          {state === "saving"
            ? "Guardando…"
            : returnTo
              ? "Guardar y continuar"
              : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}
