# Confianza, seguridad y privacidad

Versión: 1.0  
Dependencias: `01-product-definition.md`, `02-product-requirements.md`, `04-architecture-and-data.md` y `05-ingestion-search-matching.md`  
Fecha de revisión normativa: 29 de agosto de 2026

Este documento define el estándar operativo del MVP. No sustituye asesoramiento jurídico. Antes de publicar, una persona abogada en Bolivia debe revisar la clasificación laboral de cada modalidad, los contratos, la política de indexación, el tratamiento de datos, la operación como intermediario y cualquier expansión a otra jurisdicción.

## Objetivo de confianza

Una persona debe poder responder, antes de postular:

- Quién ofrece la oportunidad.
- De dónde proviene la información.
- Cuándo se comprobó por última vez.
- Qué trabajo, aprendizaje o resultado se espera.
- Si existe compensación y bajo qué condiciones.
- Qué datos verá la organización.
- Qué papel tiene LinkUp y qué no garantiza.

Una organización debe poder responder:

- Por qué puede ver a una persona.
- Para qué uso recibió sus datos.
- Qué decisiones y comunicaciones quedan registradas.
- Qué condiciones debe cumplir para conservar acceso.

## Principios

1. **Procedencia antes que apariencia.** LinkUp no hace parecer propia una oferta externa.
2. **Consentimiento contextual.** Registrarse no autoriza compartir el perfil con todas las organizaciones.
3. **Mínimo dato necesario.** Cada flujo pide únicamente lo requerido para su finalidad.
4. **Control de la persona.** Debe poder corregir, ocultar, exportar o solicitar eliminación.
5. **Decisión humana.** Un puntaje o modelo no rechaza automáticamente a una persona.
6. **Compensación inequívoca.** `Pagada con monto`, `pagada sin monto`, `no pagada`, `no informada` y `no aplica` nunca se sustituyen por lenguaje ambiguo.
7. **Seguridad sin falsa certeza.** Las insignias describen comprobaciones concretas; no prometen ausencia de riesgo.
8. **Trazabilidad.** Cambios sensibles, acceso excepcional y decisiones de moderación dejan auditoría.
9. **Corrección rápida.** Una empresa o persona afectada dispone de un canal claro para corregir o retirar contenido.
10. **Protección reforzada.** LinkUp trata información laboral y de trayectoria como información sensible en la práctica, aunque su clasificación legal pueda variar.

## Modelo de procedencia y verificación

Las siguientes etiquetas pueden coexistir. Cada una tiene una definición cerrada y una ayuda contextual accesible.

| Etiqueta | Significado exacto | Evidencia mínima | No significa |
|---|---|---|---|
| `Indexada` | LinkUp observó la información en una fuente pública permitida | URL canónica, fuente y fecha de observación | Que la empresa tenga relación con LinkUp |
| `Fuente comprobada` | El enlace oficial seguía mostrando la oportunidad en la última revisión | Respuesta válida y coincidencia de campos esenciales | Que siga abierta después de esa fecha |
| `Organización reclamada` | Una persona vinculada obtuvo control del perfil | Correo de dominio, documento o revisión manual | Que LinkUp avale todos sus actos |
| `Organización verificada` | LinkUp comprobó identidad legal u operativa y representación | Evidencia registrada y fecha de revisión | Solvencia, buen ambiente o contratación garantizada |
| `Publicada por la organización` | Un miembro autorizado creó o confirmó la oferta | Membresía activa y auditoría | Que LinkUp sea empleador o parte contractual |
| `Gestionada por LinkUp` | El equipo participa en diseño, curación o seguimiento bajo un servicio definido | Acuerdo de servicio, alcance y responsable interno | Selección o respuesta garantizadas |
| `Resultado verificado` | Dos partes o una evidencia confiable confirmaron el resultado | Método, actor verificador y fecha | Evaluación absoluta de capacidad |

No utilizar una sola insignia genérica `Verificado`. La interfaz muestra el dato específico, por ejemplo: `Fuente comprobada hace 8 h` o `Organización verificada el 12 ago`.

### Estados internos de confianza

| Estado | Visibilidad | Acción |
|---|---|---|
| `unreviewed` | No público | Validar fuente y entidad |
| `source_confirmed` | Público si pasa políticas | Mostrar procedencia y vigencia |
| `claimed` | Público | Permitir edición auditada |
| `organization_verified` | Público con etiqueta específica | Revalidación periódica |
| `linkup_managed` | Público con condiciones de servicio | Seguimiento activo |
| `under_review` | Oculto o advertido según riesgo | Congelar nuevas postulaciones si corresponde |
| `suspended` | No público | Notificar, investigar y permitir apelación |

## Verificación de organizaciones

### Requisitos mínimos para reclamar

- Cuenta personal verificada.
- Nombre y cargo.
- Correo bajo dominio de la organización, o alternativa revisada manualmente.
- Aceptación de condiciones para organizaciones.
- Declaración de autoridad para representar y publicar.
- Ausencia de conflicto con una reclamación vigente.

### Señales adicionales para verificar

- Registro legal o fiscal cuando corresponda.
- Dominio y sitio oficial coherentes.
- Identidad de una persona fundadora o responsable confirmada.
- Presencia operativa verificable.
- Condiciones y canales de contacto coherentes.
- Historial de respuestas y resultados dentro de LinkUp.

Documentos legales se guardan en un bucket privado, con acceso limitado y retención definida. El equipo no debe copiar esos documentos a herramientas de analítica o soporte general.

### Revalidación

- Al cambiar dominio, razón social, representante o país.
- Ante reporte creíble de suplantación, fraude, impago o discriminación.
- Cada 12 meses para la etiqueta `Organización verificada` durante el piloto.
- Antes de una campaña gestionada si la revisión anterior tiene más de 90 días.

## Estándar de una oportunidad

Toda oportunidad pública debe tener:

- Organización identificable.
- Título descriptivo, sin promesas engañosas.
- Tipo y modalidad.
- Ubicación o alcance remoto.
- Responsabilidades o entregables.
- Requisitos imprescindibles separados de los deseables.
- Compensación declarada como `pagada con monto/rango`, `pagada sin monto publicado`, `no pagada`, `no informada` o `no aplica`.
- Costo de participación y cobertura separados de la compensación cuando se trate de programa o beca.
- Tipo de vínculo declarado por la organización.
- Fecha límite o regla de vigencia.
- Método de postulación.
- Responsable y plazo de primera respuesta cuando la postulación es nativa.
- Fuente y última comprobación.
- Canal de reporte.

No se publica como activa una oportunidad cuyo dato central solo aparece en una fuente secundaria y no puede confirmarse.

### Categorías contractuales visibles

| Categoría de producto | Descripción visible | Requisito adicional |
|---|---|---|
| Empleo | Puesto con relación definida por la organización | Tipo de contrato y compensación, sujetos a revisión local |
| Pasantía o trainee | Experiencia supervisada con objetivos de aprendizaje | Duración, mentor, horario, compensación y convenio si aplica |
| Proyecto pagado | Entregable acotado con pago acordado | Alcance, aceptación, responsable, monto y fecha de pago |
| Programa profesional | Cohorte o experiencia de desarrollo | Organizador, costo si existe, selección, resultado y certificado |
| Beca formativa | Apoyo para formación, no empleo | Cobertura, requisitos, institución y fecha límite |

Una experiencia voluntaria o no pagada no se etiqueta como `proyecto_pagado`, empleo o pasantía remunerada. Si más adelante se admite voluntariado, tendrá taxonomía, filtros y reglas separados; no está en el MVP.

## Política de proyectos pagados

Antes de abrir postulaciones se registra:

- Problema y entregable.
- Qué queda fuera del alcance.
- Duración y carga estimada.
- Persona responsable y frecuencia de feedback.
- Criterios observables de aceptación.
- Monto, moneda, impuestos o retenciones informados por la parte contratante.
- Hitos y fecha de pago.
- Propiedad intelectual y permiso para mostrar evidencia.
- Confidencialidad razonable.
- Proceso de cambio, cancelación y disputa.

Durante el MVP el contrato y el pago ocurren directamente entre organización y participante. LinkUp registra que las condiciones fueron aceptadas, da seguimiento y puede suspender a una organización, pero no se presenta como custodio de fondos ni parte empleadora.

Reglas:

- No pedir trabajo productivo gratuito como “prueba”. Una evaluación debe ser breve, proporcional y reutilizable o remunerada.
- No cambiar entregables o compensación sin aceptación explícita.
- No emitir `Resultado verificado` hasta que ambas partes confirmen o exista evidencia suficiente.
- Un impago abre caso prioritario y bloquea nuevas publicaciones gestionadas mientras se investiga.

## Evidencia y resultados

### Niveles de evidencia

1. `declarada`: la persona agregó un enlace o descripción.
2. `fuente_conectada`: el recurso existe en una fuente accesible.
3. `organizacion_confirmada`: una organización autorizada confirmó participación y alcance.
4. `linkup_verificada`: el equipo verificó el proceso o resultado con evidencia definida.

La interfaz nunca convierte el nivel en una nota de valor personal. Describe procedencia, no prestigio.

### Permisos de publicación

- La persona decide si cada evidencia es pública, visible solo en postulaciones o privada.
- Un resultado no revela compensación, feedback privado ni nombre de cliente sin permiso.
- Una organización puede confirmar hechos, pero no hacer público feedback que la persona configuró como privado.
- Si se revoca una evidencia, el historial de auditoría puede conservar el hecho mínimo necesario sin mantener el contenido público.

## Contenido y conductas prohibidas

- Suplantación, phishing, cobros al candidato por obtener un empleo o adelantos sospechosos.
- Vacantes inexistentes usadas para captar datos, vender cursos o construir bases de CV.
- Discriminación ilegal o criterios sensibles no justificados por una obligación legítima.
- Acoso, amenazas, explotación o solicitudes sexuales.
- Trabajo no remunerado presentado como empleo o proyecto pagado.
- Esquemas piramidales, apuestas, actividades ilegales o fraude.
- Promesas de ingresos garantizados.
- Recolección de documentos desproporcionados antes de una etapa que los justifique.
- Publicación de datos personales de terceros sin autorización.
- Scraping, exportación o reventa de perfiles.

LinkUp puede rechazar sectores o actividades adicionales durante el piloto por capacidad limitada de moderación, aun cuando no sean ilegales.

## Reportes, moderación y apelación

### Canal

Cada startup, oportunidad y postulación incluye `Reportar`. También existe un correo operativo publicado en las políticas.

Categorías iniciales:

- Información incorrecta o vencida.
- Suplantación o empresa inexistente.
- Solicitud de dinero o fraude.
- Discriminación o acoso.
- Trabajo no pagado o impago.
- Uso indebido de datos.
- Propiedad intelectual o solicitud de retiro.
- Otro riesgo de seguridad.

### Prioridad y objetivo operativo

| Severidad | Ejemplo | Acción inicial objetivo |
|---|---|---|
| Crítica | phishing activo, amenaza, exposición de datos | Contención en 4 horas hábiles |
| Alta | suplantación, impago, discriminación, acceso indebido | Revisión en 1 día hábil |
| Media | requisitos engañosos, contenido incorrecto | Revisión en 3 días hábiles |
| Baja | formato, duplicado, dato menor | Revisión en 5 días hábiles |

Son objetivos internos del piloto, no un SLA contractual.

### Flujo

```text
reporte
  -> clasificación y conflicto de interés
  -> preservación mínima de evidencia
  -> contención proporcional
  -> contacto con partes cuando sea seguro
  -> decisión con motivo y política
  -> notificación
  -> apelación por persona distinta cuando sea posible
  -> cierre y aprendizaje
```

Una denuncia no se comparte automáticamente con la parte reportada si hacerlo puede exponer a la persona denunciante. Acceso a casos de acoso, fraude o datos se limita por función.

## Equidad en selección

### Datos excluidos del matching inicial

- Etnia, religión, afiliación política o sindical.
- Orientación sexual e identidad de género.
- Salud o discapacidad, salvo ajustes solicitados voluntariamente y fuera del ranking.
- Fotografía y apariencia.
- Estado civil, embarazo o responsabilidades familiares.
- Barrio, colegio u otros proxies socioeconómicos que no sean necesarios.
- Edad exacta; solo se comprueba elegibilidad `18+` donde corresponda.

### Reglas de automatización

- El sistema puede filtrar restricciones explícitas como autorización de trabajo, modalidad o disponibilidad.
- Toda recomendación muestra las señales principales y permite corregir el perfil.
- Ningún modelo cambia una postulación a `rechazada`.
- Una organización no recibe un “puntaje de empleabilidad” opaco.
- Versiones de reglas y modelos quedan registradas en `matches` y `audit_events`.
- Se comparan tasas de exposición, postulación, avance y resultado por grupos solo cuando existe base legítima, consentimiento o anonimización suficiente.

## Personas menores de edad

El mercado laboral del MVP está limitado a personas que declaran ser mayores de 18 años. Esta decisión reduce riesgo; no afirma que toda participación laboral menor sea jurídicamente imposible.

Si se desarrolla una línea educativa para menores, será un producto separado con:

- Revisión jurídica específica de la Constitución y del Código Niña, Niño y Adolescente.
- Consentimiento y participación de madre, padre o tutor cuando corresponda.
- Perfiles no públicos y datos mínimos.
- Organizaciones y mentores con controles reforzados.
- Sin contacto directo no supervisado.
- Evaluación de seguridad, horarios, remuneración y finalidad formativa.
- Canal especializado de protección y respuesta.

No se habilita esta línea mediante un simple cambio de edad mínima.

## Privacidad por flujo

### Matriz de visibilidad

| Dato | Público | Organización a la que postula | Equipo autorizado | Proveedor técnico |
|---|---:|---:|---:|---:|
| Nombre o alias público | Según elección | Sí | Sí | Solo para prestar servicio |
| Bio y habilidades públicas | Según elección | Sí | Sí | Solo para prestar servicio |
| Evidencia | Según ajuste individual | Sí, si se adjunta | Sí con necesidad | Almacenamiento/procesamiento necesario |
| Correo y teléfono | No | Solo con consentimiento y etapa definida | Soporte limitado | Auth/correo según función |
| Respuestas de postulación | No | Solo organización destinataria | Soporte auditado | Infraestructura necesaria |
| Feedback de selección | No | Organización autora y persona | Soporte auditado | Infraestructura necesaria |
| Documentos de verificación | No | No | Personal expresamente autorizado | Almacenamiento privado |
| Historial de navegación | No | No a nivel individual | Analítica limitada | Analítica con configuración de privacidad |

### Momentos de consentimiento

- Crear cuenta: términos, privacidad y edad mínima.
- Activar analítica no esencial: elección separada cuando corresponda.
- Crear alerta: finalidad y frecuencia.
- Postular nativamente: vista previa exacta de los datos enviados a esa organización.
- Entrar a un talent pool: aceptación separada, duración y tipos de organizaciones.
- Hacer pública una evidencia: control por elemento.
- Recibir comunicaciones comerciales: opt-in independiente de correos transaccionales.

Casillas opcionales no vienen marcadas. La versión de la política y el momento se registran en `consents`.

### Perfil público y perfil de postulación

El perfil público es opcional y mínimo. El perfil de postulación es una instantánea específica para una oportunidad. Cambiar el perfil después no reescribe silenciosamente la postulación enviada; la persona puede enviar una actualización visible y auditada.

## Ciclo de vida y retención propuesta

Los siguientes son valores iniciales a validar jurídicamente antes de producción:

| Categoría | Retención operativa propuesta | Fin del periodo |
|---|---|---|
| Cuenta activa y perfil | Mientras exista la cuenta | Exportar y eliminar o anonimizar al cerrar |
| Cuenta sin actividad | Aviso a los 24 meses | Eliminar o anonimizar 90 días después si no responde |
| Borrador de postulación | 90 días | Eliminación automática |
| Envío comunitario y contacto | 90 días después de resolver | Eliminar contacto; conservar procedencia pública y decisión mínima |
| Postulación nativa | Hasta 24 meses después del cierre | Eliminar contenido o anonimizar métricas; excepciones legales documentadas |
| Talent pool consentido | 6 meses, renovable | Retirar acceso al expirar |
| Documento de verificación | Hasta completar revisión + 90 días | Eliminar; conservar solo resultado y metadatos mínimos |
| Reporte de confianza | 24 meses desde cierre | Minimizar o anonimizar según riesgo y obligación |
| Logs de seguridad | 90 días | Rotación, salvo incidente abierto |
| Analítica pseudonimizada | 13 meses | Agregar o eliminar identificadores |
| Auditoría crítica | 24 meses | Revisar obligación antes de eliminación |

Una solicitud válida de eliminación prevalece cuando no exista obligación o interés legítimo documentado para conservar una porción mínima. No se promete eliminación de copias de seguridad instantánea: se define un ciclo de expiración y se impide su restauración al entorno activo salvo recuperación autorizada.

## Derechos y controles de la persona

Desde el producto o mediante soporte:

- Acceder a sus datos.
- Corregirlos.
- Descargar una exportación legible.
- Cambiar visibilidad.
- Retirar consentimiento opcional.
- Salir de pools y comunicaciones.
- Solicitar eliminación.
- Objetar o pedir revisión de una recomendación automatizada.
- Conocer organizaciones que recibieron una postulación nativa.
- Reportar uso indebido.

Objetivo interno: acusar recibo en 3 días hábiles y resolver en 15 días hábiles, salvo complejidad u obligación distinta. La identidad se verifica de forma proporcional antes de entregar o borrar datos.

## Controles de seguridad

### Identidad y acceso

- Autenticación gestionada y MFA obligatorio para administradores; recomendado para organizaciones.
- RLS como barrera primaria, además de controles de aplicación.
- Roles mínimos, sin cuentas compartidas.
- Acceso temporal y auditado para soporte.
- Revocación inmediata al retirar un miembro.
- Revisión trimestral de cuentas privilegiadas durante el piloto.

### Aplicación y datos

- TLS en tránsito y cifrado administrado en reposo.
- URLs firmadas y buckets privados para documentos.
- Validación estricta de tipo, tamaño y extensión; escaneo antimalware antes de entregar archivos.
- Secretos fuera del repositorio y rotación tras exposición.
- Protección CSRF donde aplique, cabeceras de seguridad, rate limits y defensa contra abuso.
- Backups con restauración ensayada.
- Datos ficticios en desarrollo y preview.
- Redacción de PII en errores, logs y sesiones de soporte.
- Dependencias revisadas y actualizadas con prioridad por riesgo.

### Exportaciones

- Deshabilitadas por defecto.
- Alcance limitado a candidatos de una oportunidad propia y finalidad declarada.
- Marca de agua o identificador de exportación cuando sea viable.
- Registro de actor, campos, cantidad, razón y momento.
- Prohibición contractual de reventa, enriquecimiento o incorporación a pools permanentes sin consentimiento.

## Respuesta a incidentes

1. Detectar y abrir incidente con responsable.
2. Contener acceso, token, fuente o funcionalidad afectada.
3. Preservar evidencia mínima sin ampliar exposición.
4. Evaluar datos, personas, jurisdicciones y riesgo.
5. Corregir y validar la corrección.
6. Notificar a personas y autoridades cuando corresponda según asesoría jurídica.
7. Restaurar gradualmente.
8. Documentar causa, impacto, acciones y prevención.

El equipo mantiene un canal fuera de la infraestructura principal, inventario de responsables y simulacro antes del piloto público.

## Proveedores y transferencias

Antes de usar Supabase, Vercel, Resend, PostHog, Sentry u otro proveedor se documenta:

- Finalidad y categorías de datos.
- Región de tratamiento y subencargados.
- Condiciones de tratamiento y seguridad.
- Retención y eliminación.
- Mecanismo de transferencia internacional aplicable.
- Configuración para minimizar datos.
- Procedimiento de salida y exportación.

No se envían CV, respuestas o documentos completos a un modelo de IA por defecto. Si una función requiere procesarlos, debe tener una finalidad visible, minimización, proveedor aprobado, retención conocida y opción humana.

## Indexación, atribución y retiro

- Registrar condiciones de uso y `robots.txt` por fuente antes de automatizar.
- Preferir APIs, feeds, acuerdos o envíos directos.
- Reproducir hechos mínimos y resumen propio; enlazar a la publicación oficial.
- No republicar fotografías, textos extensos ni marcas de forma que sugiera patrocinio.
- Ofrecer corrección, reclamación y retiro.
- Respetar bajas de fuente y evitar reingesta accidental mediante lista de supresión.
- Mantener procedencia a nivel de campo cuando múltiples fuentes difieren.

La disponibilidad pública de una página no equivale automáticamente a autorización comercial para extraerla. Cada fuente necesita revisión documentada.

## Base normativa revisada

La revisión preliminar encontró:

- La [Constitución Política del Estado](https://www.gacetaoficialdebolivia.gob.bo/app/webroot/archivos/constitucion.pdf) reconoce privacidad en el artículo 21.2 y la Acción de Protección de Privacidad en los artículos 130 y 131. Los artículos 59 a 61 establecen protección reforzada para niñas, niños y adolescentes.
- El Decreto Supremo 1793 contiene previsiones sobre tratamiento de datos, información previa, consentimiento, finalidad, derechos y medidas de seguridad; debe verificarse su aplicación exacta al servicio con asesoría local en la [Gaceta Oficial](https://www.gacetaoficialdebolivia.gob.bo/).
- A la fecha de corte, la Cámara de Diputados lista el PL 538/2025-2026, `Protección de Datos Personales`, como [proyecto de ley en tratamiento](https://diputados.gob.bo/proyectos-de-ley-en-tratamiento/). No debe documentarse como ley promulgada.
- La Ley 548 regula la protección integral de niñas, niños y adolescentes; el [Órgano Judicial publica una copia consultable](https://obs.organojudicial.gob.bo/wp-content/anexos/archivos/normativa/a26c3bcb4a82bb341f887ee779cc625b.pdf). Su interacción con trabajo, educación y plataformas requiere análisis específico antes de admitir menores.
- La normativa laboral y de pasantías debe confirmarse con el [Ministerio de Trabajo, Empleo y Previsión Social](https://mintrabajo.gob.bo/) y asesoría jurídica para cada formato contractual.

Correcciones frente al material histórico:

- El artículo 71 constitucional se refiere a derechos de personas con discapacidad; no es la base general del derecho a la educación.
- No se adopta la Resolución Ministerial 140/2021 como fundamento hasta localizar y validar su texto oficial y alcance.
- No se infiere que llamar `pasantía`, `proyecto` o `voluntariado` a una relación determine su naturaleza jurídica. Importan las condiciones reales.

## Documentos obligatorios antes del piloto

- Términos para talento.
- Términos para organizaciones y política de uso de candidatos.
- Política de privacidad y aviso por flujo.
- Política de cookies/analítica, si aplica.
- Política de fuentes, atribución y retiro.
- Estándar de oportunidades y contenido prohibido.
- Acuerdo para campañas o proyectos gestionados.
- Plantilla de alcance de proyecto pagado.
- Política de reportes, moderación y apelación.
- Acuerdos y registros de proveedores de datos.
- Plan de respuesta a incidentes.
- Matriz de retención aprobada.

## Puerta de lanzamiento

No se abre el piloto público hasta demostrar:

- Pruebas negativas de RLS entre dos organizaciones y dos candidatos.
- Consentimiento explícito y vista previa de una postulación.
- Exportación y eliminación ensayadas.
- Reporte crítico que retira una oportunidad y conserva auditoría.
- Reclamación y suspensión de organización.
- Fuente con atribución, actualización, cierre y lista de supresión.
- Archivo privado inaccesible mediante URL vencida.
- Cuenta administrativa con MFA y acceso registrado.
- Políticas visibles y contacto operativo.
- Revisión jurídica de Bolivia documentada.

## Métricas de confianza

- Porcentaje de oportunidades con fuente y fecha comprobables.
- Porcentaje con compensación informada.
- Edad mediana de última verificación.
- Reportes por 100 oportunidades y por categoría.
- Tiempo a contención y tiempo a resolución.
- Tasa de falsos positivos en moderación.
- Impagos y disputas por proyecto completado.
- Solicitudes de privacidad dentro del objetivo.
- Accesos privilegiados y exportaciones por periodo.
- Organizaciones suspendidas o reincidentes.

Estas métricas forman parte de la salud del marketplace; no son tareas secundarias de soporte.
