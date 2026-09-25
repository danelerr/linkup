import { formatShortDate } from "@/lib/catalog-types";

const DAY = 86_400_000;

export function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function dayNumber(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY;
}

/** Whole calendar days from `from` to `to` (both YYYY-MM-DD or ISO). */
export function daysBetween(from: string, to: string) {
  return Math.round(dayNumber(to) - dayNumber(from));
}

export function formatDayMonth(date: string, today = todayIso()) {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return "sin fecha";
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    ...(date.slice(0, 4) === today.slice(0, 4) ? {} : { year: "numeric" }),
    timeZone: "UTC",
  }).format(parsed);
}

export type ClosingLabel = { text: string; urgent: boolean; closed: boolean };

/** How a closing date reads in a list: "Cierra hoy", "Cierra en 5 días"… */
export function closingLabel(
  closesAt: string | undefined,
  today = todayIso(),
): ClosingLabel | null {
  if (!closesAt) return null;
  const days = daysBetween(today, closesAt);
  if (!Number.isFinite(days)) return null;
  if (days < 0)
    return {
      text: `Cerró el ${formatDayMonth(closesAt, today)}`,
      urgent: false,
      closed: true,
    };
  if (days === 0) return { text: "Cierra hoy", urgent: true, closed: false };
  if (days === 1) return { text: "Cierra mañana", urgent: true, closed: false };
  if (days <= 7)
    return { text: `Cierra en ${days} días`, urgent: days <= 3, closed: false };
  return {
    text: `Cierra el ${formatDayMonth(closesAt, today)}`,
    urgent: false,
    closed: false,
  };
}

/** "hoy", "ayer", "hace 3 días", "hace 2 semanas" or "el 4 ago 2026". */
export function relativePast(date: string, today = todayIso()) {
  const days = daysBetween(date, today);
  if (!Number.isFinite(days)) return "sin fecha";
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "hace 1 semana" : `hace ${weeks} semanas`;
  }
  return `el ${formatShortDate(date)}`;
}
