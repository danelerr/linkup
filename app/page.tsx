import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ExploreApp } from "@/components/explore-app";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Startups y oportunidades de Latinoamérica",
  alternates: { canonical: "/" },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const savedTab = cookieStore.get("linkup_last_tab")?.value;
  const initialTab = params.vista === "oportunidades" || (params.vista === undefined && savedTab === "oportunidades")
    ? "oportunidades"
    : "startups";

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main">
        <ExploreApp
          initialTab={initialTab}
          initialQuery={typeof params.q === "string" ? params.q : ""}
          initialCountry={typeof params.pais === "string" ? params.pais : ""}
          initialIndustry={typeof params.industria === "string" ? params.industria : ""}
          initialArea={typeof params.area === "string" ? params.area : ""}
          initialType={typeof params.tipo === "string" ? params.tipo : ""}
          initialModality={typeof params.modalidad === "string" ? params.modalidad : ""}
          initialHiring={params.contratando === "1"}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
