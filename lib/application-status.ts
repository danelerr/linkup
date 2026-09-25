import type { BadgeTone } from "@/components/ui/badge";

type StatusInfo = { label: string; tone: BadgeTone; closed?: boolean };

export const applicationStatus: Record<string, StatusInfo> = {
  enviada: { label: "Enviada", tone: "neutral" },
  vista: { label: "Vista", tone: "info" },
  contactada: { label: "Contactada", tone: "info" },
  entrevista: { label: "Entrevista", tone: "info" },
  oferta: { label: "Oferta", tone: "success" },
  seleccionada: { label: "Seleccionada", tone: "success", closed: true },
  no_continua: { label: "No continúa", tone: "neutral", closed: true },
  retirada: { label: "Retirada", tone: "neutral", closed: true },
  sin_respuesta: { label: "Sin respuesta", tone: "warning" },
};

export function statusInfo(status: string): StatusInfo {
  return applicationStatus[status] ?? { label: status, tone: "neutral" };
}

/** Steps a process moves through; `vista` only exists inside LinkUp. */
export function progressSteps(mode: string) {
  return mode === "native"
    ? ["enviada", "vista", "contactada", "entrevista", "oferta", "seleccionada"]
    : ["enviada", "contactada", "entrevista", "oferta", "seleccionada"];
}

export const memberRoleLabels: Record<string, string> = {
  owner: "Responsable",
  recruiter: "Selección de personas",
  viewer: "Solo lectura",
};

export const userRoleLabels: Record<string, string> = {
  admin: "Administración",
  curator: "Curaduría",
  talent: "Talento",
};
