import type { Metadata } from "next";
import { ArrowRight, Bell, Search } from "lucide-react";
import Link from "next/link";
import {
  AlertForm,
  DeleteAlertButton,
  MarkAlertsRead,
} from "@/components/alert-form";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  PageHeader,
  sectionTitleClass,
} from "@/components/ui/layout";
import { requireSyncedUser } from "@/lib/current-user";
import { listSavedSearches } from "@/lib/user-data";
import { listNotifications } from "@/lib/alerts";
import { parseFilters, filterParams } from "@/lib/directory-filters";

export const metadata: Metadata = {
  title: "Alertas",
  robots: { index: false, follow: false },
};

function queryFromJson(value: string) {
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return new URLSearchParams(parsed).toString();
  } catch {
    return "abiertas=1";
  }
}

export default async function AlertsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = filterParams(parseFilters(params));
  const user = await requireSyncedUser(`/mi-linkup/alertas?${filters}`);
  const alerts = await listSavedSearches(user.userId);
  const notifications = listNotifications(user.userId);
  const unread = notifications.filter((item) => !item.read_at).length;
  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="Mi LinkUp"
        title="Alertas"
        description="Guarda una búsqueda y encuentra aquí sus nuevas coincidencias, según la frecuencia que elijas. Todavía no enviamos correos."
      />
      <AlertForm initialFilters={Object.fromEntries(filters.entries())} />

      {notifications.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className={sectionTitleClass}>
              Nuevas coincidencias
              {unread > 0 && (
                <Badge tone="info" className="ml-2 align-middle">
                  {unread} sin leer
                </Badge>
              )}
            </h2>
            {unread > 0 && <MarkAlertsRead />}
          </div>
          <ul className="mt-4 divide-y divide-line rounded-panel border border-line bg-paper">
            {notifications.map((item) => (
              <li key={item.id}>
                <Link
                  className="group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface sm:px-5"
                  href={`/oportunidades/${item.slug}`}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-semibold group-hover:text-action">
                      {!item.read_at && (
                        <span
                          className="size-2 shrink-0 rounded-full bg-action"
                          aria-label="Nueva"
                        />
                      )}
                      {item.title}
                    </span>
                    <span className="mt-0.5 block font-meta text-[13px] text-muted">
                      Alerta: {item.label}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-action"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className={sectionTitleClass}>
          Tus alertas{" "}
          <span className="font-meta text-base font-normal text-muted">
            {alerts.length}/20
          </span>
        </h2>
        {alerts.length ? (
          <ul className="mt-4 divide-y divide-line rounded-panel border border-line bg-paper">
            {alerts.map((alert) => (
              <li
                className="flex items-center gap-3 p-4 sm:px-5"
                key={alert.id}
              >
                <Bell
                  className="size-[18px] shrink-0 text-muted"
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{alert.label}</span>
                  <span className="font-meta text-[13px] text-muted">
                    {alert.frequency === "diaria"
                      ? "Todos los días"
                      : "Una vez por semana"}
                  </span>
                </span>
                <Link
                  className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-action"
                  href={`/?${queryFromJson(alert.queryJson)}`}
                  aria-label={`Abrir búsqueda ${alert.label}`}
                >
                  <Search className="size-4" aria-hidden="true" />
                </Link>
                <DeleteAlertButton id={alert.id} label={alert.label} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState className="mt-4" title="No tienes alertas activas.">
            Crea una arriba o desde cualquier búsqueda con “Crear alerta”.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
