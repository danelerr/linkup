import type { Metadata } from "next";
import Link from "next/link";
import { OpeningRow } from "@/components/opening-row";
import { textLinkClass } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/ui/layout";
import { opportunitiesWithOrganizations } from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import { todayIso } from "@/lib/dates";
import { listSavedOpportunitySlugs } from "@/lib/user-data";

export const metadata: Metadata = {
  title: "Guardados",
  robots: { index: false, follow: false },
};

export default async function SavedPage() {
  const user = await requireSyncedUser("/mi-linkup/guardados");
  const saved = await opportunitiesWithOrganizations(
    await listSavedOpportunitySlugs(user.userId),
  );
  const today = todayIso();
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Mi LinkUp"
        title="Guardados"
        description="Oportunidades que quieres revisar con calma. Las que cierran pronto aparecen marcadas."
      />
      {saved.length ? (
        <ul className="border-t border-line pt-2">
          {saved.map(({ opportunity, organization }) => (
            <li key={opportunity.id} className="border-b border-line py-1">
              <OpeningRow
                opportunity={opportunity}
                organizationName={organization.name}
                href={`/oportunidades/${opportunity.slug}`}
                today={today}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No guardaste oportunidades todavía."
          actions={
            <Link className={textLinkClass} href="/?abiertas=1">
              Explorar oportunidades abiertas
            </Link>
          }
        >
          Usa “Guardar” en cualquier oportunidad para volver a ella después.
        </EmptyState>
      )}
    </div>
  );
}
