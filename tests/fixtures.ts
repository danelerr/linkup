export function startup(slug = "estudio") {
  return {
    slug,
    name: `Estudio ${slug}`,
    monogram: "ES",
    status: "published" as const,
    isDemo: false,
    shortDescription: "Herramientas para equipos que construyen productos.",
    description:
      "Un equipo que desarrolla herramientas para mejorar la colaboración entre personas.",
    industry: "Software",
    stage: "Inicial",
    teamSize: "2–10",
    foundedYear: 2024,
    city: "",
    remotePolicy: "Remoto",
    sourceUrl: `https://${slug}.example.com/about`,
    websiteUrl: `https://${slug}.example.com`,
    sourceLabel: "Sitio oficial",
    verifiedAt: new Date().toISOString().slice(0, 10),
  };
}
export function opportunity(slug = "desarrollo", organizationSlug = "estudio") {
  return {
    slug,
    organizationSlug,
    title: "Desarrollo de producto",
    status: "published" as const,
    isDemo: false,
    summary: "Construye herramientas útiles con un equipo pequeño.",
    description:
      "Participarás en el diseño y desarrollo de herramientas de colaboración para equipos.",
    type: "Empleo" as const,
    area: "Ingeniería",
    level: "Junior",
    modality: "Remoto" as const,
    location: "",
    countriesAccepted: "Sin restricción declarada",
    dedication: "Tiempo completo",
    compensation: "USD 1.500–2.000 / mes",
    compensationType: "Pagada" as const,
    closesAt: "",
    applicationMode: "external" as const,
    applicationUrl: `https://jobs.example.com/${slug}/apply`,
    sourceUrl: `https://jobs.example.com/${slug}`,
    sourceLabel: "Página oficial",
    verifiedAt: new Date().toISOString().slice(0, 10),
    responsibilities: ["Construir herramientas"],
    requirements: ["Conocimiento de Python y análisis de datos"],
    desirable: [],
  };
}
