"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";

type OrganizationOption = { slug: string; name: string };

export function AdminSubmissionActions({ id, kind, suggestedSlug, organizations }: { id: string; kind: string; suggestedSlug?: string; organizations: OrganizationOption[] }) {
  const router = useRouter();
  const [organizationSlug, setOrganizationSlug] = useState(suggestedSlug ?? "");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState("");

  async function decide(status: "approved" | "rejected") {
    if (reason.trim().length < 3) {
      setError("Añade un motivo breve para la auditoría.");
      return;
    }
    if (status === "approved" && kind === "claim" && !organizationSlug) {
      setError("Selecciona la startup que recibirá el acceso.");
      return;
    }
    setLoading(status);
    setError("");
    const response = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status, reason, organizationSlug: organizationSlug || undefined }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (response.ok) router.refresh();
    else {
      setError(payload.error ?? "No pudimos guardar la decisión.");
      setLoading(null);
    }
  }

  return (
    <div className="moderation-actions">
      {kind === "claim" && (
        <label className="field-label">
          Organización vinculada
          <select value={organizationSlug} onChange={(event) => setOrganizationSlug(event.target.value)}>
            <option value="">Seleccionar startup</option>
            {organizations.map((organization) => <option value={organization.slug} key={organization.slug}>{organization.name}</option>)}
          </select>
        </label>
      )}
      <label className="field-label">
        Motivo de la decisión
        <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={300} placeholder="Fuente comprobada, falta información..." />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div>
        <button className="button-secondary button-small" type="button" onClick={() => decide("rejected")} disabled={Boolean(loading)}>
          {loading === "rejected" ? <LoaderCircle className="spin" size={15} aria-hidden="true" /> : <X size={15} aria-hidden="true" />} Rechazar
        </button>
        <button className="button-primary button-small" type="button" onClick={() => decide("approved")} disabled={Boolean(loading)}>
          {loading === "approved" ? <LoaderCircle className="spin" size={15} aria-hidden="true" /> : <Check size={15} aria-hidden="true" />} Aprobar
        </button>
      </div>
    </div>
  );
}
