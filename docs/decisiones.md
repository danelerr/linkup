# Decisiones y asuntos abiertos

Una decisión aceptada rige hasta que otra la reemplace. No se borra: se marca como reemplazada. Si este registro contradice otro documento, prevalece el registro, y el cambio actualiza los documentos afectados.

La evidencia de investigación (encuesta heredada, análisis competitivo y fuentes) sigue en el historial: `git show 49afd4c:docs/09-research-decisions.md`.

## Decisiones

| ID | Decisión | Estado |
|---|---|---|
| D-001 | LinkUp es directorio y sistema de trayectoria a la vez. El MVP debe probar al menos un resultado, no solo búsquedas. | Aceptada |
| D-002 | Posición pública: dónde descubrir quién está construyendo y dónde sumarse. Sin etiqueta geográfica ni "LinkedIn killer". | Aceptada |
| D-003 | Segmento: talento de 18 a 28 años y startups con roles de entrada o necesidades acotadas. 18 es la puerta del flujo laboral; 28 no limita la navegación. | Aceptada |
| D-004 | La operación se concentra donde el equipo tiene relaciones; la marca sigue siendo neutra geográficamente. | Aceptada |
| D-005 | `/` es la aplicación, no una landing. | Aceptada |
| D-006 | Una sola colección: la startup es la unidad y sus oportunidades van en la misma fila. Industria, área, tipo y modalidad son filtros. | Aceptada |
| D-007 | Explorar no exige cuenta; guardar, alertar, registrar seguimiento o postular dentro de LinkUp sí. | Aceptada |
| D-008 | Dos modos de postulación, externa y nativa, siempre distinguibles en la interfaz. | Aceptada |
| D-009 | Oferta: empleo, pasantía, trainee, proyecto pagado, fellowship y programas con evidencia. Sin eventos ni voluntariado en el MVP. | Aceptada |
| D-010 | LinkUp también ayuda a diseñar pasantías y proyectos pagados, con condiciones y compensación explícitas. | Aceptada |
| D-011 | Conservar el símbolo de eslabón y flecha y evolucionar a un producto sobrio. | Reemplazada en lo visual por D-026 |
| D-012 | Listas continuas, divisores finos, casi sin sombras y un solo gesto con degradado. Sin grillas de tarjetas, paneles de estadísticas ni patrones de nodos. | Aceptada |
| D-013 | Next.js App Router y TypeScript, no una SPA con Vite. | Aceptada |
| D-014 | Supabase (PostgreSQL, Auth, Storage, RLS), Trigger.dev y Vercel. | Reemplazada por D-024 y D-028: PostgreSQL y Vercel sí, sin Supabase ni RLS |
| D-015 | Búsqueda con PostgreSQL FTS y `pg_trgm`, reglas explicables y curación humana. | Pendiente: hoy la búsqueda es SQL con `LIKE` sobre texto normalizado (D-028) |
| D-016 | La IA extrae, normaliza, sugiere y explica; no rechaza personas ni publica sin control. | Aceptada |
| D-017 | Perfil público opcional, consentimiento por postulación, datos mínimos, exportación y eliminación. | Aceptada |
| D-018 | Flujo laboral solo para mayores de 18. Una línea para menores sería otro producto con revisión legal. | Aceptada |
| D-019 | El talento no paga. Ingresos de startups e instituciones: campañas, shortlists, espacio de selección, proyectos y cohortes. Sin venta de datos ni ranking oculto. | Hipótesis |
| D-020 | Métrica norte: resultados de oportunidad verificados por mes, desglosados por tipo. | Aceptada |
| D-021 | Matching, verificación, reclamaciones y proyectos se operan a mano durante el piloto. | Aceptada |
| D-022 | Se escribe `LinkUp`. Puede cambiar si la búsqueda de marca lo exige. | Provisional |
| D-023 | Alfa sobre Vinext, Cloudflare D1 y acceso provisto por Sites. | Reemplazada por D-024 |
| D-024 | Next.js estándar, Tailwind, Better Auth y SQLite con Drizzle para una instancia con disco persistente. Sin acceso con ChatGPT ni Sites. No se despliega ni se conectan servicios externos sin instrucción expresa. | Reemplazada en la base de datos por D-028 |
| D-025 | Proponer información en `/agregar` requiere cuenta; hasta 5 propuestas por día y cuenta. Al conectar correo, exigir correo verificado. | Implementada (25 sep 2026) |
| D-026 | Identidad nueva: monograma `lU`, paleta `#0F3151` / `#11909D` / `#47B9B2` / `#F3F5F7`, Lato y Raleway. Acciones en `#0D7680` para cumplir contraste. | Implementada (27 sep 2026) |
| D-027 | Correo con Resend (API REST, sin SDK). Se ingresa con contraseña o con un código de 6 dígitos por correo; el código también crea la cuenta y permite restablecer o crear la contraseña, cerrando las sesiones abiertas. Con correo configurado, toda cuenta confirma su correo con un código antes de su primera sesión, lo que cumple la condición de D-025. Contraseña mínima de 4 caracteres, por decisión de producto. | Implementada (16 oct 2026) |
| D-028 | PostgreSQL en Neon (São Paulo) desde el Marketplace de Vercel, con `pg` y Drizzle; las funciones de Vercel en la misma región (`gru1`). Las tablas de Better Auth son parte del esquema y todo se migra en cada build. Sin capa de compatibilidad con SQLite ni migración de datos: no había usuarios. | Implementada (16 oct 2026) |

## Asuntos abiertos

| ID | Asunto | Se cierra con | Antes de |
|---|---|---|---|
| O-001 | Acuerdo de cofundadores, vesting, IP y autoridad | Documento firmado | Invertir o contratar |
| O-002 | Disponibilidad del nombre LinkUp | Búsqueda legal, dominios y redes | Identidad pública final |
| O-003 | Archivo maestro del logo | Vector original y titularidad | Identidad pública final |
| O-004 | Primera familia de roles | Oferta comprometida y entrevistas | Piloto |
| O-005 | Startups y cohorte del piloto | Acuerdos con responsables y fechas | Piloto |
| O-006 | Primera oferta pagada | 15 entrevistas de precio y 3 cobros | Durante el piloto |
| O-007 | Fuentes autorizadas para recopilar | Revisión de términos o acuerdos | Ampliar la recopilación |
| O-008 | ¿Es intermediación laboral? | Opinión jurídica y requisitos del Ministerio de Trabajo | Piloto |
| O-009 | Tratamiento y transferencia de datos | Análisis legal de Bolivia y proveedores | Producción |
| O-010 | Estructura legal, facturación e impuestos | Asesoría contable y jurídica | Cobrar |
| O-011 | Política de compensación visible | Pruebas con oferta y revisión legal | Publicar oferta propia |
| O-012 | Dominio y URL canónica | Disponibilidad y marca | Sitemap de producción |
| O-013 | Variante regional del español | Pruebas en Bolivia y en el siguiente país | Expandir |
| O-014 | Cuándo un perfil es utilizable | Relación con tasa de respuesta | Durante el piloto |
| O-015 | Cómo se verifica un resultado | Tasa de confirmación y fraude | Durante el piloto |
