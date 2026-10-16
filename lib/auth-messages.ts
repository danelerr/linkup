// Error messages shared by the forms that use email codes.
export const tooManyAttempts =
  "Demasiados intentos. Espera un minuto y vuelve a intentar.";

export function codeError(error: { status: number; code?: string }) {
  if (error.status === 429) return tooManyAttempts;
  if (error.code === "OTP_EXPIRED") return "El código venció. Pide uno nuevo.";
  if (error.code === "TOO_MANY_ATTEMPTS")
    return "Demasiados intentos con este código. Pide uno nuevo.";
  return "El código no es correcto. Revísalo y vuelve a intentar.";
}
