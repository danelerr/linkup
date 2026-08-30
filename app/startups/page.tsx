import type { Metadata } from "next";
import { ExploreApp } from "@/components/explore-app";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Startups de Latinoamérica",
  description: "Busca startups latinoamericanas por país, industria, etapa y modalidad.",
  alternates: { canonical: "/startups" },
};

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main">
        <ExploreApp
          initialTab="startups"
          initialQuery={typeof params.q === "string" ? params.q : ""}
          initialCountry={typeof params.pais === "string" ? params.pais : ""}
          initialIndustry={typeof params.industria === "string" ? params.industria : ""}
          initialModality={typeof params.modalidad === "string" ? params.modalidad : ""}
          initialHiring={params.contratando === "1"}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
