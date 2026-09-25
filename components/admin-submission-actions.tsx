"use client";

import { clientRequest } from "@/lib/client-request";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FormError,
  selectClass,
} from "@/components/ui/field";

type OrganizationOption = { slug: string; name: string };

export function AdminSubmissionActions({
  id,
  kind,
  suggestedSlug,
  organizations,
}: {
  id: string;
  kind: string;
  suggestedSlug?: string;
  organizations: OrganizationOption[];
}) {
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
    const response = await clientRequest("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        reason,
        organizationSlug: organizationSlug || undefined,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    if (response.ok) router.refresh();
    else {
      setError(payload.error ?? "No pudimos guardar la decisión.");
      setLoading(null);
    }
  }

  return (
    <div className="mt-5 grid gap-4 rounded-control bg-surface p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {kind === "claim" && (
          <Field label="Organización vinculada">
            <select
              className={selectClass}
              value={organizationSlug}
              onChange={(event) => setOrganizationSlug(event.target.value)}
            >
              <option value="">Seleccionar startup</option>
              {organizations.map((organization) => (
                <option value={organization.slug} key={organization.slug}>
                  {organization.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field
          className={kind === "claim" ? undefined : "sm:col-span-2"}
          label="Motivo de la decisión"
        >
          <input
            className={controlClass}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={300}
            placeholder="Fuente comprobada, falta información…"
          />
        </Field>
      </div>
      <FormError>{error}</FormError>
      <div className="flex flex-wrap gap-2">
        {kind === "claim" ? (
          <button
            className={buttonClass({ size: "sm" })}
            type="button"
            onClick={() => decide("approved")}
            disabled={Boolean(loading)}
          >
            {loading === "approved" ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Check className="size-4" aria-hidden="true" />
            )}
            Aprobar acceso
          </button>
        ) : (
          <Link
            className={buttonClass({ size: "sm" })}
            href={
              kind === "correction"
                ? `/admin/catalogo?envio=${id}`
                : `/admin/catalogo/editar?tipo=${kind}&envio=${id}`
            }
          >
            Revisar y publicar
          </Link>
        )}
        <button
          className={buttonClass({ variant: "danger", size: "sm" })}
          type="button"
          onClick={() => decide("rejected")}
          disabled={Boolean(loading)}
        >
          {loading === "rejected" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <X className="size-4" aria-hidden="true" />
          )}
          Rechazar
        </button>
      </div>
    </div>
  );
}
