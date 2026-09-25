import { NextResponse, type NextRequest } from "next/server";

// Cookie-authenticated mutations accept only requests from this app's origin.
export function proxy(request: NextRequest) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    if (Number(request.headers.get("content-length")) > 2_000_000)
      return NextResponse.json(
        { error: "El envío supera el límite de 2 MB." },
        { status: 413 },
      );
    const origin = request.headers.get("origin");
    const expected = new URL(process.env.BETTER_AUTH_URL || request.url).origin;
    if (
      request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== expected)
    ) {
      return NextResponse.json(
        { error: "Origen de solicitud no permitido." },
        { status: 403 },
      );
    }
  }
  return NextResponse.next();
}
export const config = { matcher: "/api/:path*" };
