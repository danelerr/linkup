"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

export function RecordExternalApplication({
  opportunitySlug,
  authenticated,
  initialRecorded,
  autoRecord = false,
}: {
  opportunitySlug: string;
  authenticated: boolean;
  initialRecorded: boolean;
  autoRecord?: boolean;
}) {
  const router = useRouter();
  const [recorded, setRecorded] = useState(initialRecorded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = `/oportunidades/${opportunitySlug}?registrar=1`;

  async function record() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, answers: [] }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
    if (response.ok) {
      setRecorded(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("registrar");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    } else if (payload.code === "PROFILE_INCOMPLETE") {
      router.push(`/mi-linkup/perfil?return_to=${encodeURIComponent(returnTo)}`);
    } else {
      setError(payload.error ?? "No pudimos registrar esta postulación.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authenticated || !autoRecord || recorded) return;
    const controller = new AbortController();
    fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, answers: [] }),
      signal: controller.signal,
    }).then(async (response) => {
      if (controller.signal.aborted) return;
      const payload = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
      if (response.ok) {
        setRecorded(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("registrar");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      } else if (payload.code === "PROFILE_INCOMPLETE") {
        router.push(`/mi-linkup/perfil?return_to=${encodeURIComponent(returnTo)}`);
      } else setError(payload.error ?? "No pudimos registrar esta postulación.");
    });
    return () => controller.abort();
  }, [authenticated, autoRecord, opportunitySlug, recorded, returnTo, router]);

  if (!authenticated) {
    return <Link className="external-record-link" href={`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`}>Ya me postulé en el sitio oficial</Link>;
  }
  if (recorded) {
    return <Link className="external-record-link is-recorded" href="/mi-linkup/postulaciones"><CheckCircle2 size={14} aria-hidden="true" /> Postulación registrada</Link>;
  }
  return (
    <div className="external-record-wrap">
      <button className="external-record-link" type="button" onClick={record} disabled={loading}>
        {loading && <LoaderCircle className="spin" size={14} aria-hidden="true" />} Ya me postulé en el sitio oficial
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
