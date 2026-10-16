import type { Metadata } from "next";
import { ExploreApp } from "@/components/explore-app";
import { SiteShell } from "@/components/site-shell";
import { getDirectory } from "@/lib/directory";
import { parseFilters } from "@/lib/directory-filters";

export const metadata: Metadata = {
  title: { absolute: "LinkUp | Startups y oportunidades" },
  alternates: { canonical: "/" },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const data = await getDirectory(filters);

  return (
    <SiteShell>
      <ExploreApp filters={filters} data={data} />
    </SiteShell>
  );
}
