"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-policy";
import { safeRelativeReturnPath } from "@/lib/navigation";
import { buttonClass } from "@/components/ui/button";
import { controlClass, Field, FormError } from "@/components/ui/field";
import { cx } from "@/lib/cx";

export function AuthForm({
  returnTo,
  initialMode = "signin",
}: {
  returnTo: string;
  initialMode?: "signin" | "signup";
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    let navigating = false;
    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({
              email,
              password,
              name: String(form.get("name")).trim(),
            })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          result.error.status === 429
            ? "Demasiados intentos. Espera un minuto y vuelve a intentar."
            : mode === "signin"
              ? "Revisa tu correo y contraseña."
              : "No pudimos crear la cuenta. Revisa los datos; si ya tienes cuenta, ingresa.",
        );
      } else {
        navigating = true;
        router.replace(safeRelativeReturnPath(returnTo));
      }
    } catch {
      setError("No hay conexión. Tus datos siguen aquí; vuelve a intentar.");
    } finally {
      // Keep the button busy while the next page loads.
      if (!navigating) setLoading(false);
    }
  }
  return (
    <>
      <div
        className="mt-8 grid grid-cols-2 rounded-full border border-line bg-surface p-1"
        role="group"
        aria-label="Tipo de acceso"
      >
        {(
          [
            ["signin", "Ingresar"],
            ["signup", "Crear cuenta"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            disabled={loading}
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setError("");
            }}
            className={cx(
              "min-h-9 rounded-full text-sm font-semibold transition-colors",
              mode === value
                ? "border border-line bg-paper text-ink"
                : "border border-transparent text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        {mode === "signup" && (
          <Field label="Tu nombre">
            <input
              className={controlClass}
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
          </Field>
        )}
        <Field label="Correo">
          <input
            className={controlClass}
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
          />
        </Field>
        <Field
          label="Contraseña"
          hint={
            mode === "signup"
              ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
              : undefined
          }
        >
          <input
            className={controlClass}
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : 1}
            maxLength={128}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
          />
        </Field>
        <FormError>{error}</FormError>
        <button
          className={buttonClass({ block: true, className: "mt-1" })}
          disabled={loading}
        >
          {loading && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          {mode === "signin" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
    </>
  );
}
