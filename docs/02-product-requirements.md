# Requisitos, flujos y alcance

Versión: 1.0  
Dependencia: `01-product-definition.md`

## Definición del MVP

El MVP es una aplicación web pública, mobile-first y operada parcialmente por el equipo de LinkUp. Debe demostrar ambos motores del producto:

- Descubrimiento: directorio agregado de startups y oportunidades vigentes.
- Activación: perfil básico, recomendación asistida, postulación, seguimiento y resultado.

No es suficiente publicar un catálogo. Tampoco es necesario automatizar desde el primer día todo el matching o la recolección.

## Actores

### Visitante

Puede buscar, filtrar, abrir, compartir y visitar la fuente oficial sin cuenta.

### Talento registrado

Puede guardar, crear alertas, completar su perfil, registrar postulaciones externas, enviar postulaciones nativas, ver estados y administrar su privacidad.

### Miembro de organización

Puede reclamar o crear una organización, editarla después de aprobación, enviar oportunidades, administrar oportunidades propias y revisar candidatos que consintieron postular a su organización.

### Aliado

Es una organización con permisos para publicar programas o verificar experiencias de una cohorte. El dashboard agregado para aliados queda fuera del primer lanzamiento público y se opera inicialmente de forma manual.

### Curador

Puede revisar organizaciones, oportunidades, fuentes, duplicados, reportes y vencimientos; no puede cambiar configuración crítica o exportar datos sensibles.

### Administrador

Tiene capacidades de curador, gestiona roles, políticas, fuentes, auditoría y operaciones de soporte. El acceso a datos personales debe quedar registrado.

### Trabajador de sistema

Identidad no humana usada por ingesta, notificaciones y mantenimiento. Opera con credenciales separadas y mínimos privilegios.

## Arquitectura de información

### Navegación pública

- `Startups`
- `Oportunidades`
- `Ingresar`

La acción `Agregar` se muestra como enlace secundario o dentro del menú; no compite con la búsqueda.

### Navegación autenticada de talento

- `Explorar`
- `Guardados`
- `Postulaciones`
- `Perfil`

`Para ti` se incorpora cuando existan suficientes señales y oportunidades; durante el piloto puede resolverse dentro de `Explorar` como una lista curada.

### Navegación de organización

- `Perfil de organización`
- `Oportunidades`
- `Candidatos`
- `Equipo`

### Rutas iniciales

| Ruta | Acceso | Trabajo principal |
|---|---|---|
| `/` | Público | Buscar startups y sus oportunidades en una lista unificada |
| `/startups` | Público | Explorar directorio con filtros |
| `/startups/[slug]` | Público | Entender una startup y ver sus oportunidades |
| `/oportunidades` | Público | Explorar oportunidades con filtros |
| `/oportunidades/[slug]` | Público | Evaluar condiciones y postular |
| `/agregar` | Con cuenta | Proponer startup, oportunidad o corrección (D-025) |
| `/ingresar` | Público | Autenticarse |
| `/registro` | Público | Crear cuenta con consentimiento |
| `/mi-linkup` | Talento | Ver actividad y próximos pasos |
| `/mi-linkup/perfil` | Talento | Editar perfil, evidencia y privacidad |
| `/mi-linkup/guardados` | Talento | Revisar oportunidades guardadas |
| `/mi-linkup/postulaciones` | Talento | Registrar y seguir procesos |
| `/mi-linkup/alertas` | Talento | Administrar búsquedas y recordatorios |
| `/organizacion/[id]/panel` | Organización | Ver estado del perfil y oportunidades |
| `/organizacion/[id]/candidatos` | Organización | Gestionar postulaciones nativas |
| `/admin` | Equipo | Curación, moderación y operaciones |

## Pantalla inicial

La raíz no incluye landing, métricas promocionales, categorías destacadas ni bloques editoriales. Su encabezado breve orienta la búsqueda y da paso inmediato al directorio.

```text
LinkUp                                      Ingresar

[ Buscar una startup, industria o rol...          ]

[ Con oportunidades ]                        [Filtros]

Nombre de startup
Descripción de una línea
Industria · Etapa · Ubicación
 └─ Product intern · Pasantía · Híbrido
────────────────────────────────────────────────────────
Nombre de startup
Descripción de una línea
Industria · Modalidad
```

Reglas:

- Startups y oportunidades no compiten como categorías de navegación: cada startup contiene sus roles activos dentro de la misma fila.
- Industria, área, tipo y modalidad se resuelven como filtros sobre una única colección.
- En móvil, la búsqueda ocupa una fila completa y los filtros se abren en una hoja inferior.
- Las filas son enlaces completos; no se llenan de botones.
- No se muestran cifras si no son reales y auditables.

## Flujos principales

### Explorar sin cuenta

1. El visitante abre `/` y ve el directorio unificado.
2. Busca por startup, industria o rol.
3. Aplica filtros opcionales.
4. Abre un resultado.
5. Comparte o visita la fuente.
6. Solo se solicita cuenta si intenta guardar, alertar o postular nativamente.

### Guardar y crear alerta

1. La persona pulsa `Guardar` o `Crear alerta`.
2. Si no está autenticada, se preserva la intención y se abre autenticación.
3. Tras autenticarse, la acción se completa automáticamente.
4. La persona puede editar frecuencia o eliminar la alerta.

### Crear perfil sin onboarding pesado

1. La cuenta solicita términos, privacidad y confirmación 18+.
2. Si la intención era guardar o alertar, completa esa acción sin obligar a llenar el perfil.
3. Para recibir recomendaciones o postular, pide objetivo/rol, ubicación, modalidad, disponibilidad y al menos una habilidad o área.
4. La persona añade una primera evidencia por enlace o elige hacerlo después; CV sigue siendo opcional.
5. Revisa privacidad y vuelve directamente a la oportunidad o consulta que originó el registro.
6. Los campos adicionales se solicitan progresivamente cuando aportan a una acción concreta.

No existe un wizard largo previo a explorar. El indicador de completitud explica qué habilita cada dato; no usa vergüenza, puntuación social ni un porcentaje vacío de significado.

### Postulación externa

1. La persona abre una oportunidad indexada.
2. LinkUp muestra fuente, fecha de verificación y aviso de postulación externa.
3. Al pulsar `Postular en el sitio oficial`, se registra el clic con consentimiento analítico.
4. Al regresar, puede marcar `Ya me postulé`.
5. LinkUp solicita seguimiento después de plazos razonables: respuesta, entrevista, selección o sin respuesta.
6. El usuario puede corregir o eliminar ese historial.

### Postulación nativa

1. La persona abre una oportunidad con postulación dentro de LinkUp.
2. Revisa qué campos del perfil compartirá.
3. Responde un máximo inicial de tres preguntas específicas.
4. Confirma la postulación.
5. La organización recibe el perfil consentido.
6. La organización mueve el proceso por estados.
7. Cada cambio relevante notifica a la persona.
8. Al cerrar, ambas partes pueden confirmar el resultado.

### Agregar una startup u oportunidad

1. La persona busca primero para evitar duplicados.
2. Selecciona `Ya existe` o `Es nueva`.
3. Envía datos mínimos y fuente oficial.
4. Para enviar confirma un correo o usa su cuenta; el borrador se conserva durante la verificación.
5. El contenido queda `pendiente`, nunca se publica automáticamente.
6. Un curador verifica y aprueba, solicita cambios o rechaza con motivo.
7. Si el solicitante representa a la organización, puede iniciar reclamación.

### Reclamar una organización

1. El miembro solicita acceso desde el perfil público.
2. Verifica un correo del dominio oficial o aporta evidencia alternativa.
3. Un curador revisa identidad y autoridad.
4. Al aprobarse, recibe rol de miembro; el primer propietario requiere revisión reforzada.
5. Todos los cambios quedan auditados.

### Crear una primera experiencia

1. La startup elige `Proyecto pagado`, `Pasantía` o `Trainee`.
2. Define problema, entregables, duración, dedicación, responsable, compensación y criterios de finalización.
3. LinkUp revisa que no sea trabajo productivo gratuito disfrazado.
4. Se publica como oportunidad gestionada.
5. Los candidatos aplican con evidencia.
6. Al finalizar, organización y participante confirman resultado y habilidades demostradas.

## Requisitos funcionales

### Descubrimiento

- **DISC-001:** cualquier visitante puede buscar startups y sus oportunidades en la misma lista sin autenticarse.
- **DISC-002:** la búsqueda acepta texto libre y conserva filtros en la URL.
- **DISC-003:** los filtros iniciales de startup son país, ciudad, industria, etapa, tamaño, modalidad y `contratando`.
- **DISC-004:** los filtros iniciales de oportunidad son tipo, área, nivel, modalidad, país aceptado, dedicación, condición económica y fecha.
- **DISC-005:** cada resultado muestra solo información suficiente para decidir si abrirlo.
- **DISC-006:** cada oportunidad muestra fuente, fecha de publicación si existe, última verificación y estado.
- **DISC-007:** páginas públicas tienen URL estable, canonical, metadata y vista compartible.
- **DISC-008:** una oportunidad cerrada conserva una página explicativa, se retira de resultados activos y ofrece alternativas relacionadas.

### Organizaciones

- **ORG-001:** el sistema admite startups indexadas, enviadas y reclamadas.
- **ORG-002:** un perfil puede tener varias fuentes y una fuente principal.
- **ORG-003:** solo miembros aprobados editan datos declarados por la organización.
- **ORG-004:** los datos importados y los declarados conservan procedencia separada.
- **ORG-005:** la verificación nunca se deduce únicamente de tener un logotipo o sitio web.
- **ORG-006:** los miembros pueden crear, pausar, cerrar y duplicar oportunidades propias.
- **ORG-007:** la lista pública muestra entidades clasificadas bajo los criterios canónicos y anida sus oportunidades activas; otras organizaciones conservan ficha y pueden aparecer cuando ofrecen una oportunidad válida.
- **ORG-008:** el propietario puede invitar o retirar miembros y asignar permisos; transferir la propiedad requiere reautenticación, aceptación del nuevo propietario y auditoría.
- **ORG-009:** un envío comunitario requiere contacto verificado, rate limit y moderación; solo una organización reclamada puede publicar como voz oficial.

### Oportunidades

- **OPP-001:** cada oportunidad pertenece a una organización y a uno de los tipos canónicos.
- **OPP-002:** puede tener postulación externa o nativa, nunca un estado ambiguo.
- **OPP-003:** debe declarar modalidad, ubicación o países aceptados, dedicación y condición de compensación.
- **OPP-004:** requisitos indispensables y deseables se almacenan por separado.
- **OPP-005:** las vacantes sin fecha límite utilizan estado de vigencia y verificación periódica.
- **OPP-006:** las oportunidades duplicadas se fusionan sin perder fuentes o historial.
- **OPP-007:** una modificación material después de recibir postulaciones genera aviso y auditoría.
- **OPP-008:** programas o becas declaran costo de participación y cobertura por separado de la compensación; empleo, pasantías y proyectos no pueden cobrar por postular.
- **OPP-009:** una oportunidad nativa tiene miembro responsable y compromiso de primera respuesta de hasta siete días calendario durante el piloto; incumplimientos repetidos pausan nuevas postulaciones.
- **OPP-010:** durante el piloto toda oportunidad nueva o cambio material pasa revisión antes de activarse, incluso si proviene de una organización reclamada; la confianza futura puede reducir revisión, no eliminar controles automáticos y auditoría.
- **OPP-011:** la ficha muestra el tipo de vínculo declarado por la organización y aclara cuando no fue informado; LinkUp no lo reclasifica automáticamente como conclusión jurídica.

### Talento y evidencia

- **TAL-001:** el perfil básico requiere objetivo, ubicación, modalidad, disponibilidad y al menos una habilidad o área.
- **TAL-002:** CV es opcional; las muestras de trabajo pueden ser enlaces o archivos privados.
- **TAL-003:** cada elemento de evidencia define propietario, visibilidad, tipo y verificación.
- **TAL-004:** el perfil es privado por defecto y sus secciones se comparten con consentimiento contextual.
- **TAL-005:** la persona puede descargar y eliminar sus datos conforme a la política aplicable.
- **TAL-006:** los campos sensibles no participan en ranking y no son visibles para organizaciones salvo necesidad legítima y consentimiento.
- **TAL-007:** el onboarding preserva la intención de entrada, permite omitir campos opcionales y solo exige perfil utilizable antes de recomendar o postular.

### Guardados, alertas y postulaciones

- **APP-001:** guardar es idempotente y se sincroniza entre dispositivos autenticados.
- **APP-002:** una alerta se basa en una consulta guardada y tiene frecuencia configurable.
- **APP-003:** el usuario puede registrar una postulación externa sin afirmar que LinkUp la gestionó.
- **APP-004:** una postulación nativa conserva exactamente qué versión del perfil y respuestas fueron enviadas.
- **APP-005:** estados canónicos: `borrador`, `enviada`, `vista`, `contactada`, `entrevista`, `oferta`, `seleccionada`, `no_continua`, `retirada`, `sin_respuesta`.
- **APP-006:** la organización no ve candidatos guardados o recomendados que no hayan consentido la postulación.
- **APP-007:** la persona puede retirar una postulación; el registro legal mínimo se retiene según política, no como perfil visible.
- **APP-008:** todo proceso cerrado solicita motivo estructurado y nota opcional a la organización.
- **APP-009:** las alertas del MVP se envían por correo en frecuencia `diaria` o `semanal`, elegida explícitamente; una opción inmediata solo se añade después de comprobar frescura y entregabilidad.

### Matching

- **MAT-001:** se aplican restricciones duras antes de puntuar compatibilidad.
- **MAT-002:** cada recomendación explica señales positivas, brechas y fuente de datos.
- **MAT-003:** no se utiliza género, etnia, apariencia, discapacidad, situación familiar u otro atributo protegido para ordenar.
- **MAT-004:** la edad solo se usa cuando existe requisito legal legítimo; el producto inicial de empleo es 18+.
- **MAT-005:** ninguna puntuación rechaza automáticamente una candidatura.
- **MAT-006:** la versión del modelo o regla queda registrada para evaluación.

### Resultados

- **OUT-001:** los resultados pueden ser reportados por persona, organización o aliado.
- **OUT-002:** cada resultado tiene nivel de verificación y no se presenta como confirmado sin evidencia suficiente.
- **OUT-003:** una experiencia completada puede producir evidencia solo con consentimiento de la persona.
- **OUT-004:** los reportes agregados a aliados aplican umbrales de privacidad y no revelan individuos sin autorización.

### Administración

- **ADM-001:** el equipo puede revisar colas de organizaciones, oportunidades, reclamaciones, duplicados y reportes.
- **ADM-002:** puede ver vencimientos y fallas de ingesta priorizados.
- **ADM-003:** aprobar, rechazar, desactivar, fusionar o restaurar exige motivo y crea auditoría.
- **ADM-004:** no existe eliminación dura desde la interfaz habitual para entidades con historial; se archivan.
- **ADM-005:** el acceso excepcional a archivos privados genera un evento de auditoría.
- **ADM-006:** un administrador puede suspender una organización y retirar simultáneamente su oferta activa.

## Taxonomía mínima

### Tipo de oportunidad

- `empleo`
- `pasantia`
- `apprenticeship`
- `trainee`
- `proyecto_pagado`
- `fellowship`
- `programa_profesional`
- `beca_formativa`

### Modalidad

- `remoto`
- `hibrido`
- `presencial`

### Nivel

- `sin_experiencia_formal`
- `entrada`
- `junior`
- `intermedio`
- `senior`
- `no_especificado`

Los niveles intermedio y senior pueden indexarse para que el directorio sea completo, pero no son el foco de matching del piloto.

### Condición económica

- `paid_disclosed`: confirma pago y muestra monto o rango, moneda y periodo.
- `paid_undisclosed`: confirma pago, pero la fuente no publica monto.
- `unpaid`: lo declara sin eufemismos.
- `not_disclosed`: la fuente no permite saber si existe pago.
- `not_applicable`: solo para becas o programas donde no existe trabajo remunerable.

Periodos iniciales: `hour`, `month`, `year`, `project_total` y `stipend_total`. En la interfaz se traducen. `Proyecto pagado` y toda experiencia `Gestionada por LinkUp` requieren `paid_disclosed`; una oportunidad externa puede usar `paid_undisclosed` o `not_disclosed`, pero pierde señal de claridad. Costos de programas usan un campo separado.

### Estado de oportunidad

- `borrador`
- `pendiente_revision`
- `activa`
- `pausada`
- `cerrada`
- `vencida`
- `rechazada`
- `archivada`

Transiciones permitidas:

```text
borrador -> pendiente_revision
pendiente_revision -> activa | rechazada | borrador
activa -> pausada | cerrada | vencida
pausada -> activa | cerrada | vencida
rechazada -> borrador
cerrada | vencida -> archivada
```

Reabrir una oportunidad cerrada crea una nueva versión material y vuelve a revisión cuando cambian sus condiciones. Archivar no elimina fuentes, postulaciones o auditoría.

### Estado de postulación

```text
borrador -> enviada
enviada -> vista | contactada | no_continua | retirada | sin_respuesta
vista -> contactada | entrevista | no_continua | retirada | sin_respuesta
contactada -> entrevista | oferta | no_continua | retirada | sin_respuesta
entrevista -> oferta | seleccionada | no_continua | retirada | sin_respuesta
oferta -> seleccionada | no_continua | retirada
sin_respuesta -> contactada | entrevista | oferta | no_continua | retirada
```

`seleccionada`, `no_continua` y `retirada` son terminales para el proceso; una corrección administrativa requiere motivo y auditoría. `Seleccionada` no equivale a que el empleo o experiencia haya comenzado: ese hecho se registra como resultado. En postulaciones externas los estados son reportados por la persona o confirmados por fuente; nunca se atribuyen a la organización sin evidencia.

## Estados vacíos y errores

- Sin resultados: explicar qué filtros eliminar y permitir crear alerta.
- Startup sin oportunidades: mostrar `No encontramos oportunidades vigentes` y fecha de verificación, no `Esta empresa no contrata`.
- Oportunidad vencida: explicar cierre y ofrecer relacionadas.
- Fuente inaccesible: retirar temporalmente del índice activo hasta revisar.
- Postulación fallida: conservar borrador y señalar el campo o servicio que falló.
- Organización sin candidatos: sugerir mejorar condiciones o ampliar criterios, no inventar candidatos.

## Alcance del primer lanzamiento

### Incluido

- Directorio público de startups.
- Buscador público de oportunidades.
- Páginas indexables y compartibles.
- Ingesta inicial por adaptadores y carga manual.
- Envío de startup u oportunidad con moderación.
- Autenticación.
- Perfil básico y evidencia mediante enlaces.
- Guardados y alertas por correo.
- Registro de postulación externa.
- Postulación nativa básica.
- Pipeline básico de organización.
- Seguimiento y resultado.
- Admin de curación y auditoría.
- Matches manuales presentados dentro del producto o por correo.

### Operado manualmente durante el piloto

- Reclamación de organización.
- Verificación de empresas.
- Shortlists.
- Diseño de proyectos pagados.
- Confirmación de resultados.
- Soporte y resolución de reportes.

### Fuera del MVP

- Feed, posts, comentarios, likes y conexiones.
- Mensajería completa entre usuarios.
- Videoentrevistas.
- Cursos propios.
- Generador de CV o cartas con IA.
- Aplicación móvil nativa.
- Importación masiva de contactos de LinkedIn.
- Ranking público de personas.
- ATS completo o integraciones profundas.
- Portal general de eventos.
- Pagos o contratos dentro de LinkUp.
- Acceso de menores al mercado laboral.

## Criterios de aceptación del MVP

El lanzamiento de piloto requiere evidencia de que:

- Un visitante puede encontrar una startup y una oportunidad desde móvil sin cuenta.
- Una oportunidad muestra procedencia y vigencia comprobables.
- Una persona puede registrarse, guardar, crear una alerta y completar perfil.
- Puede registrar una postulación externa y recibir seguimiento.
- Puede completar una postulación nativa y ver su estado.
- Una organización aprobada puede publicar y gestionar candidatos consentidos.
- Un curador puede moderar, fusionar y retirar contenido sin intervención de desarrollo.
- Los permisos impiden que una organización vea candidatos de otra.
- El sistema registra al menos un resultado de extremo a extremo.
- Los eventos analíticos permiten reconstruir el embudo sin almacenar texto sensible.
- Las páginas públicas cumplen revisión móvil, teclado, contraste, metadata, sitemap y rendimiento acordados.
