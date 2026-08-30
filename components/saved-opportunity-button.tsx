"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, LoaderCircle } from "lucide-react";

export function SavedOpportunityButton({
  opportunitySlug,
  initialSaved,
  authenticated,
  autoSave = false,
}: {
  opportunitySlug: string;
  initialSaved: boolean;
  authenticated: boolean;
  autoSave?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const returnTo = `/oportunidades/${opportunitySlug}?guardar=1`;

  useEffect(() => {
    if (!authenticated || !autoSave || saved) return;
    let active = true;
    fetch("/api/saved-opportunities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, save: true }),
    }).then((response) => {
      if (!active || !response.ok) return;
      setSaved(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("guardar");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    });
    return () => { active = false; };
  }, [authenticated, autoSave, opportunitySlug, saved]);

  if (!authenticated) {
    return (
      <Link className="button-secondary aside-button" href={`/signin-with-chatgpt?return_to=${encodeURIComponent(returnTo)}`}>
        <Bookmark size={16} aria-hidden="true" /> Guardar oportunidad
      </Link>
    );
  }

  async function toggle() {
    setLoading(true);
    const response = await fetch("/api/saved-opportunities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ opportunitySlug, save: !saved }),
    });
    if (response.ok) setSaved((value) => !value);
    setLoading(false);
  }

  return (
    <button className="button-secondary aside-button" type="button" onClick={toggle} disabled={loading} aria-pressed={saved}>
      {loading ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : saved ? <BookmarkCheck size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
      {saved ? "Guardada" : "Guardar oportunidad"}
    </button>
  );
}
