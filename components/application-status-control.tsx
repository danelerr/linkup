"use client";

import { clientRequest } from "@/lib/client-request";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { selectClass } from "@/components/ui/field";
import { statusInfo } from "@/lib/application-status";
import { cx } from "@/lib/cx";

const selfReported = [
  "contactada",
  "entrevista",
  "oferta",
  "seleccionada",
  "no_continua",
  "sin_respuesta",
  "retirada",
];

export function ApplicationStatusControl({
  applicationId,
  mode,
  currentStatus,
}: {
  applicationId: string;
  mode: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const closed = Boolean(statusInfo(status).closed);

  async function update(nextStatus: string) {
    if (!nextStatus || nextStatus === status) return;
    setLoading(true);
    setError("");
    const response = await clientRequest("/api/applications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ applicationId, status: nextStatus, note: "" }),
    });
    if (response.ok) {
      setStatus(nextStatus);
      router.refresh();
    } else {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(payload.error ?? "No pudimos actualizar el estado.");
    }
    setLoading(false);
  }

  if (closed)
    return (
      <p className="text-sm text-muted">
        Proceso cerrado · {statusInfo(status).label}
      </p>
    );

  return (
    <div className="grid gap-1.5">
      {mode === "native" ? (
        confirming ? (
          <div className="flex flex-wrap items-center gap-2" role="group">
            <p className="text-sm font-medium text-ink">
              ¿Retirar? La organización dejará de considerarte.
            </p>
            <button
              className={buttonClass({ variant: "danger", size: "sm" })}
              type="button"
              disabled={loading}
              onClick={() => update("retirada")}
            >
              {loading && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Sí, retirar
            </button>
            <button
              className={buttonClass({ variant: "quiet", size: "sm" })}
              type="button"
              disabled={loading}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm text-muted">
              La organización actualiza este proceso.
            </p>
            <button
              className={buttonClass({ variant: "quiet", size: "sm" })}
              type="button"
              onClick={() => setConfirming(true)}
            >
              Retirar postulación
            </button>
          </div>
        )
      ) : (
        <label className="flex items-center gap-3">
          <span className="text-sm font-semibold whitespace-nowrap text-body">
            ¿Qué pasó?
          </span>
          <select
            className={cx(selectClass, "min-h-10 w-auto text-sm")}
            value={status}
            onChange={(event) => update(event.target.value)}
            disabled={loading}
          >
            <option value={status}>{statusInfo(status).label}</option>
            {selfReported
              .filter((item) => item !== status)
              .map((item) => (
                <option value={item} key={item}>
                  {statusInfo(item).label}
                </option>
              ))}
          </select>
          {loading && (
            <LoaderCircle
              className="size-4 animate-spin text-muted"
              aria-hidden="true"
            />
          )}
        </label>
      )}
      {error && (
        <p className="text-[13px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
