# Ingesta, búsqueda y matching

Versión: 1.0  
Principio: agregar la oferta de forma amplia, pero nunca ocultar procedencia, vigencia o incertidumbre.

## Implementación local actual · 24 de septiembre de 2026

Funciona: envíos manuales y CSV/JSON (100 registros por lote) → validación y deduplicación → revisión humana → editor → publicación transaccional. Fuentes canónicas conservan los parámetros que identifican la vacante y eliminan tracking. El catálogo se puede editar, guardar como borrador y cerrar sin reconstruir la app. Las oportunidades vencidas dejan de aparecer activas y el servidor bloquea su postulación. Los cambios registran responsable, motivo y versión anterior; una edición obsoleta se rechaza.

Búsqueda SQL paginada sobre contenido normalizado, incluidos requisitos; filtros de industria, área, tipo, modalidad y nivel. No se envía el catálogo completo al navegador. Alertas conservan esos filtros y generan avisos internos para oportunidades publicadas después de guardar la búsqueda. No envían correos.

Lo descrito debajo sobre adaptadores, extracción, procedencia por campo, revalidación de fuentes, ranking y matching es **diseño objetivo**, no automatización instalada. Ningún importador visita enlaces o recopila contenido remoto en esta versión.

## Tipos de oferta

LinkUp obtiene oportunidades mediante cuatro canales:

1. **Indexadas:** observadas en una fuente oficial o autorizada.
2. **Enviadas:** propuestas por un usuario y moderadas.
3. **Declaradas:** creadas o confirmadas por una organización reclamada.
4. **Exclusivas:** diseñadas con LinkUp como pasantía, trainee o proyecto pagado.

La interfaz distingue postulación externa y nativa. No presenta una vacante indexada como una relación oficial con LinkUp.

## Política de fuentes

Orden preferido:

1. API, feed o exportación ofrecida por la organización.
2. Sitemap o página oficial de careers con permiso compatible.
3. Fuente de un aliado con acuerdo.
4. Envío manual con enlace oficial.
5. Fuente secundaria únicamente para descubrimiento; requiere confirmación oficial antes de publicar como activa.

Antes de activar un adaptador se registra:

- Propietario y contacto de la fuente.
- URL y tipo.
- Condiciones de uso y robots aplicables.
- Datos permitidos.
- Frecuencia razonable.
- Atribución requerida.
- Mecanismo de baja o corrección.
- Responsable interno.

No se recopilan perfiles personales, correos privados ni información detrás de autenticación. No se eluden controles técnicos. Cuando una fuente no permita indexación, LinkUp debe buscar acuerdo, recibir envíos o limitarse a enlazar sin reproducir contenido.

## Arquitectura de adaptadores

Cada fuente implementa una interfaz común:

```ts
type DiscoveredRecord = {
  externalId?: string
  canonicalUrl: string
  observedAt: string
  raw: unknown
}

type NormalizedOpportunity = {
  organization: OrganizationCandidate
  opportunity: OpportunityCandidate
  provenance: FieldProvenance[]
  confidence: number
}

interface SourceAdapter {
  discover(cursor?: string): Promise<DiscoveredRecord[]>
  normalize(record: DiscoveredRecord): Promise<NormalizedOpportunity>
  healthcheck(): Promise<SourceHealth>
}
```

Los adaptadores no publican directamente. Producen candidatos normalizados que pasan por validación, deduplicación y política de publicación.

## Flujo de ingesta

```text
descubrir
  -> capturar hash y procedencia
  -> extraer campos
  -> normalizar taxonomía
  -> validar esquema
  -> resolver organización
  -> detectar duplicado
  -> comparar cambios
  -> asignar confianza
  -> publicar, actualizar o enviar a moderación
  -> verificar en ejecuciones posteriores
```

### Descubrimiento

- Usar petición HTTP directa siempre que sea posible.
- Usar parser de HTML solo para contenido público estable.
- Usar navegador automatizado únicamente si el contenido oficial requiere JavaScript y las condiciones lo permiten.
- Aplicar límites por dominio, backoff y caché condicional.
- No descargar repetidamente contenido que no cambió.

### Normalización

- Preservar texto original en referencia restringida solo cuando la fuente lo permite y durante un máximo inicial de 30 días; conservar después hash, procedencia y campos normalizados. Un caso abierto puede congelar la porción mínima necesaria con motivo y acceso auditado.
- Generar campos estructurados sin inventar valores.
- `no_especificado` es preferible a una inferencia falsa.
- Separar requisitos indispensables y deseables cuando el texto lo permita; si no, marcar incertidumbre.
- Normalizar ubicación, moneda, modalidad, tipo y nivel.
- Guardar procedencia por campo cuando varias fuentes difieren.

### Validación

Rechazar o moderar cuando:

- Falta organización identificable.
- No existe URL de fuente o evidencia de envío oficial.
- El título o descripción no permiten saber qué se ofrece.
- La oportunidad parece cerrada.
- Contiene solicitud de pago al candidato no explicada como matrícula de programa legítimo.
- Solicita datos sensibles innecesarios.
- Presenta condiciones discriminatorias o potencialmente abusivas.

## Resolución de organizaciones

Se intenta emparejar por:

1. Dominio web normalizado.
2. Identificador oficial o del socio.
3. Nombre normalizado más país.
4. Alias verificados.
5. Revisión humana.

No fusionar automáticamente empresas con nombres parecidos y dominios diferentes. Toda fusión conserva alias, redirecciones, fuentes y auditoría.

## Deduplicación de oportunidades

Señales fuertes:

- Mismo `source_id + external_id`.
- Misma URL canónica.
- Misma organización, título normalizado y ubicación, observados dentro de una ventana cercana.

Señales auxiliares:

- Similitud de responsabilidades y requisitos.
- Fecha de publicación.
- Identificador presente en URL.

La deduplicación produce tres resultados:

- `same_record`: actualizar observación.
- `same_opportunity_new_source`: vincular fuente adicional.
- `possible_duplicate`: moderación.

Nunca eliminar una fuente al fusionar; puede ser necesaria para atribución o recuperación.

## Cambios materiales

Se consideran materiales:

- Cierre o reapertura.
- Cambio de modalidad o ubicación.
- Cambio de compensación.
- Cambio de dedicación o duración.
- Cambio de requisitos indispensables.
- Cambio de fecha límite.
- Cambio de modo o URL de postulación.

Un cambio material incrementa `material_version`, registra diff y notifica a personas con postulación nativa o alerta relevante cuando corresponda.

## Vigencia

### Con fecha límite

- `activa` hasta la fecha y hora declaradas, considerando zona de la fuente.
- Tras el cierre pasa a `vencida` salvo reapertura confirmada.
- Una fuente inaccesible no extiende la vigencia por sí sola.

### Sin fecha límite

- Requiere verificación periódica.
- Si desaparece de la fuente, pasa a `pendiente_verificacion` y se retira temporalmente de resultados destacados.
- Tras observaciones consecutivas o confirmación, pasa a `cerrada`.

### SLA inicial

- Fuentes prioritarias y oportunidades exclusivas: cada 24 horas.
- Otras fuentes activas: hasta 72 horas.
- Reclamadas por organización: recordatorio de confirmación y cierre manual, con revisión automática de respaldo.

La interfaz muestra `Última verificación`, no una promesa absoluta de vigencia.

## Moderación de ingesta

Colas ordenadas por riesgo:

1. Reporte de fraude o seguridad.
2. Organización suspendida.
3. Cambio material en oportunidad con candidatos.
4. Posible duplicado.
5. Nueva fuente u organización.
6. Campo incompleto o baja confianza.
7. Contenido próximo a vencer.

La decisión incluye motivo canónico y nota. Las correcciones frecuentes alimentan mejoras del adaptador, no reglas ocultas en la interfaz.

## Búsqueda pública

### Índice inicial

PostgreSQL conserva un documento de búsqueda por entidad con:

- Nombre o título con mayor peso.
- Organización.
- Descripción corta.
- Industrias y áreas.
- Habilidades y roles normalizados.
- Ubicación y modalidad.
- Alias.

Se utiliza Full Text Search para relevancia lingüística y `pg_trgm` para errores y nombres aproximados.

### Consulta

Orden de procesamiento:

1. Normalizar texto y filtros.
2. Resolver coincidencias entre startup y sus oportunidades.
3. Aplicar estado público y vigencia.
4. Aplicar filtros estructurados.
5. Calcular relevancia textual.
6. Combinar calidad, vigencia y completitud.
7. Aplicar orden solicitado.
8. Registrar evento sin texto personal.

Normalización inicial:

- Recortar y colapsar espacios.
- Comparar sin distinguir mayúsculas o tildes, conservando el texto original para presentar.
- Aplicar alias controlados de industria, área, rol y habilidad.
- No expandir automáticamente una consulta a términos que cambien su intención.
- Consulta vacía muestra el directorio con orden estable de calidad y frescura.
- Filtros de categorías distintas se combinan con `AND`; selecciones dentro de la misma categoría usan `OR` salvo que el texto indique otra cosa.

### Paginación y estabilidad

- La primera respuesta devuelve hasta 20 filas.
- La API usa cursor opaco; no expone puntuaciones ni depende de `offset` para listas cambiantes.
- Cada orden tiene desempate estable por `id`.
- El cursor incorpora consulta normalizada, filtros, orden y versión del ranking; si alguno cambia, se reinicia.
- La interfaz usa `Cargar más`, no scroll infinito automático, y conserva posición al volver de un detalle.
- No se muestra un total exacto si calcularlo retrasa la búsqueda; `20+ resultados` es preferible a una cifra desactualizada.
- El máximo por petición es 50 y se aplican límites de abuso.

### Ranking inicial de startups

```text
45% relevancia del texto
20% estado de contratación vigente
15% verificación y procedencia
10% completitud útil
10% frescura
```

### Ranking inicial de oportunidades

```text
45% relevancia del texto
20% frescura y vigencia
15% calidad/verificación de fuente
10% claridad de condiciones
10% afinidad con el foco de talento emergente
```

Estos pesos son una hipótesis versionada. No se cobra por alterar el ranking orgánico. Un resultado patrocinado futuro debe estar etiquetado y no sustituir criterios mínimos de calidad.

### Ordenamientos explícitos

- Relevancia.
- Más recientes.
- Cierre próximo.

`Cierre próximo` excluye oportunidades ya vencidas y no convierte urgencia en relevancia personal.

## Filtros

### Startups

- País y ciudad.
- Industria.
- Etapa.
- Tamaño.
- Modalidad.
- Contratando.
- Verificación.

### Oportunidades

- Tipo.
- Área o rol.
- Nivel.
- Modalidad.
- País de ubicación y países aceptados.
- Dedicación.
- Condición económica; opción específica `Con monto o rango`.
- Cierra antes de.
- Gestionada por LinkUp.

Los filtros activos se codifican en URL y se pueden convertir en alerta.

## Autocompletado

El autocompletado puede sugerir:

- Startups.
- Roles.
- Habilidades.
- Industrias.
- Ubicaciones.

Los grupos llevan etiqueta. Se evita mezclar una persona, una empresa y una habilidad como resultados visualmente idénticos.

## Matching de talento

El matching es distinto de la búsqueda. La búsqueda responde una consulta; el matching utiliza perfil y preferencias con consentimiento.

### Paso 1: restricciones duras

- Oportunidad activa.
- Tipo aceptado por la persona.
- País o modalidad compatible.
- Disponibilidad y dedicación compatibles.
- Idioma indispensable declarado.
- Requisito legal legítimo.
- Fecha de inicio compatible cuando esté definida.

Una restricción desconocida se muestra como dato faltante; no siempre equivale a incompatibilidad.

### Paso 2: señales puntuables

Pesos iniciales para evaluación, no permanentes:

```text
30% habilidades con evidencia
20% objetivo o rol deseado
15% experiencia transferible
15% preferencias de entorno y modalidad
10% disponibilidad
10% señales de aprendizaje o proyecto relevante
```

No usar:

- Género.
- Etnia u origen.
- Fotografía o apariencia.
- Edad salvo elegibilidad legal mínima.
- Universidad como proxy general de calidad.
- Cantidad de contactos o seguidores.
- Capacidad de pagar.

### Paso 3: explicación

Cada recomendación produce:

- `Encajas por`: máximo tres señales concretas.
- `Debes confirmar`: dato desconocido importante.
- `Puedes fortalecer`: brecha no excluyente.
- `Fuente`: perfil, evidencia o preferencia que sustenta la explicación.

Ejemplo:

> Encajas por tu proyecto en React, disponibilidad de 20 horas y preferencia remota. Debes confirmar tu nivel de inglés. SQL aparece como deseable, no indispensable.

No mostrar porcentajes con falsa precisión al usuario durante el MVP.

### Paso 4: decisión humana

- La persona decide si postula.
- La organización revisa y decide.
- LinkUp puede curar una shortlist, pero registra criterios y no garantiza selección.

## Camino cuando la persona no está lista

Una recomendación puede ser de tres tipos:

- `postular_ahora`
- `crear_evidencia`
- `paso_formativo`

`crear_evidencia` apunta a proyecto pagado, proyecto propio acotado o experiencia verificable. `paso_formativo` solo recomienda un programa cuando responde a una brecha concreta; no convierte LinkUp en catálogo indiscriminado de cursos.

## Proyectos pagados

Campos obligatorios:

- Problema y contexto.
- Entregables verificables.
- Duración y dedicación máxima.
- Compensación y forma de pago declarada.
- Responsable de acompañamiento.
- Accesos y datos que se compartirán.
- Criterios de finalización.
- Derechos sobre el trabajo e IP.
- Posibilidad de contratación, sin promesa falsa.

No se publican proyectos que:

- Reemplacen indefinidamente un puesto sin compensación adecuada.
- Exijan trabajo especulativo a todos los postulantes.
- Soliciten información confidencial o credenciales inseguras.
- Tengan entregables abiertos sin límites.

## Uso de IA

### Permitido inicialmente

- Sugerir campos a partir de una descripción.
- Clasificar rol, industria y habilidades con revisión.
- Detectar posibles duplicados.
- Resumir una oportunidad sin ocultar la fuente.
- Generar una explicación a partir de señales estructuradas.
- Ayudar al curador a detectar lenguaje confuso o condiciones faltantes.

### No permitido inicialmente

- Publicar automáticamente datos de baja confianza.
- Inventar compensación, modalidad, requisito o fecha.
- Rechazar personas.
- Inferir atributos sensibles.
- Evaluar personalidad desde texto, foto, voz o video.
- Reescribir una candidatura de forma que falsee experiencia.

### Registro y evaluación

- Guardar proveedor, modelo, prompt versionado y salida estructurada cuando una decisión operativa dependa de ella.
- No enviar PII innecesaria.
- Crear conjunto de evaluación en español con casos bolivianos y latinoamericanos.
- Medir exactitud por campo, duplicados, explicaciones incorrectas y disparidad de resultados.
- Mantener fallback determinista y revisión humana.

## Alertas

Una alerta parte de filtros guardados. Antes de enviar:

1. Obtener oportunidades nuevas o materialmente modificadas.
2. Excluir cerradas, vistas o ya notificadas sin cambio importante.
3. Aplicar frecuencia y zona horaria.
4. Agrupar para evitar múltiples correos.
5. Registrar entrega y deduplicación.

Los recordatorios de fecha se envían, como hipótesis inicial, 7 días, 2 días y el día del cierre; no se fija 30/15/5 para oportunidades cortas. El usuario puede configurarlos.

## Métricas técnicas y de calidad

- Porcentaje de oportunidades activas verificadas dentro del SLA.
- Tasa de duplicados antes y después de moderación.
- Campos críticos desconocidos por fuente.
- Fuentes con fallas consecutivas.
- Búsquedas sin resultado.
- CTR de resultado por posición, sin usarlo como única señal de calidad.
- Guardados y postulaciones por tipo de fuente.
- Precisión humana de posibles duplicados.
- Recomendaciones aceptadas, descartadas y motivo.
- Entrevistas por postulaciones recomendadas frente a no recomendadas comparables.

## Cuándo incorporar un motor externo

PostgreSQL continúa como fuente de verdad. Se evalúa Typesense, Meilisearch o Algolia solo cuando:

- Relevancia multilingüe o facetas no alcanzan calidad suficiente.
- Las consultas e índices afectan la base transaccional.
- La latencia no cumple objetivos después de optimizar esquema e índices.
- Existe operación para sincronizar, reconstruir y observar el índice.

La migración requiere pruebas de paridad, reindexación reproducible y fallback.
