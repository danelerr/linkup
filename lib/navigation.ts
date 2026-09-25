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

export function signInPath(returnTo: string) {
  return `/ingresar?return_to=${encodeURIComponent(safeRelativeReturnPath(returnTo))}`;
}
