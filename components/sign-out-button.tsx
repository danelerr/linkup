"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="shrink-0 lg:mt-4 lg:border-t lg:border-line lg:pt-4">
      <button
        className="inline-flex min-h-10 items-center gap-2.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-60 lg:w-full lg:rounded-control"
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const result = await authClient.signOut();
            if (result.error) throw new Error();
            router.replace("/");
          } catch {
            setBusy(false);
            setError("No pudimos cerrar la sesión. Intenta de nuevo.");
          }
        }}
      >
        <LogOut className="size-4" aria-hidden="true" />
        {busy ? "Cerrando…" : "Cerrar sesión"}
      </button>
      {error && (
        <p className="mt-1 px-3.5 text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
