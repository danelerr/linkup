import type { Metadata } from "next";
import { Bell, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AlertForm, DeleteAlertButton } from "@/components/alert-form";
import { requireSyncedUser } from "@/lib/current-user";
import { listSavedSearches } from "@/lib/user-data";

export const metadata: Metadata = { title: "Alertas", robots: { index: false, follow: false } };

function queryFromJson(value: string) {
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return new URLSearchParams(parsed).toString();
  } catch {
    return "abiertas=1";
  }
}

export default async function AlertsPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const user = await requireSyncedUser("/mi-linkup/alertas");
  const params = await searchParams;
  const alerts = await listSavedSearches(user.userId);
  return (
    <div className="account-page">
      <header className="account-heading">
        <p className="eyebrow">Mi LinkUp</p>
        <h1>Alertas</h1>
        <p>Guarda una búsqueda y decide con qué frecuencia quieres enterarte.</p>
      </header>
      <AlertForm initialQuery={params.query ?? ""} />
      <section className="account-section alerts-section">
        <div className="section-heading-row"><h2>Tus alertas</h2><span>{alerts.length}</span></div>
        {alerts.length ? (
          <div className="alert-list">
            {alerts.map((alert) => (
              <div className="alert-item" key={alert.id}>
                <span className="account-list-icon"><Bell size={17} aria-hidden="true" /></span>
                <span>
                  <strong>{alert.label}</strong>
                  <small>{alert.frequency === "diaria" ? "Todos los días" : "Una vez por semana"}</small>
                </span>
                <Link href={`/?${queryFromJson(alert.queryJson)}`} aria-label={`Abrir búsqueda ${alert.label}`}><ExternalLink size={16} aria-hidden="true" /></Link>
                <DeleteAlertButton id={alert.id} />
              </div>
            ))}
          </div>
        ) : <div className="account-empty"><p>No tienes alertas activas.</p></div>}
      </section>
    </div>
  );
}
