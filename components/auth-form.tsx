"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { codeError, tooManyAttempts } from "@/lib/auth-messages";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-policy";
import { safeRelativeReturnPath } from "@/lib/navigation";
import { buttonClass } from "@/components/ui/button";
import { controlClass, Field, FormError } from "@/components/ui/field";
import { cx } from "@/lib/cx";

/**
 * A code sent by email, waiting to be typed: to sign in (which also creates
 * the account the first time), to confirm the email of a password account or
 * to choose a new password.
 */
type PendingCode = {
  email: string;
  purpose: "sign-in" | "email-verification" | "forget-password";
  name: string;
};

export function AuthForm({
  returnTo,
  initialMode = "signin",
  emailCodes = false,
}: {
  returnTo: string;
  initialMode?: "signin" | "signup";
  /** The server can send email, so codes are offered next to passwords. */
  emailCodes?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [method, setMethod] = useState<"password" | "code" | "reset">(
    "password",
  );
  const [pending, setPending] = useState<PendingCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const codeInput = useRef<HTMLInputElement>(null);
  const usingCode = emailCodes && method === "code";
  const resetting = emailCodes && method === "reset";

  useEffect(() => {
    if (pending) codeInput.current?.focus();
  }, [pending]);

  /** Runs one request; `action` returns true when the person is signed in. */
  async function run(action: () => Promise<boolean>) {
    setLoading(true);
    setError("");
    setNotice("");
    let navigating = false;
    try {
      navigating = await action();
      if (navigating) router.replace(safeRelativeReturnPath(returnTo));
    } catch {
      setError("No hay conexión. Tus datos siguen aquí; vuelve a intentar.");
    } finally {
      // Keep the button busy while the next page loads.
      if (!navigating) setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const name = mode === "signup" ? String(form.get("name")).trim() : "";
    return run(async () => {
      if (resetting) {
        const result = await authClient.emailOtp.requestPasswordReset({
          email,
        });
        if (result.error) {
          setError(
            result.error.status === 429
              ? tooManyAttempts
              : "No pudimos enviar el código. Revisa el correo.",
          );
          return false;
        }
        setPending({ email, purpose: "forget-password", name: "" });
        return false;
      }
      if (usingCode) {
        const result = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "sign-in",
        });
        if (result.error) {
          setError(
            result.error.status === 429
              ? tooManyAttempts
              : "No pudimos enviar el código. Revisa el correo.",
          );
          return false;
        }
        setPending({ email, purpose: "sign-in", name });
        return false;
      }
      const password = String(form.get("password"));
      if (mode === "signup") {
        const result = await authClient.signUp.email({ email, password, name });
        if (result.error) {
          setError(
            result.error.status === 429
              ? tooManyAttempts
              : "No pudimos crear la cuenta. Revisa los datos; si ya tienes cuenta, ingresa.",
          );
          return false;
        }
        // No session yet: the account must confirm its email with a code.
        if (!result.data?.token) {
          setPending({ email, purpose: "email-verification", name });
          return false;
        }
        return true;
      }
      const result = await authClient.signIn.email({ email, password });
      if (result.error?.code === "EMAIL_NOT_VERIFIED") {
        // The server just sent a confirmation code to this address.
        setPending({ email, purpose: "email-verification", name: "" });
        setNotice("Tu correo aún no está confirmado.");
        return false;
      }
      if (result.error) {
        setError(
          result.error.status === 429
            ? tooManyAttempts
            : "Revisa tu correo y contraseña.",
        );
        return false;
      }
      return true;
    });
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending) return;
    const form = new FormData(event.currentTarget);
    const otp = String(form.get("code")).replace(/\D/g, "");
    return run(async () => {
      if (pending.purpose === "forget-password") {
        const password = String(form.get("newPassword"));
        const reset = await authClient.emailOtp.resetPassword({
          email: pending.email,
          otp,
          password,
        });
        if (reset.error) {
          setError(codeError(reset.error));
          return false;
        }
        // Resetting closes every session; open one with the new password.
        const signedIn = await authClient.signIn.email({
          email: pending.email,
          password,
        });
        if (signedIn.error) {
          setPending(null);
          setMethod("password");
          setNotice("Guardamos tu nueva contraseña. Ingresa con ella.");
          return false;
        }
        return true;
      }
      const result =
        pending.purpose === "sign-in"
          ? await authClient.signIn.emailOtp({
              email: pending.email,
              otp,
              // Only used when this code creates the account.
              ...(pending.name && { name: pending.name }),
            })
          : await authClient.emailOtp.verifyEmail({
              email: pending.email,
              otp,
            });
      if (result.error) {
        setError(codeError(result.error));
        return false;
      }
      return true;
    });
  }

  function resend() {
    if (!pending) return;
    return run(async () => {
      const result =
        pending.purpose === "forget-password"
          ? await authClient.emailOtp.requestPasswordReset({
              email: pending.email,
            })
          : await authClient.emailOtp.sendVerificationOtp({
              email: pending.email,
              type: pending.purpose,
            });
      if (result.error)
        setError(
          result.error.status === 429
            ? tooManyAttempts
            : "No pudimos reenviar el código.",
        );
      else setNotice("Te enviamos un código nuevo.");
      return false;
    });
  }

  if (pending)
    return (
      <>
        <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.04em]">
          Revisa tu correo
        </h1>
        <p className="mt-2.5 text-[15px] leading-6 text-body">
          Te enviamos un código de 6 dígitos a{" "}
          <span className="font-semibold text-ink">{pending.email}</span>. Vence
          en 10 minutos.
        </p>
        {notice && (
          <p className="mt-4 text-sm font-medium text-ink" role="status">
            {notice}
          </p>
        )}
        <form className="mt-8 grid gap-4" onSubmit={verify}>
          <Field label="Código">
            <input
              ref={codeInput}
              className={cx(controlClass, "font-meta text-xl tracking-[0.3em]")}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              required
            />
          </Field>
          {pending.purpose === "forget-password" && (
            <Field
              label="Nueva contraseña"
              hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
            >
              <input
                className={controlClass}
                name="newPassword"
                type="password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={128}
                autoComplete="new-password"
              />
            </Field>
          )}
          <FormError>{error}</FormError>
          <button
            className={buttonClass({ block: true, className: "mt-1" })}
            disabled={loading}
          >
            {loading && (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {pending.purpose === "sign-in"
              ? "Ingresar"
              : pending.purpose === "forget-password"
                ? "Guardar contraseña e ingresar"
                : "Confirmar correo"}
          </button>
        </form>
        <div className="mt-5 flex items-center justify-between gap-4 text-sm font-medium">
          <button
            type="button"
            className="text-action hover:underline"
            disabled={loading}
            onClick={resend}
          >
            Reenviar código
          </button>
          <button
            type="button"
            className="text-muted hover:text-ink"
            disabled={loading}
            onClick={() => {
              setPending(null);
              setError("");
              setNotice("");
            }}
          >
            Usar otro correo
          </button>
        </div>
      </>
    );

  return (
    <>
      <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.04em]">
        {resetting
          ? "Elige una contraseña nueva"
          : mode === "signup"
            ? "Crea tu cuenta"
            : "Ingresa a LinkUp"}
      </h1>
      <p className="mt-2.5 text-[15px] leading-6 text-body">
        {resetting ? (
          "Te enviaremos un código a tu correo para confirmar que eres tú."
        ) : (
          <>
            {mode === "signup" && "Es gratis. "}Para guardar oportunidades,
            crear alertas y seguir tus postulaciones.
          </>
        )}
      </p>
      {notice && (
        <p className="mt-4 text-sm font-medium text-ink" role="status">
          {notice}
        </p>
      )}
      <div
        className={cx(
          "mt-8 grid grid-cols-2 rounded-full border border-line bg-surface p-1",
          resetting && "hidden",
        )}
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
        {mode === "signup" && !resetting && (
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
        {!usingCode && !resetting && (
          <Field
            label="Contraseña"
            hint={
              mode === "signup"
                ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`
                : emailCodes
                  ? undefined
                  : // No email: an operator issues a temporary password
                    // with `npm run password`.
                    "¿La olvidaste? Pide una temporal a quien administra LinkUp."
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
        )}
        {mode === "signin" && emailCodes && method === "password" && (
          <button
            type="button"
            className="-mt-2 justify-self-start text-[13px] text-muted hover:text-action"
            onClick={() => {
              setMethod("reset");
              setError("");
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
        )}
        <FormError>{error}</FormError>
        <button
          className={buttonClass({ block: true, className: "mt-1" })}
          disabled={loading}
        >
          {loading && (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          )}
          {usingCode || resetting
            ? "Enviar código"
            : mode === "signin"
              ? "Ingresar"
              : "Crear cuenta"}
        </button>
      </form>
      {emailCodes && (
        <button
          type="button"
          className="mt-5 self-center text-sm font-semibold text-action hover:underline"
          disabled={loading}
          onClick={() => {
            setMethod(usingCode || resetting ? "password" : "code");
            setError("");
          }}
        >
          {resetting
            ? "Volver a ingresar con contraseña"
            : usingCode
              ? "Usar contraseña"
              : mode === "signin"
                ? "Ingresar con un código por correo"
                : "Crear la cuenta con un código, sin contraseña"}
        </button>
      )}
    </>
  );
}
