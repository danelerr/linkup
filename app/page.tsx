import type { Metadata } from "next";
import { ExploreApp } from "@/components/explore-app";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Descubre startups y oportunidades",
  alternates: { canonical: "/" },
};

export default async function Home({
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
          initialQuery={typeof params.q === "string" ? params.q : ""}
          initialIndustry={typeof params.industria === "string" ? params.industria : ""}
          initialArea={typeof params.area === "string" ? params.area : ""}
          initialType={typeof params.tipo === "string" ? params.tipo : ""}
          initialModality={typeof params.modalidad === "string" ? params.modalidad : ""}
          initialHiring={params.abiertas === "1" || params.contratando === "1" || params.vista === "oportunidades"}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
