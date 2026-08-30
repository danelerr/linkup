# Roadmap y plan de ejecución

Versión: 1.0  
Dependencias: toda la definición canónica  
Horizonte: preparación, construcción y piloto; las fechas se fijan cuando exista equipo comprometido

## Resultado del roadmap

El objetivo no es “lanzar una plataforma”. Es demostrar, con un producto pequeño y una operación real, este circuito:

```text
oferta vigente
  -> descubrimiento
  -> candidato compatible
  -> respuesta
  -> resultado verificable
  -> disposición a repetir o pagar
```

La construcción se organiza por puertas. Una fase no se considera terminada por tener pantallas si el riesgo que debía resolver sigue abierto.

## Supuestos de capacidad

El rango de tiempo supone como mínimo:

- Una persona responsable de producto y decisiones.
- Una persona de ingeniería full-stack con dedicación sustancial.
- Una persona de operaciones/curación y confianza.
- Una persona responsable de alianzas y adquisición, aunque comparta rol con un cofundador.
- Apoyo puntual de diseño de marca y asesoría jurídica.

Con una sola persona a tiempo parcial, las fases deben reducir alcance; no conservar el mismo alcance y fingir el mismo calendario.

## Puerta 0: autoridad para construir

Antes de inversión significativa se necesita una decisión escrita sobre:

- Cofundadores, roles, dedicación y autoridad final por área.
- Participación, vesting, cliff, salidas y adquisición inversa cuando corresponda.
- Propiedad intelectual previa y futura.
- Uso de nombre, logo, materiales y cuentas.
- Gastos, contratación y acceso a sistemas.
- Confidencialidad y conflicto de interés.
- Qué ocurre si la tesis o el equipo cambia.

Entregables:

- Acuerdo de fundadores revisado profesionalmente.
- Inventario de propiedad y accesos.
- Cap table acordado.
- Responsable único de cada puerta del roadmap.

La investigación y el prototipo pueden avanzar en paralelo, pero no se recomienda lanzar, contratar o ceder propiedad sin esta puerta.

## Puerta 1: derecho a usar la marca y operar el piloto

- Búsqueda legal y comercial de `LinkUp` en clases y países relevantes.
- Dominios y nombres sociales prioritarios.
- Archivo vectorial y titularidad del logo.
- Revisión de términos, privacidad, fuentes, intermediación y formatos de experiencia.
- Proveedores y flujo de datos aprobados.
- Política 18+ implementada.
- Al menos 10 organizaciones con compromiso operativo verificable.

Si el nombre no es defendible, se decide renombrar antes del sistema visual final y del lanzamiento público.

## Fase 0: descubrimiento operativo

Duración orientativa: 1–2 semanas.  
Puede iniciar inmediatamente.

### Objetivos

- Convertir relaciones existentes en compromisos observables.
- Validar los campos, taxonomías y flujos con casos reales.
- Obtener una línea base manual del problema.

### Trabajo

- Entrevistar 12–15 personas de talento.
- Entrevistar 10–15 founders o responsables de contratación.
- Entrevistar 5 aliados potenciales.
- Recolectar 50 startups y 30 oportunidades con procedencia.
- Intentar actualizar manualmente esas oportunidades durante dos semanas.
- Ejecutar 5 introducciones manuales con consentimiento.
- Conseguir cartas de intención o acuerdos simples de piloto.
- Priorizar áreas iniciales según oferta real, no preferencia del equipo.

### Salida

- Lista de organizaciones comprometidas y responsable de respuesta.
- Taxonomía corregida con ejemplos reales.
- Registro de búsquedas sin resultados y fricciones.
- Decisión `continuar / estrechar segmento / detener`.

## Fase 1: identidad y prototipo de experiencia

Duración orientativa: 1–2 semanas.  
Depende de acceso al logo y decisión de nombre.

### Objetivos

- Probar la simplicidad de entrada antes de construir backend completo.
- Traducir la marca heredada a un sistema sobrio y accesible.

### Entregables

- Logo vectorial, wordmark, favicon y reglas mínimas.
- Tokens de color, tipografía, espacio, radios, bordes y movimiento.
- Prototipo responsive de:
  - raíz con directorio unificado de startups y oportunidades;
  - resultados y filtros;
  - detalle de startup;
  - detalle de oportunidad;
  - autenticación diferida;
  - perfil y postulación;
  - pipeline de organización;
  - moderación esencial.
- Estados vacío, carga, error, vencido y reportado.
- Prueba de tareas con 5 personas de talento y 3 organizaciones.

### Criterios de salida

- Una persona encuentra una oportunidad relevante en móvil sin explicación del equipo.
- Comprende si la postulación es externa o nativa.
- Identifica fuente, vigencia y compensación.
- No confunde la página principal con una landing.
- El sistema visual pasa contraste y navegación básica por teclado.

## Fase 2: catálogo e ingesta

Duración orientativa: 2–3 semanas.

### Alcance P0

- Repositorio, entornos, CI y observabilidad base.
- Esquema de organizaciones, oportunidades, fuentes y auditoría.
- Panel mínimo de curación.
- Carga manual y primer adaptador estable.
- Normalización, deduplicación y vigencia.
- Búsqueda y filtros con PostgreSQL.
- Rutas públicas indexables, sitemap y metadata.
- `Agregar startup u oportunidad` con moderación.
- Reporte y retiro de una entidad.

### Criterios de salida

- 50 startups y 30 oportunidades publicables sin duplicados críticos.
- Procedencia y última revisión visibles.
- Una oportunidad cerrada sale del índice dentro del SLA.
- Un curador resuelve duplicado, cambio, vencimiento y reporte sin SQL manual.
- Objetivos móviles de rendimiento medidos con datos representativos.

## Fase 3: activación de talento

Duración orientativa: 2–3 semanas.

### Alcance P0

- Auth y consentimiento versionado.
- Perfil mínimo y privacidad.
- Evidencia por enlaces y visibilidad individual.
- Guardados y alertas.
- Clic externo + `Ya postulé` + seguimiento.
- Recomendaciones manuales o basadas en reglas simples.
- Exportación y cierre de cuenta.
- Correos transaccionales y preferencias.

### Criterios de salida

- El registro conserva la intención que lo originó.
- La persona puede terminar una acción interrumpida después de autenticarse.
- El equipo puede reconstruir el embudo sin leer texto sensible.
- Alertas no repiten la misma oportunidad por cambios menores.
- Exportación, eliminación y aislamiento de archivos pasan pruebas.

## Fase 4: organización y postulación nativa

Duración orientativa: 2–3 semanas.

### Alcance P0

- Reclamación y verificación manual de organización.
- Membresías y roles.
- Creación/edición de oportunidad.
- Preguntas estructuradas.
- Vista previa de datos antes de postular.
- Pipeline básico y cambios de estado.
- Notificaciones y seguimiento.
- Resultado reportado y verificado.
- Suspensión de organización y revocación de acceso.

### Criterios de salida

- Una organización solo ve sus candidatos consentidos.
- Dos organizaciones y dos candidatos pasan pruebas negativas de RLS.
- Todo cambio de estado relevante queda auditado.
- La persona conoce el estado y puede reportar abuso.
- El cierre de una oportunidad impide nuevos envíos sin perder historial.

## Fase 5: primera experiencia gestionada

Duración orientativa de preparación: 1–2 semanas; operación dentro del piloto.

### Alcance

- Plantilla de proyecto pagado.
- Revisión de organización y responsable.
- Criterios de selección y aceptación.
- Consentimientos y acuerdos fuera de plataforma cuando corresponda.
- Hitos, seguimiento, disputa y verificación.
- Evidencia final controlada por la persona.

### Criterios de salida

- Al menos tres proyectos listos con alcance y compensación.
- Ningún proyecto inicia sin responsable y condiciones aceptadas.
- Existe canal de impago/disputa probado mediante simulación.
- La finalización produce evidencia reutilizable con permiso.

## Fase 6: piloto cerrado

Duración: 6 semanas de operación.

### Alcance

- 10–15 startups.
- 75–100 personas invitadas.
- 20–30 oportunidades.
- 3–5 experiencias diseñadas.
- Matching y soporte concierge.
- Dashboard semanal y entrevistas continuas.
- Pruebas de disposición a pagar.

### Cadencia

**Diaria**

- Revisar fuentes críticas y fallas.
- Atender reportes críticos/altos.
- Desbloquear postulaciones.

**Dos veces por semana**

- Revisar procesos sin respuesta.
- Enviar shortlist con consentimiento.
- Contactar organizaciones responsables.

**Semanal**

- Dashboard del piloto.
- Revisión de búsquedas sin resultado.
- Entrevistas de salida o avance.
- Decisiones de producto y operación.

**Al cierre**

- Verificar resultados.
- Calcular horas y margen por oferta.
- Cobrar o renovar pilotos.
- Decidir siguiente segmento.

## Fase 7: decisión posterior al piloto

Solo se prioriza después de revisar los umbrales de `07-business-gtm-metrics.md`.

### Camino A: ampliar catálogo

Elegir si hay fuerte descubrimiento, retorno y reclamaciones, pero baja conversión a experiencias. Mejorar fuentes, SEO, alertas y cobertura en un segmento adyacente.

### Camino B: profundizar selección

Elegir si las organizaciones pagan por candidatos y responden. Mejorar workspace, reglas, coordinación e integraciones ligeras.

### Camino C: profundizar proyectos

Elegir si los proyectos terminan, se pagan y generan evidencia. Estandarizar plantillas, partners, seguimiento y eventualmente pagos, tras revisión legal.

### Camino D: detener o reposicionar

Elegir si no hay resultados repetibles, respuesta de empresas o disposición a pagar. Preservar aprendizajes y no esconder la falta de liquidez con más funciones.

## Cronograma orientativo

Con trabajo paralelo y el equipo mínimo, la preparación y construcción del piloto puede tomar 10–14 semanas; el piloto agrega 6 semanas de operación. Es un rango de planificación, no una promesa.

| Semana | Trabajo dominante |
|---|---|
| 1–2 | Puertas empresariales, investigación, inventario y marca |
| 2–3 | Prototipo y pruebas; preparación técnica |
| 3–6 | Catálogo, ingesta, búsqueda y admin |
| 5–8 | Auth, perfil, guardados, alertas y seguimiento externo |
| 7–10 | Organización, postulación nativa, confianza y resultados |
| 9–11 | Experiencias gestionadas y hardening |
| 12–17 | Piloto cerrado de seis semanas |
| 18 | Decisión y plan de siguiente etapa |

Las superposiciones solo aplican si existen dueños distintos. Seguridad, políticas y pruebas no se dejan para la última semana.

## Backlog priorizado

### P0: necesario para demostrar la tesis

- Definición y verificación de fuentes.
- Directorio y búsqueda públicos.
- Procedencia, vigencia y compensación.
- Curación y moderación.
- Auth, perfil y evidencia básica.
- Guardados, alertas y seguimiento externo.
- Reclamación de organización.
- Postulación nativa y pipeline básico.
- Matching manual asistido por reglas.
- Resultados verificables.
- Consentimiento, privacidad, reportes y auditoría.
- Operación de proyectos pagados fuera de pagos de plataforma.
- Instrumentación del embudo.

### P1: después de probar uso recurrente

- Colecciones editoriales compartibles.
- Perfil público opcional más expresivo.
- Importación consentida de portafolio/repositorios.
- Recomendaciones personalizadas dentro del producto.
- Plantillas y colaboración de organización.
- Dashboard agregado para aliados.
- Fuente adicional solo donde mejore cobertura.
- Revalidación automática de organización.

### P2: después de probar negocio y escala

- Integraciones ATS.
- API o widgets para aliados.
- Motor externo de búsqueda.
- Pagos/escrow para proyectos.
- Mensajería limitada con controles.
- Expansión multilingüe.
- Producto educativo para menores, si pasa su propia revisión.
- Aplicación móvil nativa, solo si el uso demuestra necesidad.

### No planificado

- Feed social general.
- Likes, seguidores o conexiones por sí mismas.
- Cursos propios.
- Generación masiva de contenido con IA.
- Ranking público de personas.
- Web3, badges en blockchain o tokenización sin problema demostrado.

## Responsabilidad por área

No se asignan nombres hasta acordar roles. Cada fila requiere una sola persona `Accountable`.

| Área | Responsable de resultado | Colaboradores |
|---|---|---|
| Estrategia y alcance | Product lead/cofundador designado | founders, investigación |
| Diseño y marca | Design owner | producto, fundador custodio de marca |
| Ingeniería y datos | Tech lead | producto, operaciones |
| Fuentes y curación | Marketplace operations lead | ingeniería, partnerships |
| Talento y matching | Talent operations lead | producto, confianza |
| Organizaciones e ingresos | Partnerships/commercial lead | producto, operaciones |
| Privacidad y seguridad | Trust owner | tech lead, asesoría jurídica |
| Métricas y experimentos | Product/data owner | todas las áreas |
| Decisión de lanzamiento | CEO o autoridad acordada | responsables de puertas |

Una persona puede cubrir varias áreas en el piloto, pero el nombre y el tiempo disponible deben registrarse.

## Rituales de ejecución

- **Triage diario de 15 minutos:** bloqueos, incidentes y oferta vencida.
- **Revisión semanal de producto:** métricas, investigación, decisiones y backlog.
- **Revisión semanal de marketplace:** oferta, demanda, postulaciones y respuestas.
- **Revisión quincenal de confianza:** reportes, permisos, fuentes y proveedores.
- **Demo por fase:** flujo real con datos ficticios o consentidos.
- **Registro de decisiones:** toda alteración de tesis, alcance o política entra en `09-research-decisions.md`.

No convertir estos rituales en reuniones de estado: cada una termina con decisiones, dueños y fechas.

## Definition of Ready

Una tarea entra a construcción cuando:

- El problema y actor están identificados.
- Existe vínculo con un requisito o experimento.
- Hay criterio de aceptación observable.
- Se definieron estados, permisos, datos y eventos.
- Privacidad, abuso y accesibilidad fueron considerados.
- Dependencias y textos están disponibles.
- El tamaño permite terminarla dentro del ciclo de trabajo.

## Definition of Done

Una tarea está terminada cuando:

- Cumple aceptación en móvil y escritorio aplicables.
- Tiene estados normal, vacío, carga, error y denegado.
- Pasa typecheck, pruebas y revisión de permisos.
- Incluye analítica permitida y observabilidad.
- Incluye texto final y accesibilidad.
- Migración y rollback/forward fix están definidos.
- Documentación canónica refleja cualquier cambio.
- Funciona en staging con datos representativos.
- El responsable de producto acepta el resultado.

## Puertas de liberación

### Preview interna

- Build reproducible.
- Sin secretos ni datos reales.
- Flujos críticos navegables.

### Alpha con equipo y aliados

- RLS e identidades probadas.
- Fuente/retirada funcional.
- Soporte y auditoría.
- Políticas en borrador revisado.

### Piloto cerrado

- Criterios completos de `02-product-requirements.md`.
- Puerta de confianza de `06-trust-safety-privacy.md`.
- Backups y restauración probados.
- On-call y canal de incidentes.
- Consentimiento para cada participante y organización.
- Métricas y seguimiento operativo.

### Público

- Resultados del piloto justifican apertura.
- Nombre y marca despejados.
- Capacidad de moderación para volumen esperado.
- Políticas publicadas y asesoría jurídica cerrada.
- Fuentes prioritarias estables y acuerdos donde sean necesarios.
- Soporte, privacidad y seguridad pueden cumplir objetivos.

## Registro de riesgos de ejecución

| Riesgo | Probabilidad inicial | Impacto | Mitigación | Dueño requerido |
|---|---|---|---|---|
| Desacuerdo entre fundadores | Media | Crítico | Puerta 0 y autoridad escrita | founders |
| Nombre o logo no disponible | Media | Alto | búsqueda y plan de renombre temprano | marca/legal |
| Falta de oferta comprometida | Alta | Crítico | Fase 0 antes de backend amplio | partnerships |
| Fuentes prohíben o cambian acceso | Alta | Alto | acuerdos, envíos y adaptadores aislados | operaciones |
| Oportunidades vencidas | Alta | Alto | SLA, verificación y retiro | operaciones |
| Cruce de datos entre organizaciones | Baja | Crítico | RLS, pruebas negativas y auditoría | ingeniería |
| Menores ingresan al flujo | Media | Alto | declaración 18+, controles y soporte | confianza |
| Startup no paga un proyecto | Media | Alto | verificación, términos, hitos y suspensión | confianza/comercial |
| Matching discrimina u opaca | Media | Alto | señales limitadas, explicación, revisión humana | producto/confianza |
| Equipo automatiza antes de aprender | Alta | Medio | concierge y medición de horas | producto |
| Piloto produce vanidad, no resultados | Media | Alto | umbrales previos y desglose | data/producto |
| Una sola persona concentra accesos | Alta | Alto | inventario, MFA, backups y transferencia | founders/tech |

## Entregables para el handoff a desarrollo

- Esta documentación aceptada por los fundadores.
- Prototipo y sistema visual final.
- Backlog P0 convertido en historias vinculadas a requisitos.
- Diagrama y migraciones iniciales del modelo de datos.
- Catálogo de eventos.
- Fixtures de fuentes y ejemplos de deduplicación.
- Matriz de RLS y casos negativos.
- Textos legales y operativos aprobados.
- Dataset ficticio representativo.
- Lista de participantes del piloto y consentimiento.
- Dashboard y plantilla de revisión semanal.

## Primera semana recomendada

1. Firmar un memo de cofundadores y asignar autoridad provisional.
2. Iniciar búsqueda de marca y conseguir archivos fuente del logo.
3. Contactar a 15 startups con una petición concreta: oportunidad, responsable y compromiso de respuesta.
4. Reclutar 20 personas para investigación, no para una “lista de espera”.
5. Construir la base manual de 50 startups y 30 oportunidades usando el esquema definido.
6. Probar cinco matches manuales y medir cada paso.
7. Diseñar el prototipo mínimo de raíz, detalle y postulación con contenido real.
8. Revisar al final de la semana qué supuestos cambiaron antes de escribir el backlog técnico definitivo.
