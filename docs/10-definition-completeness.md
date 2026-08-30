# Cobertura y control de la definición

Versión: 1.0  
Fecha de auditoría: 30 de agosto de 2026  
Estado: definición completa para validación, diseño detallado y planificación de desarrollo

## Qué significa “completa”

La definición v1.0 es completa porque todo comportamiento necesario para probar la tesis tiene:

- Actor y problema.
- Alcance y exclusiones.
- Flujo y requisito.
- Modelo de datos y permisos.
- Regla de confianza y privacidad.
- Evento o criterio de resultado.
- Fase de ejecución.

Completa no significa que las hipótesis ya estén validadas, que las decisiones legales estén emitidas ni que la alfa construida esté lista para producción. Esos elementos tienen pruebas, responsables y puertas explícitas.

## Matriz de cobertura

| Área | Pregunta resuelta | Documento principal | Estado |
|---|---|---|---|
| Tesis | ¿Qué es LinkUp y por qué debe existir? | `01-product-definition.md` | Cubierta |
| Posicionamiento | ¿Cómo se explica sin llamarse LinkedIn killer? | `01-product-definition.md` | Cubierta |
| Segmento | ¿Para quién se empieza y dónde? | `01-product-definition.md` | Cubierta |
| Marketplace | ¿Qué reciben talento, startups y aliados? | `01-product-definition.md`, `07-business-gtm-metrics.md` | Cubierta |
| Inicio | ¿Landing o app; qué ve la persona? | `02-product-requirements.md`, `03-brand-and-interface.md` | Cubierta |
| Navegación | ¿Qué rutas y actores existen? | `02-product-requirements.md` | Cubierta |
| Vacantes | ¿Se recopilan, se envían o ambas? | `02-product-requirements.md`, `05-ingestion-search-matching.md` | Cubierta |
| Aplicación | ¿Externa o nativa? | `02-product-requirements.md` | Cubierta |
| Primera experiencia | ¿Cómo se “fabrica” trayectoria? | `01-product-definition.md`, `05-ingestion-search-matching.md`, `06-trust-safety-privacy.md` | Cubierta |
| Requisitos | ¿Qué debe hacer el MVP? | `02-product-requirements.md` | Cubierta |
| Marca | ¿Qué se conserva y qué se cambia? | `03-brand-and-interface.md` | Cubierta; depende de vector/titularidad |
| UI | ¿Cómo se mantiene minimalista? | `03-brand-and-interface.md` | Cubierta |
| Accesibilidad | ¿Qué estándar y estados se aceptan? | `03-brand-and-interface.md`, `04-architecture-and-data.md` | Cubierta |
| Stack | ¿React/Vite u otra arquitectura? | `04-architecture-and-data.md` | Cubierta |
| Datos | ¿Qué entidades, estados e índices existen? | `04-architecture-and-data.md` | Cubierta |
| Permisos | ¿Quién puede ver y modificar qué? | `04-architecture-and-data.md`, `06-trust-safety-privacy.md` | Cubierta |
| Ingesta | ¿Cómo se descubre y mantiene oferta? | `05-ingestion-search-matching.md` | Cubierta |
| Búsqueda | ¿Cómo filtra y ordena? | `05-ingestion-search-matching.md` | Cubierta |
| Matching | ¿Cómo recomienda sin caja negra? | `05-ingestion-search-matching.md` | Cubierta |
| IA | ¿Qué puede y no puede hacer? | `05-ingestion-search-matching.md` | Cubierta |
| Confianza | ¿Qué significa verificado? | `06-trust-safety-privacy.md` | Cubierta |
| Privacidad | ¿Qué se comparte, conserva y elimina? | `06-trust-safety-privacy.md` | Cubierta; requiere aprobación legal |
| Moderación | ¿Cómo se reporta, contiene y apela? | `06-trust-safety-privacy.md` | Cubierta |
| Menores | ¿Cómo se maneja el riesgo 16–17? | `06-trust-safety-privacy.md` | Cubierta: fuera del flujo laboral MVP |
| Negocio | ¿Quién paga y por qué? | `07-business-gtm-metrics.md` | Cubierta como hipótesis |
| GTM | ¿Cómo se logra liquidez inicial? | `07-business-gtm-metrics.md` | Cubierta |
| Métricas | ¿Qué define éxito? | `07-business-gtm-metrics.md` | Cubierta |
| Validación | ¿Qué piloto y umbrales se usan? | `07-business-gtm-metrics.md` | Cubierta |
| Ejecución | ¿En qué orden se construye? | `08-roadmap.md` | Cubierta |
| Ownership | ¿Quién debe responder por cada área? | `08-roadmap.md` | Cubierta; faltan nombres por acuerdo |
| Riesgos | ¿Qué puede romper el proyecto? | `06`, `07` y `08` | Cubierta |
| Evidencia | ¿Qué respaldan los materiales existentes? | `09-research-decisions.md` | Cubierta |
| Decisiones | ¿Qué es canónico y qué sigue abierto? | `09-research-decisions.md` | Cubierta |

## Trazabilidad de las decisiones conversadas

| Requisito expresado | Implementación canónica |
|---|---|
| “Ser como Startups Argentina” | Directorio público, ingesta, reclamación, frescura, SEO y alertas |
| “También fabricar” | Pasantías, trainees y proyectos pagados con evidencia final |
| “Ser más un LinkedIn killer” | Ambición de categoría; sistema de trayectoria, no feed social inicial |
| “¿Se deberían poder subir vacantes?” | Sí: envío moderado y publicación por organización, además de agregación |
| “Directo sería la app” | `/` abre el directorio unificado; no landing |
| “No hipercargado” | Encabezado compacto, búsqueda, filtros progresivos y una lista continua |
| “Respeto por colores y marca” | Símbolo y recorrido azul–turquesa–menta conservados, normalizados y sujetos al vector original |
| “No separar startups de oportunidades” | Cada startup contiene sus roles activos dentro de la misma fila; el resto se resuelve con filtros |
| “Sin referencias geográficas en la marca” | Operación concentrada internamente y posicionamiento público neutro |
| “React + Vite” | React mediante Next.js/TypeScript por SEO y servidor; Vite puro descartado para el producto público |

## Invariantes de consistencia

Toda implementación y modificación debe mantener:

1. La raíz es producto, no campaña de marketing.
2. Startups y oportunidades forman una sola colección pública filtrable.
3. Buscar y abrir no requiere autenticación.
4. La procedencia de una oferta nunca se oculta.
5. Externa y nativa son experiencias distintas.
6. `Gestionada por LinkUp` solo aparece con acuerdo y operación real.
7. No hay cobro al candidato por postular.
8. No hay menores en el flujo laboral del MVP.
9. No hay feed, likes o conexiones en P0.
10. IA no decide rechazo.
11. Organización solo accede a postulaciones propias y consentidas.
12. Éxito se mide por resultados, no por inventario o visitas aisladas.
13. La marca usa `LinkUp` y una interfaz sobria, no la estética escolar histórica.
14. La operación puede concentrarse por mercado, pero la marca y la interfaz no se etiquetan por geografía.

## Dependencias externas abiertas

Estas dependencias impiden una liberación pública, pero no son vacíos de especificación:

- Firma del acuerdo de cofundadores y cesión/atribución de IP.
- Búsqueda de marca, dominio y cuentas.
- Archivo vectorial y confirmación de colores/titularidad.
- Opinión jurídica sobre privacidad, intermediación, contratación y pasantías.
- Selección de proveedores y regiones de datos.
- Compromiso de organizaciones, oferta y cohorte.
- Evidencia de disposición a pagar.
- Nombres de responsables por área y capacidad real.

Cada una aparece como puerta o asunto abierto en `08-roadmap.md` y `09-research-decisions.md`.

## Cambios que requieren decisión formal

- Añadir feed, mensajería, eventos o cursos.
- Admitir personas menores de 18 años.
- Cobrar candidatos.
- Ocultar procedencia o combinar postulación externa/nativa.
- Automatizar rechazo o ranking de personas.
- Procesar CV completos con IA.
- Publicar otra categoría contractual.
- Expandir a un país sin operación de confianza.
- Cambiar stack central o separar servicios.
- Modificar la métrica norte.
- Cambiar el nombre o abandonar el símbolo heredado.

El cambio debe registrar razón, evidencia, impacto, decisión reemplazada y documentos actualizados.

## Criterio de preparación por actividad

### Se puede iniciar ahora

- Acuerdo de fundadores.
- Búsqueda de marca y recuperación de assets.
- Entrevistas y reclutamiento del piloto.
- Inventario manual con el esquema definido.
- Matches concierge consentidos.
- Prototipo responsive.
- Backlog técnico derivado de requisitos.

### Requiere cerrar decisiones antes

- UI final de marca: O-002 y O-003.
- Adaptador productivo: O-007.
- Procesamiento de datos reales: O-009 y políticas aprobadas.
- Proyectos gestionados: O-008, O-010 y contrato revisado.
- Cobros: O-006 y O-010.
- Lanzamiento público: todas las puertas de `08-roadmap.md`.

## Auditoría de documentación

La revisión final debe comprobar:

- Todos los enlaces canónicos existen.
- No hay escritura inconsistente `LinkUP`, `Link UP` o `Link - Up` fuera de ejemplos prohibidos.
- No se propone una landing como raíz.
- La raíz conserva una sola lista y no reintroduce pestañas por tipo de objeto.
- No se mezclan eventos o voluntariado en el MVP.
- Las referencias a Vite explican por qué no se usa como arquitectura principal.
- Toda cifra histórica conserva muestra/fuente y cautela.
- Toda afirmación jurídica está enlazada, limitada o marcada para revisión.
- Los originales permanecen intactos.
- No existen marcadores temporales de trabajo ni decisiones implícitas sin identificador.

## Cierre de definición v1.0

### Verificación ejecutada

- 10 documentos canónicos más el índice `README.md` presentes.
- 14 enlaces locales resueltos.
- 60 requisitos funcionales con identificadores únicos.
- Un H1 por archivo, jerarquía de encabezados válida, tablas consistentes y bloques de código cerrados.
- Sin marcadores temporales de implementación.
- Invariantes revisados mediante búsquedas cruzadas de marca, edad, landing, lista unificada, modos de postulación, eventos, IA y stack.
- Los cuatro archivos históricos conservaron los hashes SHA-256 registrados al iniciar el control de integridad.

La definición responde qué construir, para quién, cómo debe comportarse, cómo se opera, cómo se protege, cómo puede ganar dinero, cómo se valida y en qué orden se ejecuta.

El siguiente paso no es añadir más alcance. Es probar la alfa con personas y organizaciones reales, cerrar las puertas empresariales y reemplazar datos demostrativos únicamente con fuentes y consentimientos aprobados.
