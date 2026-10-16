"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
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
 * With email, one path for everyone: the email, then a 6-digit code. The
 * first code creates the account and asks for a name. A password is an
 * optional shortcut, added later from the profile. Without email, accounts
 * use a password only.
 */
type Step = "email" | "code" | "name" | "password";

const RESEND_SECONDS = 30;
const linkClass = "font-semibold text-action hover:underline";

export function AuthForm({
  returnTo,
  emailCodes = false,
  newAccount = false,
}: {
  returnTo: string;
  /** The server can send email, so sign-in starts with a code. */
  emailCodes?: boolean;
  /** Without email: open on "create account" (an action needed one). */
  newAccount?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(emailCodes ? "email" : "password");
  const [email, setEmail] = useState("");
  const [signingUp, setSigningUp] = useState(!emailCodes && newAccount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);

  // Each step starts on its first empty field: the email typed in one step
  // carries over to the next.
  useEffect(() => {
    const inputs = [...(form.current?.querySelectorAll("input") ?? [])];
    (inputs.find((input) => !input.value) ?? inputs[0])?.focus();
  }, [step, signingUp]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function go(next: Step) {
    setStep(next);
    setError("");
    setNotice("");
  }

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

  async function sendCode(address: string) {
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: address,
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
    setEmail(address);
    setStep("code");
    setCooldown(RESEND_SECONDS);
    return true;
  }

  function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    return run(async () => {
      await sendCode(address);
      return false;
    });
  }

  function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem(
      "code",
    ) as HTMLInputElement;
    return run(async () => {
      const result = await authClient.signIn.emailOtp({
        email,
        otp: input.value,
      });
      if (result.error) {
        setError(codeError(result.error));
        input.select();
        return false;
      }
      // The code just created this account: it has no name yet.
      if (!result.data.user.name) {
        go("name");
        return false;
      }
      return true;
    });
  }

  function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name")).trim();
    return run(async () => {
      const result = await authClient.updateUser({ name });
      if (result.error) {
        setError("No pudimos guardar tu nombre. Vuelve a intentar.");
        return false;
      }
      return true;
    });
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const address = email.trim().toLowerCase();
    const password = String(fields.get("password"));
    return run(async () => {
      const result = signingUp
        ? await authClient.signUp.email({
            email: address,
            password,
            name: String(fields.get("name")).trim(),
          })
        : await authClient.signIn.email({ email: address, password });
      if (!result.error) return true;
      setError(
        result.error.status === 429
          ? tooManyAttempts
          : signingUp
            ? "No pudimos crear la cuenta. Si ya tienes una, ingresa."
            : emailCodes
              ? "Correo o contraseña incorrectos. Si no tienes contraseña, ingresa con un código."
              : "Correo o contraseña incorrectos.",
      );
      return false;
    });
  }

  const submitButton = (label: string) => (
    <button
      className={buttonClass({ block: true, className: "mt-1" })}
      disabled={loading}
    >
      {loading && (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      )}
      {label}
    </button>
  );

  const exploreLink = (
    <Link
      className="mt-6 self-center text-sm font-medium text-muted transition-colors hover:text-action"
      href="/"
    >
      Seguir explorando sin cuenta
    </Link>
  );

  const emailField = (
    <Field label="Correo">
      <input
        ref={emailInput}
        className={controlClass}
        name="email"
        type="email"
        required
        maxLength={200}
        autoComplete="email"
        placeholder="tu@correo.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
    </Field>
  );

  if (step === "email")
    return (
      <>
        <Heading title="Ingresa a LinkUp">
          Escribe tu correo y te enviamos un código para entrar. Si aún no
          tienes cuenta, se crea en el mismo paso.
        </Heading>
        <form ref={form} className="mt-8 grid gap-4" onSubmit={requestCode}>
          {emailField}
          <FormError>{error}</FormError>
          {submitButton("Continuar")}
        </form>
        <button
          type="button"
          className={cx(linkClass, "mt-5 self-center text-sm")}
          disabled={loading}
          onClick={() => go("password")}
        >
          Ingresar con contraseña
        </button>
        {exploreLink}
      </>
    );

  if (step === "code")
    return (
      <>
        <Heading title="Revisa tu correo">
          Escribe el código de 6 dígitos que enviamos a{" "}
          <span className="font-semibold text-ink">{email}</span>. Si no lo
          ves, busca en spam.
        </Heading>
        <Notice>{notice}</Notice>
        <form ref={form} className="mt-8 grid gap-4" onSubmit={verifyCode}>
          <Field label="Código">
            <input
              className={cx(controlClass, "font-meta text-xl tracking-[0.3em]")}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              required
              onChange={(event) => {
                // Accepts a pasted "123 456"; six digits submit on their own.
                const input = event.currentTarget;
                input.value = input.value.replace(/\D/g, "").slice(0, 6);
                if (input.value.length === 6 && !loading)
                  input.form?.requestSubmit();
              }}
            />
          </Field>
          <FormError>{error}</FormError>
          {submitButton("Ingresar")}
        </form>
        <div className="mt-5 flex items-center justify-between gap-4 text-sm">
          <button
            type="button"
            className={cx(
              linkClass,
              "disabled:font-medium disabled:text-muted disabled:no-underline",
            )}
            disabled={loading || cooldown > 0}
            onClick={() =>
              run(async () => {
                if (await sendCode(email))
                  setNotice("Te enviamos un código nuevo.");
                return false;
              })
            }
          >
            {cooldown > 0 ? `Reenviar en ${cooldown} s` : "Reenviar código"}
          </button>
          <button
            type="button"
            className="font-medium text-muted hover:text-ink"
            disabled={loading}
            onClick={() => go("email")}
          >
            Cambiar correo
          </button>
        </div>
        {exploreLink}
      </>
    );

  if (step === "name")
    return (
      <>
        <Heading title="¿Cómo te llamas?">
          Es el nombre que verán las startups cuando postules a sus vacantes.
        </Heading>
        <form ref={form} className="mt-8 grid gap-4" onSubmit={saveName}>
          <Field label="Nombre y apellido">
            <input
              className={controlClass}
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />
          </Field>
          <FormError>{error}</FormError>
          {submitButton("Continuar")}
        </form>
      </>
    );

  return (
    <>
      <Heading
        title={
          emailCodes
            ? "Ingresa con tu contraseña"
            : signingUp
              ? "Crea tu cuenta"
              : "Ingresa a LinkUp"
        }
      >
        {!emailCodes &&
          "Para guardar oportunidades, crear alertas y seguir tus postulaciones."}
      </Heading>
      <form ref={form} className="mt-8 grid gap-4" onSubmit={submitPassword}>
        {signingUp && (
          <Field label="Nombre y apellido">
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
        {emailField}
        <Field
          label="Contraseña"
          hint={
            signingUp
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
            minLength={signingUp ? MIN_PASSWORD_LENGTH : 1}
            maxLength={128}
            autoComplete={signingUp ? "new-password" : "current-password"}
          />
        </Field>
        <FormError>{error}</FormError>
        {submitButton(signingUp ? "Crear cuenta" : "Ingresar")}
      </form>
      {emailCodes ? (
        <button
          type="button"
          className={cx(linkClass, "mt-5 self-center text-sm")}
          disabled={loading}
          onClick={() => {
            // With the email already typed, the code goes out right away.
            if (emailInput.current?.checkValidity())
              run(async () => {
                await sendCode(email.trim().toLowerCase());
                return false;
              });
            else go("email");
          }}
        >
          ¿Olvidaste tu contraseña? Ingresa con un código
        </button>
      ) : (
        <p className="mt-5 self-center text-sm text-muted">
          {signingUp ? "¿Ya tienes cuenta?" : "¿Primera vez en LinkUp?"}{" "}
          <button
            type="button"
            className={linkClass}
            disabled={loading}
            onClick={() => {
              setSigningUp(!signingUp);
              setError("");
            }}
          >
            {signingUp ? "Ingresa" : "Crea tu cuenta"}
          </button>
        </p>
      )}
      {exploreLink}
    </>
  );
}

function Heading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.04em]">
        {title}
      </h1>
      {children && (
        <p className="mt-2.5 text-[15px] leading-6 text-body">{children}</p>
      )}
    </>
  );
}

function Notice({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-4 text-sm font-medium text-ink" role="status">
      {children}
    </p>
  );
}
