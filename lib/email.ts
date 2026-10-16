/**
 * Transactional email through Resend's REST API (POST /emails). Without
 * RESEND_API_KEY the app sends nothing and offers password sign-in only.
 */
export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

// Resend only accepts its test sender until a domain is verified, and then
// only delivers to the Resend account's own address.
const defaultFrom = "LinkUp <onboarding@resend.dev>";

type Email = { to: string; subject: string; text: string };

export async function sendEmail({ to, subject, text }: Email) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no está configurada.");
  // RESEND_BASE_URL is the same override the official SDK reads; the
  // integration tests point it at a local stand-in.
  const base = process.env.RESEND_BASE_URL || "https://api.resend.com";
  const response = await fetch(`${base}/emails`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LINKUP_EMAIL_FROM || defaultFrom,
      to: [to],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend rechazó el correo a ${to} (${response.status}): ${detail}`,
    );
  }
}

export type CodePurpose =
  "sign-in" | "email-verification" | "forget-password" | "change-email";

export function codeEmail(to: string, code: string, purpose: CodePurpose) {
  const action =
    purpose === "email-verification"
      ? "confirmar tu correo en LinkUp"
      : purpose === "forget-password"
        ? "elegir una contraseña nueva en LinkUp"
        : "ingresar a LinkUp";
  return {
    to,
    subject: `${code} es tu código de LinkUp`,
    text: [
      `Tu código para ${action} es:`,
      "",
      code,
      "",
      "Vence en 10 minutos. Si no lo pediste, ignora este correo: nadie puede entrar sin él.",
    ].join("\n"),
  };
}
