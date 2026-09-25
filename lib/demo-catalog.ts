// Seed data only. Public pages read the persisted catalog, never this module.
export type ApplicationMode = "external" | "native";

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
  isDemo: true;
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
  compensationType: "Pagada" | "Beca" | "Por definir";
  publishedAt: string;
  verifiedAt: string;
  closesAt?: string;
  applicationMode: ApplicationMode;
  managedByLinkUp: boolean;
  responsibilities: string[];
  requirements: string[];
  desirable: string[];
  sourceLabel: string;
  isDemo: true;
};

export const organizations: Organization[] = [
  {
    id: "org_menta",
    slug: "menta",
    name: "Menta",
    monogram: "ME",
    shortDescription:
      "Infraestructura simple para que pequeños comercios cobren y entiendan sus ventas.",
    description:
      "Menta construye herramientas de cobro y lectura de negocio para comercios que todavía operan entre efectivo, mensajes y hojas de cálculo. El equipo combina producto, operaciones y acompañamiento cercano.",
    industry: "Fintech",
    stage: "Pre-semilla",
    teamSize: "6–10 personas",
    foundedYear: 2025,
    city: "Santa Cruz",
    remotePolicy: "Híbrido",
    hiring: true,
    verifiedAt: "2026-08-29",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
  {
    id: "org_kipu",
    slug: "kipu-labs",
    name: "Kipu Labs",
    monogram: "KL",
    shortDescription:
      "Software operativo para equipos logísticos que necesitan coordinar rutas e incidencias.",
    description:
      "Kipu Labs centraliza rutas, incidencias y comunicación para operadores logísticos. Su producto busca reemplazar cadenas de mensajes dispersas por decisiones trazables.",
    industry: "Logística",
    stage: "Semilla",
    teamSize: "11–25 personas",
    foundedYear: 2023,
    city: "La Paz",
    remotePolicy: "Remoto",
    hiring: true,
    verifiedAt: "2026-08-28",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
  {
    id: "org_altura",
    slug: "altura",
    name: "Altura",
    monogram: "AL",
    shortDescription:
      "Datos climáticos útiles para productores agrícolas pequeños y medianos.",
    description:
      "Altura convierte datos meteorológicos y observaciones de campo en alertas concretas para productores. El servicio prioriza explicaciones claras y funciona aun con conectividad limitada.",
    industry: "Agtech",
    stage: "Semilla",
    teamSize: "11–25 personas",
    foundedYear: 2022,
    city: "Cochabamba",
    remotePolicy: "Híbrido",
    hiring: true,
    verifiedAt: "2026-08-27",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
  {
    id: "org_nexopay",
    slug: "nexopay",
    name: "NexoPay",
    monogram: "NP",
    shortDescription:
      "Pagos transfronterizos para trabajadores independientes y equipos distribuidos.",
    description:
      "NexoPay ayuda a profesionales y compañías remotas a cobrar, pagar y conciliar movimientos desde una sola experiencia. Opera con aliados regulados en cada mercado.",
    industry: "Fintech",
    stage: "Serie A",
    teamSize: "26–50 personas",
    foundedYear: 2021,
    city: "Santa Cruz",
    remotePolicy: "Remoto",
    hiring: true,
    verifiedAt: "2026-08-26",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
  {
    id: "org_pando",
    slug: "pando-cloud",
    name: "Pando Cloud",
    monogram: "PC",
    shortDescription:
      "Automatización de respaldo y seguridad para empresas que están creciendo.",
    description:
      "Pando Cloud ofrece automatizaciones de infraestructura a empresas que aún no tienen un equipo dedicado de plataforma. Sus flujos priorizan recuperación, seguridad y costos predecibles.",
    industry: "Cloud",
    stage: "Pre-semilla",
    teamSize: "1–5 personas",
    foundedYear: 2025,
    city: "La Paz",
    remotePolicy: "Remoto",
    hiring: false,
    verifiedAt: "2026-08-24",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
  {
    id: "org_qhana",
    slug: "qhana",
    name: "Qhana",
    monogram: "QH",
    shortDescription:
      "Gestión clínica liviana para consultorios y centros de atención primaria.",
    description:
      "Qhana organiza agenda, historias y seguimiento para centros de salud pequeños. El producto se diseña junto a personal clínico y administrativo en ciudades intermedias.",
    industry: "Healthtech",
    stage: "Semilla",
    teamSize: "11–25 personas",
    foundedYear: 2023,
    city: "Sucre",
    remotePolicy: "Híbrido",
    hiring: true,
    verifiedAt: "2026-08-23",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
  {
    id: "org_senda",
    slug: "senda-ai",
    name: "Senda AI",
    monogram: "SA",
    shortDescription:
      "Asistentes de atención en español para negocios de servicios.",
    description:
      "Senda AI crea asistentes supervisables para equipos de atención que trabajan en español. Su enfoque está en reducir tareas repetitivas sin perder trazabilidad ni control humano.",
    industry: "Inteligencia artificial",
    stage: "Pre-semilla",
    teamSize: "6–10 personas",
    foundedYear: 2025,
    city: "Cochabamba",
    remotePolicy: "Remoto",
    hiring: true,
    verifiedAt: "2026-08-22",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
  {
    id: "org_lumen",
    slug: "lumen-legal",
    name: "Lumen Legal",
    monogram: "LL",
    shortDescription:
      "Contratos y cumplimiento entendibles para empresas que recién empiezan.",
    description:
      "Lumen Legal combina software y revisión humana para que startups mantengan contratos, permisos y obligaciones ordenados desde sus primeras etapas.",
    industry: "Legaltech",
    stage: "Bootstrapped",
    teamSize: "6–10 personas",
    foundedYear: 2022,
    city: "Tarija",
    remotePolicy: "Remoto",
    hiring: false,
    verifiedAt: "2026-08-20",
    sourceLabel: "Registro demostrativo",
    isDemo: true,
  },
];

export const opportunities: Opportunity[] = [
  {
    id: "opp_menta_product",
    slug: "practica-producto-menta",
    organizationSlug: "menta",
    title: "Práctica de producto",
    summary:
      "Apoya investigación, prototipos y seguimiento de mejoras para comercios reales.",
    description:
      "Trabajarás junto al equipo fundador para entender problemas de comercios, ordenar hallazgos y convertirlos en mejoras pequeñas que puedan medirse. La experiencia incluye acompañamiento semanal y una pieza final de portafolio.",
    type: "Pasantía",
    area: "Producto",
    level: "Primera experiencia",
    modality: "Híbrido",
    location: "Santa Cruz",
    countriesAccepted: "Según disponibilidad",
    dedication: "20 horas por semana · 3 meses",
    compensation: "Bs 2.400 mensuales",
    compensationType: "Pagada",
    publishedAt: "2026-08-28",
    verifiedAt: "2026-08-29",
    closesAt: "2026-09-18",
    applicationMode: "native",
    managedByLinkUp: true,
    responsibilities: [
      "Preparar y sintetizar entrevistas con comercios.",
      "Prototipar flujos de baja fidelidad junto a diseño.",
      "Documentar resultados y próximos pasos de cada prueba.",
    ],
    requirements: [
      "Interés por producto digital y problemas de negocio.",
      "Comunicación escrita clara en español.",
      "Disponibilidad para dos encuentros presenciales al mes.",
    ],
    desirable: [
      "Algún proyecto propio, universitario o voluntario que puedas mostrar.",
    ],
    sourceLabel: "Envío demostrativo de la organización",
    isDemo: true,
  },
  {
    id: "opp_kipu_frontend",
    slug: "frontend-junior-kipu-labs",
    organizationSlug: "kipu-labs",
    title: "Frontend developer junior",
    summary:
      "Construye flujos operativos rápidos y claros con React y TypeScript.",
    description:
      "Te sumarás a un equipo pequeño de producto para implementar flujos usados a diario por operadores logísticos. Tendrás revisión de código, objetivos quincenales y contacto directo con usuarios internos.",
    type: "Empleo",
    area: "Ingeniería",
    level: "Junior",
    modality: "Remoto",
    location: "Remoto",
    countriesAccepted: "Según disponibilidad",
    dedication: "Tiempo completo",
    compensation: "USD 900–1.300 mensuales",
    compensationType: "Pagada",
    publishedAt: "2026-08-27",
    verifiedAt: "2026-08-28",
    closesAt: "2026-09-25",
    applicationMode: "external",
    managedByLinkUp: false,
    responsibilities: [
      "Implementar interfaces accesibles con React.",
      "Colaborar en decisiones de producto y calidad.",
      "Escribir pruebas para los recorridos críticos.",
    ],
    requirements: [
      "Fundamentos sólidos de JavaScript y CSS.",
      "Un proyecto desplegado que puedas explicar.",
    ],
    desirable: ["Experiencia con TypeScript o pruebas automatizadas."],
    sourceLabel: "Fuente oficial demostrativa",
    isDemo: true,
  },
  {
    id: "opp_altura_data",
    slug: "proyecto-datos-climaticos-altura",
    organizationSlug: "altura",
    title: "Proyecto de datos climáticos",
    summary:
      "Limpia y documenta un conjunto de datos para alertas agrícolas tempranas.",
    description:
      "Proyecto acotado de seis semanas para explorar calidad de datos meteorológicos, documentar anomalías y entregar un notebook reproducible. Incluye responsable técnico y criterios de finalización explícitos.",
    type: "Proyecto pagado",
    area: "Datos",
    level: "Junior",
    modality: "Remoto",
    location: "Remoto",
    countriesAccepted: "Según disponibilidad",
    dedication: "15 horas por semana · 6 semanas",
    compensation: "Bs 4.500 por proyecto",
    compensationType: "Pagada",
    publishedAt: "2026-08-26",
    verifiedAt: "2026-08-27",
    closesAt: "2026-09-12",
    applicationMode: "native",
    managedByLinkUp: true,
    responsibilities: [
      "Revisar consistencia de mediciones históricas.",
      "Proponer reglas simples de limpieza.",
      "Entregar notebook y documentación reproducibles.",
    ],
    requirements: [
      "Python básico para análisis de datos.",
      "Capacidad de explicar decisiones y límites.",
    ],
    desirable: ["Conocimiento introductorio de pandas o estadística."],
    sourceLabel: "Envío demostrativo de la organización",
    isDemo: true,
  },
  {
    id: "opp_nexo_ops",
    slug: "analista-operaciones-junior-nexopay",
    organizationSlug: "nexopay",
    title: "Analista de operaciones junior",
    summary:
      "Investiga incidencias de pagos y mejora procesos junto a producto y soporte.",
    description:
      "Ayudarás a investigar movimientos, documentar patrones y mejorar respuestas operativas en distintos países. El rol requiere criterio, orden y mucha claridad al comunicar.",
    type: "Empleo",
    area: "Operaciones",
    level: "Junior",
    modality: "Remoto",
    location: "Remoto",
    countriesAccepted: "Según disponibilidad",
    dedication: "Tiempo completo",
    compensation: "USD 850–1.100 mensuales",
    compensationType: "Pagada",
    publishedAt: "2026-08-25",
    verifiedAt: "2026-08-26",
    applicationMode: "external",
    managedByLinkUp: false,
    responsibilities: [
      "Resolver incidencias siguiendo controles.",
      "Documentar causas y aprendizajes.",
      "Proponer mejoras repetibles.",
    ],
    requirements: [
      "Pensamiento analítico.",
      "Español escrito claro.",
      "Manejo cómodo de hojas de cálculo.",
    ],
    desirable: ["Experiencia en soporte, finanzas u operaciones."],
    sourceLabel: "Fuente oficial demostrativa",
    isDemo: true,
  },
  {
    id: "opp_qhana_ux",
    slug: "investigacion-ux-qhana",
    organizationSlug: "qhana",
    title: "Pasantía de investigación UX",
    summary:
      "Observa procesos clínicos y convierte hallazgos en decisiones de producto.",
    description:
      "Participarás en sesiones de investigación remota, síntesis y validación de prototipos con equipos de salud. No tendrás acceso a información clínica identificable.",
    type: "Pasantía",
    area: "Diseño",
    level: "Primera experiencia",
    modality: "Híbrido",
    location: "Sucre",
    countriesAccepted: "Según disponibilidad",
    dedication: "24 horas por semana · 4 meses",
    compensation: "Bs 3.600 mensuales",
    compensationType: "Pagada",
    publishedAt: "2026-08-23",
    verifiedAt: "2026-08-24",
    closesAt: "2026-09-16",
    applicationMode: "native",
    managedByLinkUp: true,
    responsibilities: [
      "Preparar guiones.",
      "Sistematizar observaciones.",
      "Apoyar pruebas de prototipos.",
    ],
    requirements: [
      "Interés por investigación y servicios de salud.",
      "Disponibilidad presencial una vez por semana.",
    ],
    desirable: ["Proyecto académico de investigación o diseño."],
    sourceLabel: "Envío demostrativo de la organización",
    isDemo: true,
  },
  {
    id: "opp_senda_growth",
    slug: "growth-trainee-senda-ai",
    organizationSlug: "senda-ai",
    title: "Growth trainee",
    summary:
      "Prueba canales de adquisición y aprende a leer resultados sin perseguir métricas vacías.",
    description:
      "Programa de cuatro meses para diseñar pruebas pequeñas de adquisición, conversar con clientes y reportar aprendizajes. Cada ciclo tiene una hipótesis y una revisión con el equipo fundador.",
    type: "Trainee",
    area: "Growth",
    level: "Primera experiencia",
    modality: "Remoto",
    location: "Remoto",
    countriesAccepted: "Según disponibilidad",
    dedication: "30 horas por semana · 4 meses",
    compensation: "USD 650 mensuales",
    compensationType: "Pagada",
    publishedAt: "2026-08-21",
    verifiedAt: "2026-08-22",
    closesAt: "2026-09-20",
    applicationMode: "external",
    managedByLinkUp: false,
    responsibilities: [
      "Preparar experimentos de canal.",
      "Entrevistar prospectos.",
      "Comunicar resultados y decisiones.",
    ],
    requirements: [
      "Curiosidad comercial.",
      "Capacidad para trabajar con datos básicos.",
    ],
    desirable: ["Proyecto personal, comunidad o venta previa."],
    sourceLabel: "Fuente oficial demostrativa",
    isDemo: true,
  },
  {
    id: "opp_pando_docs",
    slug: "proyecto-documentacion-pando-cloud",
    organizationSlug: "pando-cloud",
    title: "Proyecto de documentación técnica",
    summary:
      "Convierte procesos internos de respaldo en guías comprobables para clientes.",
    description:
      "Proyecto corto para probar procedimientos, identificar supuestos y escribir guías que un cliente pueda seguir sin acompañamiento. Tendrás un entorno de prueba y revisión técnica semanal.",
    type: "Proyecto pagado",
    area: "Contenido técnico",
    level: "Junior",
    modality: "Remoto",
    location: "Remoto",
    countriesAccepted: "Según disponibilidad",
    dedication: "10 horas por semana · 5 semanas",
    compensation: "Bs 3.200 por proyecto",
    compensationType: "Pagada",
    publishedAt: "2026-08-20",
    verifiedAt: "2026-08-24",
    closesAt: "2026-09-10",
    applicationMode: "native",
    managedByLinkUp: true,
    responsibilities: [
      "Probar procedimientos en un entorno aislado.",
      "Escribir cinco guías breves.",
      "Incorporar feedback de dos lectores.",
    ],
    requirements: [
      "Escritura clara.",
      "Comodidad básica con terminal y servicios web.",
    ],
    desirable: ["Blog, tutorial o documentación previa."],
    sourceLabel: "Envío demostrativo de la organización",
    isDemo: true,
  },
  {
    id: "opp_lumen_community",
    slug: "coordinacion-comunidad-lumen-legal",
    organizationSlug: "lumen-legal",
    title: "Coordinación de comunidad junior",
    summary:
      "Organiza sesiones prácticas y contenidos para founders en etapa temprana.",
    description:
      "Apoyarás la programación de sesiones, conversación con participantes y reutilización de aprendizajes en recursos claros. El rol mezcla coordinación, redacción y atención.",
    type: "Empleo",
    area: "Comunidad",
    level: "Junior",
    modality: "Remoto",
    location: "Remoto",
    countriesAccepted: "Según disponibilidad",
    dedication: "Tiempo completo",
    compensation: "USD 800–1.000 mensuales",
    compensationType: "Pagada",
    publishedAt: "2026-08-19",
    verifiedAt: "2026-08-20",
    applicationMode: "external",
    managedByLinkUp: false,
    responsibilities: [
      "Coordinar calendario y asistentes.",
      "Preparar comunicaciones.",
      "Recoger y ordenar feedback.",
    ],
    requirements: [
      "Excelente organización.",
      "Redacción profesional en español.",
    ],
    desirable: ["Participación previa en comunidades o eventos."],
    sourceLabel: "Fuente oficial demostrativa",
    isDemo: true,
  },
];

export const industries = [
  ...new Set(organizations.map((item) => item.industry)),
].sort();
export const opportunityAreas = [
  ...new Set(opportunities.map((item) => item.area)),
].sort();
export const opportunityTypes = [
  ...new Set(opportunities.map((item) => item.type)),
].sort();

export function organizationBySlug(slug: string) {
  return organizations.find((organization) => organization.slug === slug);
}

export function opportunityBySlug(slug: string) {
  return opportunities.find((opportunity) => opportunity.slug === slug);
}

export function opportunitiesForOrganization(slug: string) {
  return opportunities.filter(
    (opportunity) => opportunity.organizationSlug === slug,
  );
}

export function organizationForOpportunity(opportunity: Opportunity) {
  return organizationBySlug(opportunity.organizationSlug);
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
