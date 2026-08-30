import type { Metadata } from "next";
import { ExploreApp } from "@/components/explore-app";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Oportunidades en startups",
  description: "Busca empleo, pasantías, trainee y proyectos pagados en startups de Latinoamérica.",
  alternates: { canonical: "/oportunidades" },
};

export default async function OpportunitiesPage({
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
          initialTab="oportunidades"
          initialQuery={typeof params.q === "string" ? params.q : ""}
          initialCountry={typeof params.pais === "string" ? params.pais : ""}
          initialArea={typeof params.area === "string" ? params.area : ""}
          initialType={typeof params.tipo === "string" ? params.tipo : ""}
          initialModality={typeof params.modalidad === "string" ? params.modalidad : ""}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
