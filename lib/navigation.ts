export function safeRelativeReturnPath(value = "/") {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://app.local");
    if (
      url.origin !== "https://app.local" ||
      url.pathname.startsWith("/api/") ||
      url.pathname === "/ingresar"
    )
      return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

/**
 * Sign-in URL that comes back to `returnTo`. `newAccount` opens the form on
 * "Crear cuenta": used when an action that needs an account sent someone here.
 */
export function signInPath(returnTo: string, newAccount = false) {
  return `/ingresar?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}${newAccount ? "&cuenta=nueva" : ""}`;
}
