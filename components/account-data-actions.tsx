"use client";

import { useState } from "react";
import { Download, LoaderCircle, Trash2 } from "lucide-react";

export function AccountDataActions() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; signOutPath?: string };
    if (response.ok && payload.signOutPath) window.location.assign(payload.signOutPath);
    else {
      setError(payload.error ?? "No pudimos eliminar los datos.");
      setLoading(false);
    }
  }

  return (
    <section className="account-data-section">
      <div><h2>Tus datos</h2><p>Puedes descargar una copia o eliminar los datos que LinkUp guarda sobre ti.</p></div>
      <div className="account-data-buttons">
        <a className="button-secondary button-small" href="/api/account/export"><Download size={15} aria-hidden="true" /> Descargar copia</a>
        <button className="danger-button" type="button" onClick={() => setOpen((value) => !value)}><Trash2 size={15} aria-hidden="true" /> Eliminar datos</button>
      </div>
      {open && (
        <div className="delete-confirmation">
          <p>Esto elimina tu perfil, guardados, alertas y postulaciones de esta alfa. Los registros operativos se desidentifican. No se puede deshacer.</p>
          <label className="field-label">Escribe <strong>ELIMINAR</strong> para confirmar
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="danger-button is-solid" type="button" onClick={remove} disabled={confirmation !== "ELIMINAR" || loading}>
            {loading && <LoaderCircle className="spin" size={15} aria-hidden="true" />} Eliminar definitivamente
          </button>
        </div>
      )}
    </section>
  );
}
