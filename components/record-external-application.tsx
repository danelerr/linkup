"use client";

import { clientRequest } from "@/lib/client-request";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { textLinkClass } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { signInPath } from "@/lib/navigation";

export function RecordExternalApplication({
  opportunitySlug,
  authenticated,
  initialRecorded,
  autoRecord = false,
  className,
}: {
  opportunitySlug: string;
  authenticated: boolean;
  initialRecorded: boolean;
  autoRecord?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [recorded, setRecorded] = useState(initialRecorded);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = `/oportunidades/${opportunitySlug}?registrar=1`;

  async function record() {
    setLoading(true);
    setError("");
    const response = await clientRequest("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, answers: [] }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    if (response.ok) {
      setRecorded(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("registrar");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}`,
      );
    } else if (payload.code === "PROFILE_INCOMPLETE") {
      router.push(
        `/mi-linkup/perfil?return_to=${encodeURIComponent(returnTo)}`,
      );
    } else {
      setError(payload.error ?? "No pudimos registrar esta postulación.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authenticated || !autoRecord || recorded) return;
    const controller = new AbortController();
    clientRequest("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, answers: [] }),
      signal: controller.signal,
    }).then(async (response) => {
      if (controller.signal.aborted) return;
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      if (response.ok) {
        setRecorded(true);
        const url = new URL(window.location.href);
        url.searchParams.delete("registrar");
        window.history.replaceState(
          window.history.state,
          "",
          `${url.pathname}${url.search}`,
        );
      } else if (payload.code === "PROFILE_INCOMPLETE") {
        router.push(
          `/mi-linkup/perfil?return_to=${encodeURIComponent(returnTo)}`,
        );
      } else
        setError(payload.error ?? "No pudimos registrar esta postulación.");
    });
    return () => controller.abort();
  }, [authenticated, autoRecord, opportunitySlug, recorded, returnTo, router]);

  const wrapper = cx("text-center text-sm", className);
  if (!authenticated) {
    return (
      <p className={wrapper}>
        <span className="text-muted">¿Ya postulaste? </span>
        <Link className={textLinkClass} href={signInPath(returnTo, true)}>
          Regístralo en tu LinkUp
        </Link>
      </p>
    );
  }
  if (recorded) {
    return (
      <p className={wrapper}>
        <Link
          className="inline-flex items-center gap-1.5 font-semibold text-success hover:underline"
          href="/mi-linkup/postulaciones"
        >
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Postulación registrada · Ver seguimiento
        </Link>
      </p>
    );
  }
  return (
    <div className={wrapper}>
      <span className="text-muted">¿Ya postulaste? </span>
      <button
        className={cx(textLinkClass, "inline-flex items-center gap-1.5")}
        type="button"
        onClick={record}
        disabled={loading}
      >
        {loading && (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        )}
        Regístralo en tu LinkUp
      </button>
      {error && (
        <p className="mt-1.5 font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
