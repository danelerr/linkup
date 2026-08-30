export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /mi-linkup/",
    "Disallow: /organizacion/",
    "Disallow: /admin",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
