"use client";

import { clientRequest } from "@/lib/client-request";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LoaderCircle, Trash2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { controlClass, Field, FormError } from "@/components/ui/field";

export function AccountDataActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setLoading(true);
    setError("");
    const response = await clientRequest("/api/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      signOutPath?: string;
    };
    if (response.ok && payload.signOutPath) router.replace(payload.signOutPath);
    else {
      setError(payload.error ?? "No pudimos eliminar los datos.");
      setLoading(false);
    }
  }

  return (
    <section className="rounded-panel border border-line bg-paper p-5 sm:p-6">
      <h2 className="text-base font-semibold">Tus datos</h2>
      <p className="mt-1 text-sm leading-6 text-body">
        Descarga una copia o elimina los datos que LinkUp guarda sobre ti.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          className={buttonClass({ variant: "secondary", size: "sm" })}
          href="/api/account/export"
        >
          <Download className="size-4" aria-hidden="true" />
          Descargar copia
        </a>
        <button
          className={buttonClass({ variant: "danger", size: "sm" })}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Eliminar datos
        </button>
      </div>
      {open && (
        <div className="mt-5 grid gap-4 rounded-control border border-danger/25 bg-danger-soft p-4">
          <p className="text-sm leading-6 text-danger">
            Esto elimina tu cuenta, sesiones, perfil, guardados, alertas y
            postulaciones. Los registros operativos se desidentifican. No se
            puede deshacer.
          </p>
          <Field
            label={
              <>
                Escribe <strong>ELIMINAR</strong> para confirmar
              </>
            }
          >
            <input
              className={controlClass}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
            />
          </Field>
          <FormError>{error}</FormError>
          <button
            className={buttonClass({
              variant: "destructive",
              className: "sm:justify-self-start",
            })}
            type="button"
            onClick={remove}
            disabled={confirmation !== "ELIMINAR" || loading}
          >
            {loading && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Eliminar definitivamente
          </button>
        </div>
      )}
    </section>
  );
}
