/**
 * Public origin of the site, for canonical URLs, the sitemap and share
 * previews. BETTER_AUTH_URL must already match the public origin (see
 * .env.example); the request's own origin is only a local fallback, since
 * behind a proxy it can be an internal address.
 */
export function siteOrigin(fallback: string) {
  const configured = process.env.BETTER_AUTH_URL;
  if (!configured) return fallback;
  try {
    return new URL(configured).origin;
  } catch {
    return fallback;
  }
}
