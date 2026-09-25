"use client";

import { clientRequest } from "@/lib/client-request";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { selectClass } from "@/components/ui/field";
import { statusInfo } from "@/lib/application-status";
import { cx } from "@/lib/cx";

const statuses = [
  "enviada",
  "vista",
  "contactada",
  "entrevista",
  "oferta",
  "seleccionada",
  "no_continua",
];

export function OrganizationApplicationControl({
  applicationId,
  organizationSlug,
  currentStatus,
  candidateName,
}: {
  applicationId: string;
  organizationSlug: string;
  currentStatus: string;
  candidateName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function update(status: string) {
    if (status === currentStatus) return;
    setLoading(true);
    setError("");
    const response = await clientRequest("/api/organization/applications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        applicationId,
        organizationSlug,
        status,
        note: "",
      }),
    });
    if (response.ok) router.refresh();
    else {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(payload.error ?? "No pudimos actualizar el estado.");
    }
    setLoading(false);
  }
  const closed = Boolean(statusInfo(currentStatus).closed);
  return (
    <div className="grid justify-items-end gap-1">
      <span className="flex items-center gap-2">
        {loading && (
          <LoaderCircle
            className="size-4 animate-spin text-muted"
            aria-hidden="true"
          />
        )}
        <select
          className={cx(selectClass, "min-h-10 w-auto text-sm font-semibold")}
          value={currentStatus}
          onChange={(event) => update(event.target.value)}
          disabled={loading || closed}
          aria-label={`Estado de la postulación de ${candidateName}`}
        >
          {statuses.map((status) => (
            <option value={status} key={status}>
              {statusInfo(status).label}
            </option>
          ))}
          {currentStatus === "retirada" && (
            <option value="retirada">{statusInfo("retirada").label}</option>
          )}
        </select>
      </span>
      {error && (
        <p className="text-[13px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
