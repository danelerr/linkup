# Producto

Reúne lo vigente de la definición de producto, los requisitos del MVP y el modelo de negocio de agosto de 2026. Las versiones largas siguen en el historial de git (`git show 49afd4c:docs/01-product-definition.md`).

## Qué es

LinkUp reúne startups y sus oportunidades en una sola búsqueda y ayuda a quien tiene poca experiencia formal a conseguir la primera y demostrarla.

Son dos partes que deben funcionar juntas:

1. **Directorio:** startups y oportunidades vigentes, con fuente y fecha de revisión visibles.
2. **Trayectoria:** perfil, postulación, respuesta y resultado verificado que sirve para la siguiente oportunidad.

El directorio trae visitas. Lo que diferencia a LinkUp es capturar el resultado; sin eso es un agregador de enlaces más.

`/` abre el directorio. No hay landing.

## Para quién

- **Talento:** personas de 18 a 28 años que buscan su primera o segunda experiencia relevante, con proyectos, estudios o voluntariados para mostrar en lugar de años de experiencia. 28 no es un límite para navegar; 18 sí lo es para el flujo laboral.
- **Startups:** equipos sin área de recruiting que pueden definir un rol, pasantía o proyecto con responsable y condiciones, y que se comprometen a responder.
- **Aliados:** universidades, aceleradoras, comunidades y programas que quieren llevar a sus participantes a oportunidades y conocer el resultado.

La operación empieza en Bolivia, con oportunidades locales y remotas abiertas a Latinoamérica. La marca y la interfaz no llevan etiqueta geográfica.

## Qué se publica

**Startup:** organización activa con producto o modelo repetible, identidad pública comprobable y una señal de operación reciente (producto accesible, sitio actualizado, equipo identificable, clientes o contratación). No necesita inversión ni aceleradora. Agencias, consultoras, ONG o universidades pueden publicar oportunidades, pero no se listan como startups.

**Oportunidad:** empleo de entrada, pasantía, trainee, proyecto pagado y acotado, fellowship o programa que produzca evidencia profesional. Los eventos y el voluntariado no entran en el MVP.

Cada oportunidad muestra fuente, fecha de revisión, modalidad, dedicación y compensación. Si no hay monto, se dice (`monto no informado`); nunca se deja el espacio vacío.

## Postulación

- **Externa:** LinkUp lleva a la fuente oficial y la persona puede registrar cómo avanza.
- **Nativa:** la persona envía perfil y respuestas dentro de LinkUp y la startup actualiza el estado.

La interfaz siempre distingue ambos modos. `Gestionada por LinkUp` solo aparece cuando el equipo participa de verdad bajo un acuerdo.

## Métrica norte

**Pares persona–oportunidad que alcanzan un resultado verificado en el mes**, siempre desglosados en: entrevista; selección u oferta; empleo, pasantía o trainee iniciado; proyecto pagado completado; programa completado con evidencia.

Cada par cuenta una vez por mes, con su hito más alto. Visitas, perfiles y clics son embudo, no resultado.

## Estado frente a esta definición

Funciona en la alfa: directorio con búsqueda y filtros, fichas, cuentas, guardados, alertas dentro de la app, perfil, postulación externa y nativa, panel de candidatos para la startup, roles, curaduría, importación y exportación o borrado de cuenta.

Falta para probar la tesis:

- **Evidencia:** el perfil solo admite un enlace (`portfolioUrl`). No hay experiencias ni piezas de evidencia.
- **Resultado verificado:** no está modelado. En postulaciones externas el estado lo declara la persona sin confirmación, así que la métrica norte todavía no se puede calcular.
- **Correo:** ingreso con código y confirmación de cuentas funcionan con Resend (D-027), pero sin dominio verificado solo llegan al correo del dueño de la cuenta de Resend. Faltan avisos por correo de cambios de estado y alertas.
- **Embudo:** no se registran eventos de búsqueda, apertura ni postulación.
- **Oferta:** el catálogo curado tiene 14 startups y 2 vacantes, ninguna de entrada.

## Alcance del MVP

**Incluido:** directorio y búsqueda públicos; páginas indexables; carga manual, CSV y recopilación revisada; propuestas moderadas; cuentas; perfil con evidencia por enlaces; guardados y alertas; seguimiento externo; postulación nativa; panel de la startup; curaduría con auditoría.

**Operado a mano durante el piloto:** reclamación y verificación de startups, shortlists, diseño de proyectos pagados, confirmación de resultados y soporte.

**Fuera:** feed, likes y conexiones; mensajería; videoentrevistas; cursos; CV o cartas con IA; app móvil; ranking público de personas; ATS completo; eventos; pagos o contratos dentro de LinkUp; menores en el flujo laboral.

## Reglas que no se negocian

- Buscar y abrir una oportunidad no exige cuenta. Guardar, alertar, registrar seguimiento, postular dentro de LinkUp o proponer información sí.
- La fuente de una oferta nunca se oculta.
- La persona no paga por postular.
- La IA puede extraer, normalizar y explicar; no rechaza candidatos ni publica sin revisión.
- Una startup solo ve postulaciones propias y consentidas.
- El éxito se mide por resultados, no por inventario ni visitas.

## Negocio

El talento usa LinkUp gratis. Paga quien obtiene valor al contratar, operar un programa o medir resultados.

| Oferta | Unidad | Rango a explorar |
|---|---|---:|
| Publicación básica | Por oportunidad | Gratis |
| Campaña o shortlist gestionada | Por rol | USD 250–750 |
| Espacio de selección (más miembros, etapas, plantillas) | Por startup al mes | USD 39–199 |
| Diseño y operación de proyecto pagado | Por proyecto, sin la paga del talento | USD 500–2.000 |
| Cohorte institucional | Por cohorte | USD 1.000–5.000 |

Son hipótesis para entrevistas, no precios públicos. Se revisan tras 15 conversaciones con compradores y 3 cobros reales.

No se monetiza: cobro a candidatos, venta de datos o CV, publicidad conductual, ranking pagado oculto ni comisión sobre el sueldo del talento sin revisión legal.

## Piloto

**Pregunta:** ¿puede LinkUp producir resultados verificables para talento emergente y ahorrarle trabajo a una startup al encontrarlo?

**Preparación:** 10–15 startups comprometidas (no solo interesadas), 75–100 personas invitadas, 20–30 oportunidades vigentes con 3–5 primeras experiencias diseñadas. Seis semanas de operación, sin contar la construcción.

| Señal | Para continuar |
|---|---:|
| Oportunidades vigentes al revisarlas | ≥ 90 % |
| Invitados con perfil utilizable | ≥ 60 % |
| Activados que guardan, postulan o responden | ≥ 50 % |
| Postulaciones nativas con respuesta en 7 días | ≥ 60 % |
| Entrevistas o conversaciones de selección | ≥ 10 |
| Contrataciones o proyectos pagados completados | ≥ 3 |
| Startups que repetirían | ≥ 40 % de las que recibieron candidatos |
| Compradores que pagan o firman piloto pagado | ≥ 3 |

Pausar o cambiar si las startups publican pero no responden, si las oportunidades ya están en un canal mejor, si los resultados dependen solo de relaciones personales o si nadie paga tras recibir valor.

## Competencia

| Producto | Fortaleza | Lo que LinkUp intenta distinto |
|---|---|---|
| [Startups Argentina](https://www.startupsargentina.com/) | Directorio local simple | Cerrar el ciclo hasta el resultado |
| [Work at a Startup (YC)](https://www.ycombinator.com/jobs) | Oferta concentrada, perfil único | Red abierta y primeras experiencias |
| LinkedIn | Identidad y red global | Ayudar a construir la primera trayectoria, no solo mostrarla |
| Portales de empleo | Volumen y hábito | Startups, vigencia y evidencia |
| Grupos y hojas compartidas | Confianza local | Datos que no vencen ni se pierden |
