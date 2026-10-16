"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { codeError, tooManyAttempts } from "@/lib/auth-messages";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-policy";
import { buttonClass } from "@/components/ui/button";
import {
  controlClass,
  Field,
  FormError,
  FormSuccess,
} from "@/components/ui/field";
import { cx } from "@/lib/cx";

/**
 * Changes the password with the current one or, when email is configured,
 * with a code sent to the account's email. The code also lets an account
 * created without a password add one.
 */
export function ChangePasswordForm({
  email,
  hasPassword,
  emailCodes,
}: {
  email: string;
  hasPassword: boolean;
  emailCodes: boolean;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"current" | "code">(
    hasPassword ? "current" : "code",
  );
  const [codeSent, setCodeSent] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (codeSent) codeInput.current?.focus();
  }, [codeSent]);

  function fail(text: string) {
    setState("error");
    setMessage(text);
  }

  async function sendCode() {
    setState("saving");
    setMessage("");
    try {
      const result = await authClient.emailOtp.requestPasswordReset({ email });
      if (result.error)
        return fail(
          result.error.status === 429
            ? tooManyAttempts
            : "No pudimos enviar el código. Vuelve a intentar.",
        );
      setCodeSent(true);
      setState("idle");
    } catch {
      fail("No hay conexión. Vuelve a intentar.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const newPassword = String(form.get("newPassword"));
    if (newPassword !== String(form.get("confirmation")))
      return fail("La nueva contraseña y su confirmación no coinciden.");
    setState("saving");
    setMessage("");
    try {
      if (method === "current") {
        const result = await authClient.changePassword({
          currentPassword: String(form.get("currentPassword")),
          newPassword,
          revokeOtherSessions: true,
        });
        if (result.error)
          return fail(
            result.error.status === 429
              ? tooManyAttempts
              : "Revisa tu contraseña actual.",
          );
      } else {
        const reset = await authClient.emailOtp.resetPassword({
          email,
          otp: String(form.get("code")).replace(/\D/g, ""),
          password: newPassword,
        });
        if (reset.error) return fail(codeError(reset.error));
        // Resetting closes every session, this one included; open a new one.
        const signedIn = await authClient.signIn.email({
          email,
          password: newPassword,
        });
        if (signedIn.error) {
          router.push("/ingresar?return_to=/mi-linkup/perfil");
          return;
        }
        setCodeSent(false);
        setMethod("current");
        // The page now knows the account has a password.
        router.refresh();
      }
      formElement.reset();
      setState("saved");
      setMessage(
        hasPassword
          ? "Contraseña actualizada. Cerramos tu sesión en los demás dispositivos."
          : "Contraseña creada. Ahora también puedes ingresar con ella.",
      );
    } catch {
      fail("No hay conexión. Vuelve a intentar.");
    }
  }

  const saving = state === "saving";
  const spinner = saving && (
    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
  );
  const feedback = (
    <>
      {state === "error" && <FormError>{message}</FormError>}
      {state === "saved" && <FormSuccess>{message}</FormSuccess>}
    </>
  );
  const linkClass =
    "text-sm font-medium text-action hover:underline sm:justify-self-start";

  if (!hasPassword && !emailCodes)
    return (
      <section className="rounded-panel border border-line bg-paper p-5 sm:p-6">
        <h2 className="text-base font-semibold">Contraseña</h2>
        <p className="mt-1 text-sm leading-6 text-body">
          Tu cuenta no tiene contraseña: ingresas con un código que llega a tu
          correo.
        </p>
      </section>
    );

  return (
    <section className="rounded-panel border border-line bg-paper p-5 sm:p-6">
      <h2 className="text-base font-semibold">Contraseña</h2>
      <p className="mt-1 text-sm leading-6 text-body">
        {method === "current"
          ? "Si te dieron una contraseña temporal, cámbiala aquí."
          : codeSent
            ? `Te enviamos un código de 6 dígitos a ${email}. Vence en 10 minutos.`
            : hasPassword
              ? "Te enviaremos un código a tu correo para confirmar que eres tú."
              : "Tu cuenta no tiene contraseña: ingresas con un código que llega a tu correo. Si quieres, crea una."}
      </p>

      {method === "code" && !codeSent ? (
        <div className="mt-4 grid gap-3">
          {feedback}
          <button
            type="button"
            className={buttonClass({
              variant: "secondary",
              className: "sm:justify-self-start",
            })}
            disabled={saving}
            onClick={sendCode}
          >
            {spinner}
            Enviar código a {email}
          </button>
          {hasPassword && (
            <button
              type="button"
              className={linkClass}
              onClick={() => {
                setMethod("current");
                setState("idle");
              }}
            >
              Usar la contraseña actual
            </button>
          )}
        </div>
      ) : (
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          {method === "current" ? (
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
          ) : (
            <Field className="sm:col-span-2" label="Código">
              <input
                ref={codeInput}
                className={cx(
                  controlClass,
                  "font-meta text-xl tracking-[0.3em] sm:max-w-48",
                )}
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
              />
            </Field>
          )}
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
          <Field label="Repite la nueva contraseña">
            <input
              className={controlClass}
              name="confirmation"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              maxLength={128}
              autoComplete="new-password"
            />
          </Field>
          <div className="grid gap-3 sm:col-span-2">
            {feedback}
            <button
              className={buttonClass({
                variant: "secondary",
                className: "sm:justify-self-start",
              })}
              disabled={saving}
            >
              {spinner}
              {hasPassword ? "Cambiar contraseña" : "Crear contraseña"}
            </button>
            {method === "current" && emailCodes && (
              <button
                type="button"
                className={linkClass}
                onClick={() => {
                  setMethod("code");
                  setState("idle");
                }}
              >
                ¿No recuerdas la actual? Cámbiala con un código por correo
              </button>
            )}
            {method === "code" && (
              <button
                type="button"
                className={linkClass}
                disabled={saving}
                onClick={sendCode}
              >
                Reenviar código
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
