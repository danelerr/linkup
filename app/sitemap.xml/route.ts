import { opportunities, organizations } from "@/lib/catalog";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] ?? character);
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const paths = [
    "/",
    "/startups",
    "/oportunidades",
    "/agregar",
    "/confianza",
    ...organizations.map((organization) => `/startups/${organization.slug}`),
    ...opportunities.map((opportunity) => `/oportunidades/${opportunity.slug}`),
  ];
  const urls = paths.map((path) => `<url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
