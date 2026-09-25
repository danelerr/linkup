/** Keeps forms recoverable when the connection drops or a request times out. */
export async function clientRequest(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(20000),
    });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      return Response.json(
        {
          error: "El servidor no respondió correctamente. Vuelve a intentarlo.",
        },
        { status: response.ok ? 502 : response.status },
      );
    }
    return response;
  } catch {
    return Response.json(
      {
        error: "No pudimos conectar. Revisa tu conexión y vuelve a intentarlo.",
      },
      { status: 503 },
    );
  }
}
