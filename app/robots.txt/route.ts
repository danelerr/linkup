import { siteOrigin } from "@/lib/site";

export function GET(request: Request) {
  const origin = siteOrigin(new URL(request.url).origin);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /para-ti/",
    "Disallow: /organizacion/",
    "Disallow: /admin",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
