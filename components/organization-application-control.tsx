"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

const statuses = ["enviada", "vista", "contactada", "entrevista", "oferta", "seleccionada", "no_continua"];

export function OrganizationApplicationControl({ applicationId, organizationSlug, currentStatus }: { applicationId: string; organizationSlug: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function update(status: string) {
    if (status === currentStatus) return;
    setLoading(true);
    const response = await fetch("/api/organization/applications", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ applicationId, organizationSlug, status, note: "" }),
    });
    if (response.ok) router.refresh();
    else setLoading(false);
  }
  return (
    <span className="organization-status-control">
      <select value={currentStatus} onChange={(event) => update(event.target.value)} disabled={loading || ["seleccionada", "no_continua", "retirada"].includes(currentStatus)} aria-label="Estado de la postulación">
        {statuses.map((status) => <option value={status} key={status}>{status.replace("_", " ")}</option>)}
        {currentStatus === "retirada" && <option value="retirada">retirada</option>}
      </select>
      {loading && <LoaderCircle className="spin" size={15} aria-hidden="true" />}
    </span>
  );
}
