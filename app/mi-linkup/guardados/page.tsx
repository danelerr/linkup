import type { Metadata } from "next";
import { ArrowRight, Bookmark } from "lucide-react";
import Link from "next/link";
import { opportunityBySlug, organizationForOpportunity } from "@/lib/catalog";
import { requireSyncedUser } from "@/lib/current-user";
import { listSavedOpportunitySlugs } from "@/lib/user-data";

export const metadata: Metadata = { title: "Guardados", robots: { index: false, follow: false } };

export default async function SavedPage() {
  const user = await requireSyncedUser("/mi-linkup/guardados");
  const slugs = await listSavedOpportunitySlugs(user.userId);
  const saved = slugs.map(opportunityBySlug).filter((item) => item !== undefined);
  return (
    <div className="account-page">
      <header className="account-heading">
        <p className="eyebrow">Mi LinkUp</p>
        <h1>Guardados</h1>
        <p>Oportunidades que quieres revisar con calma.</p>
      </header>
      {saved.length ? (
        <div className="account-list">
          {saved.map((opportunity) => {
            const organization = organizationForOpportunity(opportunity);
            return (
              <Link href={`/oportunidades/${opportunity.slug}`} key={opportunity.id}>
                <span className="account-list-icon"><Bookmark size={17} aria-hidden="true" /></span>
                <span>
                  <strong>{opportunity.title}</strong>
                  <small>{organization?.name} · {opportunity.modality} · {opportunity.compensationType}</small>
                </span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="account-empty account-empty-large">
          <Bookmark size={22} aria-hidden="true" />
          <p>No guardaste oportunidades todavía.</p>
          <Link className="button-secondary" href="/oportunidades">Explorar oportunidades</Link>
        </div>
      )}
    </div>
  );
}
