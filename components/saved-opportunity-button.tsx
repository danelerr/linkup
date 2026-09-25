"use client";

import { clientRequest } from "@/lib/client-request";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StateIcon } from "@/components/state-icon";
import { buttonClass } from "@/components/ui/button";

export function SavedOpportunityButton({
  opportunitySlug,
  initialSaved,
  authenticated,
  autoSave = false,
  from = "/",
  className,
  labelClassName,
}: {
  opportunitySlug: string;
  initialSaved: boolean;
  authenticated: boolean;
  autoSave?: boolean;
  from?: string;
  className?: string;
  /** Lets a compact layout hide the text visually and keep it for readers. */
  labelClassName?: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = `/oportunidades/${opportunitySlug}?guardar=1&from=${encodeURIComponent(from)}`;
  const classes = buttonClass({
    variant: saved ? "success" : "secondary",
    className,
  });

  useEffect(() => {
    if (!authenticated || !autoSave || saved) return;
    let active = true;
    clientRequest("/api/saved-opportunities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, save: true }),
    }).then(async (response) => {
      if (!active) return;
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "No pudimos guardar la oportunidad.");
        return;
      }
      setSaved(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("guardar");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}`,
      );
    });
    return () => {
      active = false;
    };
  }, [authenticated, autoSave, opportunitySlug, saved]);

  if (!authenticated) {
    return (
      <Link
        className={classes}
        href={`/ingresar?return_to=${encodeURIComponent(returnTo)}`}
        aria-label="Ingresa para guardar esta oportunidad"
      >
        <StateIcon state="bookmark" />
        <span className={labelClassName}>Guardar</span>
      </Link>
    );
  }

  async function toggle() {
    setLoading(true);
    setError("");
    const response = await clientRequest("/api/saved-opportunities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, save: !saved }),
    });
    if (response.ok) setSaved((value) => !value);
    else {
      const data = await response.json();
      setError(data.error || "No pudimos guardar el cambio.");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        className={classes}
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={saved}
        aria-busy={loading}
      >
        <StateIcon state={saved ? "saved" : "bookmark"} />
        <span className={labelClassName}>
          {loading ? "Guardando…" : saved ? "Guardada" : "Guardar"}
        </span>
      </button>
      {error && (
        <p className="text-[13px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
