import {
  getOpportunities,
  getOrganizations,
  isOpportunityOpen,
} from "@/lib/catalog";
import { siteOrigin } from "@/lib/site";

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

export async function GET(request: Request) {
  const origin = siteOrigin(new URL(request.url).origin);
  const organizations = await getOrganizations();
  const visible = new Set(organizations.map((item) => item.slug));
  const paths = [
    "/",
    "/agregar",
    "/confianza",
    ...organizations.map((organization) => `/startups/${organization.slug}`),
    // A draft startup hides its opportunities, so their pages return 404.
    // Closed or expired openings stay reachable but are not offered to search
    // engines as current jobs.
    ...(await getOpportunities())
      .filter(
        (opportunity) =>
          visible.has(opportunity.organizationSlug) &&
          isOpportunityOpen(opportunity),
      )
      .map((opportunity) => `/oportunidades/${opportunity.slug}`),
  ];
  const urls = paths
    .map((path) => `<url><loc>${escapeXml(`${origin}${path}`)}</loc></url>`)
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
