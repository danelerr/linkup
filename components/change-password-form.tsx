"use client";
import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buttonClass } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FormError,
  FormSuccess,
} from "@/components/ui/field";

export function ChangePasswordForm() {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const newPassword = String(form.get("newPassword"));
    if (newPassword !== String(form.get("confirmation"))) {
      setState("error");
      setMessage("La nueva contraseña y su confirmación no coinciden.");
      return;
    }
    setState("saving");
    setMessage("");
    try {
      const result = await authClient.changePassword({
        currentPassword: String(form.get("currentPassword")),
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) {
        setState("error");
        setMessage(
          result.error.status === 429
            ? "Demasiados intentos. Espera un minuto y vuelve a intentar."
            : "Revisa tu contraseña actual.",
        );
        return;
      }
      formElement.reset();
      setState("saved");
      setMessage(
        "Contraseña actualizada. Cerramos tu sesión en los demás dispositivos.",
      );
    } catch {
      setState("error");
      setMessage("No hay conexión. Vuelve a intentar.");
    }
  }

  return (
    <section className="rounded-panel border border-line bg-paper p-5 sm:p-6">
      <h2 className="text-base font-semibold">Contraseña</h2>
      <p className="mt-1 text-sm leading-6 text-body">
        Si te dieron una contraseña temporal, cámbiala aquí.
      </p>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field className="sm:col-span-2" label="Contraseña actual">
          <input
            className={controlClass}
            name="currentPassword"
            type="password"
            required
            maxLength={128}
            autoComplete="current-password"
          />
        </Field>
        <Field
          label="Nueva contraseña"
          hint="Al menos 12 caracteres. Puedes usar una frase."
        >
          <input
            className={controlClass}
            name="newPassword"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Repite la nueva contraseña">
          <input
            className={controlClass}
            name="confirmation"
            type="password"
            required
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
          />
        </Field>
        <div className="grid gap-3 sm:col-span-2">
          {state === "error" && <FormError>{message}</FormError>}
          {state === "saved" && <FormSuccess>{message}</FormSuccess>}
          <button
            className={buttonClass({
              variant: "secondary",
              className: "sm:justify-self-start",
            })}
            disabled={state === "saving"}
          >
            {state === "saving" && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Cambiar contraseña
          </button>
        </div>
      </form>
    </section>
  );
}
