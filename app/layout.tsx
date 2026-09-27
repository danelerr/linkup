import type { Metadata, Viewport } from "next";
import { Lato, Raleway } from "next/font/google";
import { headers } from "next/headers";
import { siteOrigin } from "@/lib/site";
import "./globals.css";

// Brand typefaces: Lato for text and data, Raleway for headings and the brand.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

function requestOrigin(requestHeaders: Headers) {
  const forwardedHost = requestHeaders
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost:3000";
  const safeHost = /^[a-z0-9.-]+(?::\d+)?$/i.test(host)
    ? host
    : "localhost:3000";
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol =
    safeHost.startsWith("localhost") || safeHost.startsWith("127.0.0.1")
      ? "http"
      : forwardedProtocol === "http"
        ? "http"
        : "https";
  return `${protocol}://${safeHost}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const origin = siteOrigin(requestOrigin(await headers()));
  const description =
    "Descubre startups, entiende qué construyen y encuentra dónde puedes sumarte.";
  return {
    metadataBase: new URL(origin),
    title: {
      default: "LinkUp — Startups y oportunidades",
      template: "%s — LinkUp",
    },
    description,
    icons: {
      icon: [
        { url: "/marca/simbolo.svg", type: "image/svg+xml" },
        { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      ],
      shortcut: "/favicon.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: "es_419",
      siteName: "LinkUp",
      title: "LinkUp — Descubre dónde sumarte",
      description,
      url: origin,
      images: [
        {
          url: `${origin}/og.png`,
          width: 1200,
          height: 630,
          alt: "LinkUp — Descubre dónde sumarte",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "LinkUp — Descubre dónde sumarte",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F3F5F7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lato.variable} ${raleway.variable}`}>
      <body>
        <a
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-control bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-transform focus:translate-y-0"
          href="#main-content"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
