"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export function ApplicationStatusControl({ applicationId, mode, currentStatus }: { applicationId: string; mode: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const allowed = mode === "native"
    ? ["retirada"]
    : ["contactada", "entrevista", "oferta", "seleccionada", "no_continua", "sin_respuesta", "retirada"];

  async function update(nextStatus: string) {
    if (!nextStatus || nextStatus === status) return;
    setLoading(true);
    const response = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ applicationId, status: nextStatus, note: "" }),
    });
    if (response.ok) {
      setStatus(nextStatus);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <label className="status-control">
      <span>Actualizar estado</span>
      <span className="status-select-wrap">
        <select value={status} onChange={(event) => update(event.target.value)} disabled={loading || status === "retirada"}>
          <option value={status}>{status.replace("_", " ")}</option>
          {allowed.filter((item) => item !== status).map((item) => (
            <option value={item} key={item}>{item.replace("_", " ")}</option>
          ))}
        </select>
        {loading && <LoaderCircle className="spin" size={15} aria-hidden="true" />}
      </span>
    </label>
  );
}
