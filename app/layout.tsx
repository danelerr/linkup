import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Onest } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function requestOrigin(requestHeaders: Headers) {
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost:3000";
  const safeHost = /^[a-z0-9.-]+(?::\d+)?$/i.test(host) ? host : "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = safeHost.startsWith("localhost") || safeHost.startsWith("127.0.0.1")
    ? "http"
    : forwardedProtocol === "http" ? "http" : "https";
  return `${protocol}://${safeHost}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const origin = requestOrigin(await headers());
  const description = "Busca startups y oportunidades en Latinoamérica. Convierte tu primera experiencia en una señal para la siguiente.";
  return {
    metadataBase: new URL(origin),
    title: {
      default: "LinkUp — Startups y oportunidades",
      template: "%s — LinkUp",
    },
    description,
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      type: "website",
      locale: "es_419",
      siteName: "LinkUp",
      title: "LinkUp — Startups y oportunidades de Latinoamérica",
      description,
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "LinkUp — Startups y oportunidades de Latinoamérica" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "LinkUp — Startups y oportunidades de Latinoamérica",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${onest.variable} ${plexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
