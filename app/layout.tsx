import type { Metadata, Viewport } from "next";
import { Archivo_Narrow, Manrope } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const archivoNarrow = Archivo_Narrow({
  variable: "--font-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
  const description = "Descubre startups, entiende qué construyen y encuentra dónde puedes sumarte.";
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
      title: "LinkUp — Descubre dónde sumarte",
      description,
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1200, height: 630, alt: "LinkUp — Descubre dónde sumarte" }],
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
  themeColor: "#FBFCFD",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${archivoNarrow.variable}`}>
        {children}
      </body>
    </html>
  );
}
