"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import type { TalentProfile } from "@/lib/user-data";

export function ProfileForm({ initialProfile, returnTo }: { initialProfile: TalentProfile; returnTo?: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [skillsText, setSkillsText] = useState(initialProfile.skills.join(", "));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const skills = skillsText.split(",").map((item) => item.trim()).filter(Boolean);
    const response = await fetch("/api/profile", {
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
    <form className="profile-form" onSubmit={submit}>
      <section className="form-section">
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>Lo que buscas</h2>
            <p>Esto nos permite explicarte por qué una oportunidad puede encajar.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field-label form-span-2">
            Rol u objetivo principal
            <input value={profile.objective} onChange={(event) => setProfile({ ...profile, objective: event.target.value })} placeholder="Ej. Primera experiencia en producto" maxLength={100} />
          </label>
          <label className="field-label">
            Ciudad
            <input value={profile.city} onChange={(event) => setProfile({ ...profile, city: event.target.value })} placeholder="La Paz" maxLength={80} />
          </label>
          <label className="field-label">
            País
            <input value={profile.country} onChange={(event) => setProfile({ ...profile, country: event.target.value })} placeholder="Bolivia" maxLength={80} />
          </label>
          <label className="field-label">
            Modalidad preferida
            <select value={profile.modality} onChange={(event) => setProfile({ ...profile, modality: event.target.value })}>
              <option value="">Seleccionar</option>
              <option>Remoto</option><option>Híbrido</option><option>Presencial</option><option>Flexible</option>
            </select>
          </label>
          <label className="field-label">
            Disponibilidad
            <input value={profile.availability} onChange={(event) => setProfile({ ...profile, availability: event.target.value })} placeholder="Ej. 20 horas por semana" maxLength={100} />
          </label>
          <label className="field-label form-span-2">
            Habilidades o áreas
            <input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="React, investigación, operaciones" />
            <small>Sepáralas con comas. Empieza con las que puedas explicar o demostrar.</small>
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <span>02</span>
          <div>
            <h2>Tu señal</h2>
            <p>No exigimos años de experiencia. Un proyecto concreto también cuenta.</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="field-label form-span-2">
            Presentación breve <em>Opcional</em>
            <textarea value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} placeholder="Qué te interesa, qué hiciste y qué quieres aprender..." maxLength={800} />
          </label>
          <label className="field-label form-span-2">
            Proyecto, portafolio o perfil público <em>Opcional</em>
            <input type="url" value={profile.portfolioUrl} onChange={(event) => setProfile({ ...profile, portfolioUrl: event.target.value })} placeholder="https://" />
          </label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading">
          <span>03</span>
          <div>
            <h2>Privacidad y consentimiento</h2>
            <p>Tu perfil es privado. Solo compartimos una copia cuando tú postulas.</p>
          </div>
        </div>
        <div className="consent-box">
          <label className="check-field">
            <input type="checkbox" checked={profile.isAdult} onChange={(event) => setProfile({ ...profile, isAdult: event.target.checked })} />
            <span>Confirmo que tengo 18 años o más y acepto el uso de estos datos para gestionar mis acciones en LinkUp.</span>
          </label>
          <label className="field-label">
            Visibilidad
            <select value={profile.privacy} onChange={(event) => setProfile({ ...profile, privacy: event.target.value })}>
              <option value="private">Privado; solo yo</option>
              <option value="applications">Compartir únicamente al postular</option>
            </select>
          </label>
        </div>
      </section>

      <div className="form-submit-row">
        <div className={`form-message ${state === "error" ? "is-error" : ""}`} role="status">
          {state === "saved" && <Check size={16} aria-hidden="true" />}{message}
        </div>
        <button className="button-primary" type="submit" disabled={state === "saving"}>
          {state === "saving" && <LoaderCircle className="spin" size={17} aria-hidden="true" />}
          {state === "saving" ? "Guardando" : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}
