export type PublicationStatus = "draft" | "published" | "closed";

export type Organization = {
  id: string;
  slug: string;
  name: string;
  monogram: string;
  shortDescription: string;
  description: string;
  industry: string;
  stage: string;
  teamSize: string;
  foundedYear: number;
  city: string;
  remotePolicy: string;
  hiring: boolean;
  verifiedAt: string;
  sourceLabel: string;
  isDemo: boolean;
  websiteUrl: string;
  /** Official logo (http/https). The monogram is used when it is missing. */
  logoUrl?: string;
  sourceUrl: string;
  status: PublicationStatus;
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  slug: string;
  organizationSlug: string;
  title: string;
  summary: string;
  description: string;
  type: "Empleo" | "Pasantía" | "Proyecto pagado" | "Trainee" | "Programa";
  area: string;
  level: string;
  modality: "Remoto" | "Híbrido" | "Presencial";
  location: string;
  countriesAccepted: string;
  dedication: string;
  compensation: string;
  compensationType: "Pagada" | "Beca" | "Por definir" | "No pagada";
  publishedAt: string;
  verifiedAt: string;
  closesAt?: string;
  applicationMode: "external" | "native";
  managedByLinkUp: boolean;
  responsibilities: string[];
  requirements: string[];
  desirable: string[];
  sourceLabel: string;
  sourceUrl: string;
  applicationUrl: string;
  isDemo: boolean;
  status: PublicationStatus;
  updatedAt: string;
};

export function formatShortDate(date: string) {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function isOpportunityOpen(
  opportunity: Pick<Opportunity, "status" | "closesAt">,
  today = new Date().toISOString().slice(0, 10),
) {
  return (
    opportunity.status === "published" &&
    (!opportunity.closesAt || opportunity.closesAt >= today)
  );
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

export const opportunityTypes = [
  "Empleo",
  "Pasantía",
  "Proyecto pagado",
  "Trainee",
  "Programa",
] as const;
export const modalities = ["Remoto", "Híbrido", "Presencial"] as const;
