# Investigación, decisiones y asuntos abiertos

Versión: 1.0  
Fecha de corte: 29 de agosto de 2026  
Función: conservar evidencia, supuestos y decisiones para que el producto no cambie por memoria o preferencia

## Cómo usar este documento

- Una decisión `Aceptada` gobierna el trabajo hasta que se reemplace explícitamente.
- Un supuesto no se convierte en hecho por aparecer en una presentación.
- Una cifra externa conserva fuente, fecha y calidad.
- Un asunto abierto tiene responsable y evidencia requerida; no se resuelve por omisión.
- Cuando una decisión cambie, no se borra: se marca, por ejemplo, `Reemplazada por D-023`.

Según el orden definido en el `README.md`, una decisión aceptada aquí prevalece ante una contradicción en otro documento canónico. Cambiar una decisión exige actualizar los documentos afectados en el mismo cambio.

## Material revisado

### Fuentes históricas internas

| Fuente | Contenido útil | Límite |
|---|---|---|
| `Modelo Informe de proyecto (1).pdf` | Origen, problema social, primera propuesta, identidad y presentación para Horizontes Libres | Documento de concurso, no especificación de producto ni fuente jurídica confiable |
| `Proyecto - LinkUp.docx` | Iteración en Dux Academy, encuesta, visuales, propuesta de portal y antecedentes | Encuesta pequeña y dirigida; alcance mezcla eventos, educación, empleo y networking |
| `text1.md` | Requisitos iniciales de categorías, perfiles, vacantes y administración | Producto demasiado amplio y con patrones de portal convencional |
| `texto2.md` | Productos observados y referencias de mercado | Lista exploratoria, no análisis competitivo |

Estos archivos se conservaron intactos hasta el 25 de septiembre de 2026, cuando se retiraron del repositorio (commit `c71eab2`). Siguen en el historial de git (por ejemplo, `git show 2299452:text1.md`). Son evidencia histórica, no autoridad vigente.

### Conversaciones de definición

La dirección actual incorpora decisiones explícitas de los cofundadores en esta conversación:

- Combinar agregación tipo Startups Argentina con creación de trayectoria.
- Ser buscador y “fabricar” primeras experiencias.
- Permitir vacantes enviadas y también recopilarlas de fuentes externas.
- Entrar directamente a la app, sin landing promocional.
- Mantener la página inicial extremadamente minimalista.
- Respetar el símbolo y la familia cromática de LinkUp mientras se profesionaliza la marca.

## Evidencia de la encuesta heredada

Base observada: 34 respuestas. El documento menciona como objetivo una muestra de 60, por lo que la ejecución no alcanzó el objetivo declarado.

### Resultados transcritos

| Pregunta/señal | Resultado |
|---|---:|
| Edad 16–18 | 58,8% |
| Edad 19–21 | 29,4% |
| Edad 22–23 | 11,8% |
| Secundaria | 47,1% |
| Universidad | 47,1% |
| Formación técnica | 5,9% |
| No sabe dónde encontrar oportunidades | 44,1% |
| A veces le resulta difícil encontrarlas | 41,2% |
| Las encuentra fácilmente | 14,7% |
| Perdió una oportunidad por enterarse tarde | 76,5% |
| Principal dificultad: no sabe dónde buscar | 50,0% |
| Principal dificultad: información poco clara | 20,6% |
| Principal dificultad: falta de tiempo | 20,6% |
| Principal dificultad: requisitos confusos | 8,8% |
| Se entera por redes sociales | 23 de 34; 67,6% |
| Se entera por amigos/conocidos | 20 de 34; 58,8% |
| Se entera mediante búsqueda propia | 9 de 34; 26,5% |
| Se entera por universidad | 5 de 34; 14,7% |
| Cree que no hay suficientes oportunidades en el país | 61,8% |
| Interés alto en oportunidades que mejoren su perfil | 91,2% |
| Su entorno quizá le enseña a prepararse | 52,9% |
| Su entorno no le enseña a prepararse | 29,4% |
| La mayoría de oportunidades pide experiencia | 67,6% |
| Una plataforma centralizada sería muy útil | 85,3% |
| Una plataforma centralizada sería algo útil | 11,8% |

Tipos de interés declarados:

- Talleres, cursos o mentoría: 32,4%.
- Becas: 29,4%.
- Pasantías: 17,6%.
- Voluntariado: 17,6%.
- Eventos académicos: aproximadamente 2,9%.

### Qué permite inferir

- Existe una señal inicial de fragmentación y descubrimiento tardío en ese grupo.
- Redes y relaciones personales dominan el descubrimiento.
- La exigencia percibida de experiencia respalda investigar formatos de primera experiencia.
- Una herramienta centralizada resulta intuitivamente atractiva para los encuestados.

### Qué no permite inferir

- Tamaño de mercado.
- Disposición a usar el producto repetidamente.
- Disposición de empresas a publicar, responder o pagar.
- Que un buscador resuelva por sí solo la obtención de empleo.
- Resultados representativos de toda Bolivia o de 18 a 28 años.
- Necesidad de todas las categorías propuestas originalmente.

La mayoría de participantes tiene 16–18 años, mientras el mercado laboral inicial ahora es 18+. La siguiente investigación debe reclutar deliberadamente al segmento vigente.

### Sesgos y limitaciones

- Muestra de conveniencia pequeña.
- Procedencia y reclutamiento no documentados con suficiente detalle.
- Preguntas que describen la solución antes de medir comportamiento.
- Respuestas de utilidad hipotética, no acciones observadas.
- Algunas opciones se solapan.
- No existe segmento de empresas.
- No existe seguimiento longitudinal ni resultado real.

La encuesta es una señal para formular hipótesis, no validación de producto.

## Evidencia competitiva

### Startups Argentina

[Startups Argentina](https://www.startupsargentina.com/) demuestra el atractivo de una entrada utilitaria basada en directorio, búsqueda y oportunidades del ecosistema, en lugar de una landing corporativa.

En publicaciones de su [founder, Cielo Dahy](https://ar.linkedin.com/in/cielo-dahy), se reportaron, entre otros hitos:

- Inicio como una hoja de cálculo y producto construido durante un fin de semana.
- Inventario cargado antes del lanzamiento: perfiles de startups conocidas, vacantes vigentes y enlaces directos de postulación.
- Más de 500 usuarios activos en menos de tres días y 2.000 personas durante la primera semana.
- 610 personas hicieron clic en `Aplicar` y se generaron más de 1.900 clics de aplicación durante esa primera semana, reportados como crecimiento orgánico sin anuncios.
- Más de 6.000 usuarios a las dos semanas y más de 10.000 personas en menos de un mes.
- La función de matching con IA apareció después de que el directorio ya había demostrado demanda.

Estas son cifras reportadas por la founder y útiles como señal de distribución; no fueron auditadas independientemente y no deben presentarse como evidencia propia de LinkUp. El aprendizaje importante no es copiar la IA: es lanzar con inventario útil, eliminar la fragmentación, entregar tráfico medible a las startups y convertir cada nueva vacante en una pieza de distribución founder-led.

### Work at a Startup

[Work at a Startup de Y Combinator](https://www.ycombinator.com/jobs) permite crear un solo perfil y descubrir miles de roles de empresas YC; su fuerza proviene de una oferta exclusiva y una red con confianza previa. El [ATS de YC](https://www.ycombinator.com/jobs/ats) extiende ese valor al flujo de selección de las empresas.

Aprendizajes:

- El perfil único reduce repetición.
- Una red cerrada con oferta densa puede ser más valiosa que un catálogo universal.
- La herramienta para empresas puede monetizar después de conseguir liquidez.
- LinkUp no puede copiar la ventaja de la red YC; debe construir la suya mediante ecosistema regional, evidencia y primeras experiencias.

### LinkedIn

LinkedIn establece el hábito de identidad profesional, reputación y distribución. La oportunidad de LinkUp no es replicar su feed ni su grafo desde cero. Es resolver un momento que LinkedIn atiende débilmente: construir la primera evidencia cuando todavía no existe trayectoria formal.

La frase `LinkedIn killer` se usa solo como ambición interna para discutir categoría. No es posicionamiento público ni criterio para llenar el MVP de funciones sociales.

## Registro de decisiones

### D-001 — Producto dual

- **Estado:** Aceptada.
- **Decisión:** LinkUp combina directorio/agregador y sistema de trayectoria; ninguno es un producto secundario.
- **Razón:** el directorio aporta distribución y el circuito de resultados aporta diferenciación y retención.
- **Implicación:** el MVP debe probar al menos un resultado, no solo búsquedas.

### D-002 — Posicionamiento público

- **Estado:** Aceptada.
- **Decisión:** presentarse como el lugar para descubrir quién está construyendo y dónde sumarse, sin una etiqueta nacional o regional en la marca.
- **No usar:** `LinkedIn killer` como encabezado o promesa.

### D-003 — Segmento inicial

- **Estado:** Aceptada.
- **Decisión:** talento emergente de 18–28 años y startups que pueden ofrecer roles iniciales o necesidades acotadas.
- **Nota:** 28 no es un bloqueo rígido para navegar; 18 sí es la puerta del flujo laboral del MVP.

### D-004 — Geografía

- **Estado:** Aceptada.
- **Decisión:** concentrar la operación inicial donde el equipo tiene relaciones y capacidad de curación, pero mantener el posicionamiento público geográficamente neutro.

### D-005 — Entrada de producto

- **Estado:** Aceptada.
- **Decisión:** `/` es la aplicación, no una landing.
- **Contenido:** encabezado compacto, búsqueda, filtros y una lista unificada.

### D-006 — Una sola colección pública

- **Estado:** Aceptada.
- **Decisión:** la startup es la unidad principal y sus oportunidades aparecen anidadas en la misma fila; industria, área, tipo y modalidad son filtros.
- **Razón:** separar ambos objetos obliga a la persona a decidir dónde buscar y rompe la relación que vuelve útil al directorio.

### D-007 — Autenticación diferida

- **Estado:** Aceptada.
- **Decisión:** explorar no exige cuenta. Guardar, crear alerta, registrar seguimiento o postular nativamente sí.

### D-008 — Dos modos de postulación

- **Estado:** Aceptada.
- **Decisión:** ofertas indexadas llevan a fuente externa y permiten reportar seguimiento; otras aceptan postulación nativa, autogestionada por la organización o gestionada operativamente por LinkUp.
- **Regla:** la interfaz siempre distingue ambos modos.

### D-009 — Alcance de oferta

- **Estado:** Aceptada.
- **Incluye:** empleo, pasantía, apprenticeship, trainee, proyecto pagado, fellowship, programa profesional y beca formativa cuando produce trayectoria.
- **Excluye del MVP:** portal general de eventos y voluntariado como categoría mezclada con trabajo.

### D-010 — Creación de oferta

- **Estado:** Aceptada.
- **Decisión:** LinkUp no solo recopila; ayuda a diseñar pasantías, trainees y proyectos pagados.
- **Regla:** condiciones, mentoría y compensación son explícitas.

### D-011 — Marca

- **Estado:** Aceptada con dependencia.
- **Decisión:** conservar símbolo de eslabón/flecha y familia azul–turquesa–menta; evolucionar a producto sobrio, blanco y preciso.
- **Dependencia:** archivo vectorial, colores oficiales y titularidad.

### D-012 — Lenguaje visual

- **Estado:** Aceptada.
- **Decisión:** listas continuas, divisores finos, casi sin sombras, densidad controlada y una sola firma de degradado.
- **No usar:** hero grande, paneles de estadísticas, grid de tarjetas, patrones de nodos o gradientes decorativos múltiples.

### D-013 — Arquitectura web

- **Estado:** Aceptada.
- **Decisión:** Next.js App Router + TypeScript, no una SPA React/Vite pura.
- **Razón:** páginas públicas indexables, metadata, rutas compartibles y lógica de servidor forman parte del producto.

### D-014 — Plataforma de datos

- **Estado:** Aceptada para el MVP.
- **Decisión:** Supabase con PostgreSQL, Auth, Storage y RLS; Trigger.dev para tareas; Vercel para entrega.
- **Revisión:** separar servicios solo con evidencia de carga o equipos independientes.

### D-015 — Búsqueda y matching

- **Estado:** Aceptada.
- **Decisión:** PostgreSQL FTS + `pg_trgm`; reglas explicables y curación humana.
- **No hacer inicialmente:** motor vectorial o modelo que decida selección.

### D-016 — IA

- **Estado:** Aceptada.
- **Decisión:** IA puede extraer, normalizar, sugerir y explicar; no rechaza personas ni publica sin controles.
- **Posición:** capacidad auxiliar, no promesa central.

### D-017 — Privacidad

- **Estado:** Aceptada.
- **Decisión:** perfil público opcional, consentimiento por postulación, mínimos datos y derechos de acceso/exportación/eliminación.

### D-018 — Menores

- **Estado:** Aceptada.
- **Decisión:** el flujo laboral del MVP es 18+. Cualquier línea para menores es un producto separado con revisión legal y salvaguardas.

### D-019 — Modelo de ingresos

- **Estado:** Aceptada como hipótesis.
- **Decisión:** candidato gratuito; monetización B2B/B2B2C mediante campañas, shortlist, workspace, primeras experiencias y cohortes.
- **No hacer:** vender datos, cobrar por postular o ranking oculto.

### D-020 — Métrica norte

- **Estado:** Aceptada.
- **Decisión:** resultados de oportunidad verificados por mes, desglosados por tipo.
- **No usar como éxito:** registros, visitas o vacantes publicadas aislados.

### D-021 — Operación primero

- **Estado:** Aceptada.
- **Decisión:** matching, verificación, reclamaciones y proyectos pueden operarse manualmente durante el piloto.
- **Razón:** aprender antes de automatizar y medir costo real.

### D-022 — Nombre canónico

- **Estado:** Aceptada provisionalmente.
- **Decisión:** escribir `LinkUp`.
- **Dependencia:** búsqueda de marca y dominio puede forzar renombre.

### D-023 — Runtime de la alfa desplegable

- **Estado:** Reemplazada por D-024. Se conserva como antecedente, no como autorización de despliegue.
- **Decisión:** implementar la alfa en el runtime compatible con Next.js App Router de Vinext, Cloudflare D1 y autenticación SIWC provista por Sites.
- **Razón:** permite verificar el circuito completo y desplegar sin fingir una integración con Supabase cuyas credenciales, región y políticas todavía no fueron aprobadas.
- **Límite:** D-014 continúa gobernando la arquitectura productiva antes de operar datos reales a escala; esta adaptación no autoriza relajar consentimiento, permisos o auditoría.
- **Implicación:** acceso a datos permanece detrás de servicios de dominio, el esquema conserva migraciones y todos los datos visibles de la alfa se identifican como demostrativos.
- **Revisión:** al cerrar O-009 y seleccionar infraestructura productiva.

### D-024 — Aplicación independiente y catálogo operable

- **Estado:** Implementada localmente el 24 de septiembre de 2026; reemplaza D-023.
- **Decisión:** Next.js estándar, React/TypeScript, Tailwind y componentes propios; Morphicons únicamente para comunicar estados. Better Auth con cuenta de LinkUp y SQLite/Drizzle con migraciones para una instancia local persistente. Sin acceso con ChatGPT ni dependencia de Sites.
- **Razón:** corregir la navegación de producción del runtime beta, retirar la identidad del hosting y permitir operar el catálogo sin editar código.
- **Operación:** editor con borrador/publicado/cerrado; ingesta manual o CSV/JSON; fuentes y duplicados comprobados; aprobación y publicación atómicas; control de ediciones concurrentes. Búsqueda y paginación en servidor, vigencia comprobada al buscar y postular. Avisos de búsqueda dentro de LinkUp.
- **Límites:** no hay envío de email, recuperación/verificación por correo, scraping, IA de búsqueda ni programador de trabajos conectado. SQLite no es configuración multiinstancia. D-014 queda como referencia de evolución, no como infraestructura instalada.
- **Autorización:** desarrollo y pruebas locales. No publicar, desplegar ni conectar servicios externos sin una instrucción expresa del usuario.
- **Verificación:** unitarias de dominio, integración HTTP contra build de producción con base temporal, revisión de escritorio/móvil y teclado en navegador. Los ejemplos solo se insertan al activar una variable explícita y en una base separada.

### D-025 — Proponer información requiere cuenta

- **Estado:** Implementada localmente el 25 de septiembre de 2026.
- **Decisión:** `/agregar` acepta propuestas de startups, oportunidades, correcciones y reclamaciones solo desde una cuenta. El contacto es el correo de la cuenta y cada cuenta puede enviar hasta 5 propuestas por día. Explorar y abrir la postulación externa siguen sin cuenta.
- **Razón:** con envíos anónimos el límite por correo se evitaba cambiando de correo; una cuenta permite atribuir cada propuesta, consultar a quien la envió y limitar el volumen.
- **Límite:** mientras no exista verificación por correo (D-024), una cuenta no prueba la identidad ni el control del correo. La revisión humana sigue siendo obligatoria antes de publicar.
- **Revisión:** al conectar un proveedor de correo, exigir correo verificado para proponer.

### D-026 — Nueva identidad visual

- **Estado:** Implementada localmente el 27 de septiembre de 2026.
- **Decisión:** adoptar el tablero de marca entregado por el equipo: monograma `lU` con flecha ascendente, wordmark `LinkUp` con `Up` en celeste, lema `CONNECT.GROW.SUCCEED`, paleta Azul oscuro `#0F3151`, Celeste intenso `#11909D`, Cian `#47B9B2` y Celeste claro `#F3F5F7`, y tipografías Lato (texto) y Raleway (títulos y marca). Reemplaza la paleta azul-turquesa-menta y Manrope/Archivo Narrow.
- **Ajuste de accesibilidad:** el Celeste intenso no alcanza 4,5:1 con texto blanco; botones y enlaces usan `#0D7680`, el mismo tono oscurecido. El Cian solo se usa sobre azul oscuro o como decoración (docs/03).
- **Límite:** el símbolo de `public/marca/` es un redibujo fiel del tablero, no el archivo maestro de diseño. O-003 sigue abierto hasta recibir el vector original.

## Asuntos abiertos

| ID | Asunto | Evidencia para decidir | Momento límite | Responsable por asignar |
|---|---|---|---|---|
| O-001 | Acuerdo, vesting, IP y autoridad de cofundadores | documento firmado | antes de inversión/contratación | founders |
| O-002 | Disponibilidad de `LinkUp` | búsqueda legal, dominios y redes | antes de identidad final pública | legal/marca |
| O-003 | Archivo maestro del logo | vector original y titularidad; colores ya definidos en D-026 | antes de identidad final pública | marca |
| O-004 | Primera familia de roles | oferta comprometida + entrevistas | cierre Fase 0 | producto/partnerships |
| O-005 | Organizaciones y cohorte del piloto | acuerdos con responsables y fechas | antes de Fase 2 completa | partnerships |
| O-006 | Oferta pagada inicial | 15 entrevistas de precio + 3 pagos | durante piloto | comercial |
| O-007 | Fuentes autorizadas prioritarias | revisión de términos/acuerdos y fixtures | antes de activar adaptador | operaciones/legal |
| O-008 | Clasificación de intermediación laboral | opinión jurídica y requisitos MTEPS | antes de piloto | legal |
| O-009 | Tratamiento y transferencia de datos | análisis Bolivia + países/proveedores | antes de producción | legal/trust |
| O-010 | Estructura legal, facturación e impuestos | asesoría contable/jurídica | antes de cobrar | founders |
| O-011 | Política final de compensación visible | pruebas con oferta + revisión legal | antes de publicar oferta | producto/trust |
| O-012 | Dominio y URL canónica | disponibilidad, marca y SEO | antes de sitemap productivo | founders/tech |
| O-013 | Lenguaje regional | pruebas Bolivia y primer país adicional | antes de expansión | contenido |
| O-014 | Umbral de perfil utilizable | correlación con respuesta y carga | durante piloto | talent ops/data |
| O-015 | Método de verificación de resultados | tasa de confirmación y fraude | durante piloto | trust/producto |

Los asuntos O-001 a O-012 no son excusa para ampliar el MVP. Tienen una puerta y una prueba definida.

## Registro de supuestos

| ID | Supuesto | Confianza inicial | Cómo probarlo | Señal que lo refuta |
|---|---|---|---|---|
| A-001 | La fragmentación causa pérdida de oportunidades | Media | diarios de búsqueda y alertas reales | las personas ya tienen un canal suficiente |
| A-002 | Startups quieren más visibilidad | Media | reclamaciones y correcciones | no reclaman ni actualizan aun con tráfico |
| A-003 | Startups tienen roles adecuados para talento inicial | Baja-media | 15 entrevistas + oportunidades firmes | solo buscan senior sin capacidad de mentoría |
| A-004 | Evidencia mejora evaluación | Media | comparar shortlist y avance | no cambia decisiones o añade carga |
| A-005 | Talento actualizará seguimiento externo | Baja | recordatorios y tasa de reporte | menos de 20% actualiza aun con buen UX |
| A-006 | Alertas generan retorno | Media | cohortes de guardado y apertura | aperturas sin acciones o bajas frecuentes |
| A-007 | Founders pagarán por shortlist | Baja | oferta manual con precio real | valor reconocido pero cero pagos |
| A-008 | Proyectos pagados crean una primera experiencia útil | Media | 3–5 proyectos y siguiente match | impagos, baja finalización o evidencia irrelevante |
| A-009 | Bolivia puede concentrar liquidez inicial | Media | densidad por rol y respuesta | oferta insuficiente incluso con red activa |
| A-010 | Oferta remota amplía sin diluir relevancia | Media | búsquedas, elegibilidad y respuesta | vacantes no aceptan realmente al segmento |
| A-011 | La lista unificada permite entender startup y roles sin explicación | Media | prueba de tareas | las personas no distinguen perfil de empresa y vacante |
| A-012 | Los filtros cubren la intención sin categorías de navegación | Media | consultas y tareas | las personas necesitan vistas separadas para completar tareas |
| A-013 | Curación manual es sostenible durante piloto | Media | horas por entidad/resultado | cola o costo crece antes de aprender |
| A-014 | Los resultados pueden verificarse sin fricción excesiva | Baja-media | tasa y tiempo de confirmación | partes no responden o discrepan frecuentemente |

## Correcciones y afirmaciones no autorizadas

No reutilizar sin nueva evidencia:

- `El 27% de la población tiene entre 18 y 28 años.` La cifra encontrada en material estadístico consultado estaba asociada a otra franja y no respalda esa afirmación.
- `El artículo 71 de la Constitución garantiza educación.` El artículo se refiere a derechos de personas con discapacidad.
- `La Resolución Ministerial 140/2021 regula exactamente el modelo LinkUp.` Su texto y alcance oficial no fueron confirmados.
- `La encuesta valida el mercado.` Solo aporta 34 respuestas de conveniencia.
- `LinkUp ganó X lugar` o `fue validado por Dux/Es Libertad` sin documento y permiso para usar los nombres.
- `Startups Argentina tiene X usuarios hoy.` Las cifras observadas son hitos reportados por su founder en momentos específicos.
- `La IA encontrará el candidato perfecto.` El sistema no puede prometer ni definir perfección.
- `Oportunidades verificadas` sin explicar qué se verificó.
- `Empleo garantizado`, `respuesta garantizada` o `empresa segura`.
- `Pasantía` como forma de evitar obligaciones que surjan de las condiciones reales.
- Cualquier estimación de TAM, crecimiento o ingresos sin método y fuente fechada.

## Plan de investigación primaria

### Entrevistas con talento

Muestra inicial: 12–15 personas de 18–28 años, equilibrando educación, ciudad, experiencia, área y acceso a redes.

Preguntas orientadas a hechos:

1. Cuéntame la última oportunidad que buscaste.
2. ¿Qué hiciste primero y luego?
3. ¿En qué lugares buscaste y cuánto tiempo tomó?
4. Muéstrame, si puedes, cómo guardas o sigues oportunidades.
5. ¿Cuál fue la última que no alcanzaste y por qué?
6. ¿Qué información necesitaste antes de postular?
7. ¿Dónde te detuviste o abandonaste?
8. ¿Qué te respondieron y cuánto tardaron?
9. ¿Qué evidencia usaste para demostrar capacidad?
10. ¿Qué experiencia real te ayudó más a conseguir la siguiente?
11. ¿Aceptarías un proyecto pagado de alcance corto? ¿Qué condiciones necesitarías?
12. ¿Qué dato no querrías que fuera público o visible a todas las empresas?

No preguntar primero `¿usarías una plataforma que...?`.

### Entrevistas con startups

Muestra inicial: 10–15 personas que hayan intentado contratar o delegar en los últimos seis meses.

1. Cuéntame la última contratación o proyecto que intentaste cubrir.
2. ¿De dónde llegaron los candidatos?
3. ¿Cuánto tiempo empleó el equipo?
4. ¿En qué punto descartaron más personas y por qué?
5. ¿Qué señales predijeron un buen resultado?
6. ¿Qué riesgo percibes al contratar a alguien con poca experiencia?
7. ¿Qué necesidad real podría convertirse en proyecto de 2–6 semanas?
8. ¿Quién podría acompañarla y cuánto tiempo tiene?
9. ¿Qué información necesitas antes de hablar con una persona?
10. ¿Qué datos no necesitas y preferirías no recibir?
11. ¿Qué has pagado antes para contratar o encontrar freelancers?
12. Si LinkUp resolviera este caso hoy, ¿qué modalidad comprarías y con qué proceso de aprobación?

Pedir un siguiente paso real: compartir una oportunidad, designar responsable o aceptar un piloto con precio.

### Entrevistas con aliados

1. ¿Cómo registran oportunidades y resultados hoy?
2. ¿Qué parte del proceso requiere trabajo manual?
3. ¿Qué resultado deben demostrar a participantes o financiadores?
4. ¿Quién puede autorizar compartir datos y con qué consentimiento?
5. ¿Qué cohorte y periodo permitirían un piloto?
6. ¿Qué pagarían: acceso, operación, resultados o reporte?

### Prueba de usabilidad

Tareas, sin enseñar la navegación:

1. Encuentra una startup boliviana que te interese.
2. Encuentra una oportunidad remota para alguien sin experiencia formal.
3. Decide si sigue vigente y cómo se postula.
4. Guarda la búsqueda y vuelve a ella.
5. Explica qué datos recibirá la empresa.
6. En una cuenta de organización, revisa a una persona y cambia su estado.
7. Reporta una oportunidad sospechosa.

Registrar éxito, tiempo, retrocesos, interpretación y confianza; no solo preferencia estética.

## Registro de fuentes externas

| Tema | Fuente | Uso | Calidad/nota |
|---|---|---|---|
| Constitución | [Gaceta Oficial](https://www.gacetaoficialdebolivia.gob.bo/app/webroot/archivos/constitucion.pdf) | privacidad, acción de protección y menores | Primaria oficial |
| Normativa nacional | [Gaceta Oficial](https://www.gacetaoficialdebolivia.gob.bo/) | confirmar texto vigente | Primaria oficial; revisar por norma |
| Protección de datos | [Proyectos en tratamiento, Cámara de Diputados](https://diputados.gob.bo/proyectos-de-ley-en-tratamiento/) | estado del PL 538/2025-2026 | Primaria oficial; estado puede cambiar |
| Agenda/regulación digital | [AGETIC](https://agetic.gob.bo/estudios-e-investigaciones) | antecedentes y anteproyecto | Primaria institucional |
| Empleo/pasantías | [Ministerio de Trabajo](https://mintrabajo.gob.bo/) | localizar normas y requisitos | Primaria oficial; falta dictamen específico |
| Startups Argentina | [Producto](https://www.startupsargentina.com/) | patrón de directorio y búsqueda | Observación directa |
| Crecimiento Startups Argentina | [Cielo Dahy](https://ar.linkedin.com/in/cielo-dahy) | señal founder-led | Autorreporte; no auditado |
| Work at a Startup | [Y Combinator](https://www.ycombinator.com/jobs) | perfil único y oferta de red | Primaria del producto |
| ATS YC | [Y Combinator](https://www.ycombinator.com/jobs/ats) | herramienta para organizaciones | Primaria del producto |
| Next.js | [Documentación oficial](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) | renderizado y metadata | Primaria técnica; verificar al implementar |
| Vite SSR | [Documentación oficial](https://vite.dev/guide/ssr.html) | comparación arquitectónica | Primaria técnica |
| Supabase + Next.js | [Documentación oficial](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) | plataforma inicial | Primaria técnica; verificar versión |
| Supabase Auth/RLS | [Documentación oficial](https://supabase.com/docs/guides/auth) | identidad y políticas | Primaria técnica; verificar versión |
| Trigger.dev | [Documentación oficial](https://trigger.dev/docs/tasks/overview) | tareas asíncronas | Primaria técnica; verificar versión |

## Próxima actualización obligatoria

Actualizar este documento:

- Al concluir la Fase 0.
- Cuando se resuelva un asunto abierto.
- Al cambiar una decisión aceptada.
- Al cerrar cada semana del piloto con evidencia nueva.
- Antes de abrir otro país, segmento o modalidad contractual.
- Si cambia el estado de una norma, proveedor o fuente crítica.

La definición v1.0 está completa para iniciar validación y diseño detallado. Los asuntos abiertos son dependencias empresariales o hipótesis medibles, no huecos invisibles de alcance.
