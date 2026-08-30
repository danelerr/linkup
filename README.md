# LinkUp

Estado: MVP alfa funcional sobre la definición de producto v1.0. Los registros visibles son demostrativos; todavía no es un lanzamiento público.

LinkUp es el buscador de startups y oportunidades de Latinoamérica que ayuda al talento emergente a convertir potencial en trayectoria verificable.

El producto combina dos motores inseparables:

1. Un directorio público que agrega startups y oportunidades desde fuentes verificables.
2. Un sistema de perfiles, postulaciones, primeras experiencias y resultados que ayuda a personas con poca experiencia formal a conseguir y demostrar su siguiente oportunidad.

La página principal no es una landing de marketing. Es directamente una herramienta minimalista de búsqueda y exploración.

## Documentación canónica

- [Definición del producto](docs/01-product-definition.md)
- [Requisitos, flujos y alcance](docs/02-product-requirements.md)
- [Marca y sistema de interfaz](docs/03-brand-and-interface.md)
- [Arquitectura y modelo de datos](docs/04-architecture-and-data.md)
- [Ingesta, búsqueda y matching](docs/05-ingestion-search-matching.md)
- [Confianza, seguridad y privacidad](docs/06-trust-safety-privacy.md)
- [Negocio, salida al mercado y métricas](docs/07-business-gtm-metrics.md)
- [Roadmap y plan de ejecución](docs/08-roadmap.md)
- [Investigación, decisiones y asuntos abiertos](docs/09-research-decisions.md)
- [Cobertura y control de la definición](docs/10-definition-completeness.md)

## Fuentes históricas

Los siguientes archivos se conservan sin modificaciones como antecedentes. No son la especificación vigente:

- `Modelo Informe de proyecto (1).pdf`: propuesta presentada en Horizontes Libres.
- `Proyecto - LinkUp.docx`: propuesta presentada en Dux Academy.
- `text1.md`: especificaciones iniciales de un portal general de oportunidades y eventos.
- `texto2.md`: lista inicial de productos de referencia.

Si una fuente histórica contradice esta documentación, prevalece esta documentación. Si dos documentos canónicos se contradicen, prevalece, en este orden:

1. Una decisión registrada como aceptada en `docs/09-research-decisions.md`.
2. `docs/01-product-definition.md`.
3. El documento especializado correspondiente.

## Decisiones fundamentales

- LinkUp será buscador y sistema de desarrollo de trayectoria; no se elige uno u otro.
- La entrada pública será minimalista: búsqueda, dos pestañas y listado.
- Se podrá navegar y abrir una postulación externa sin cuenta; la cuenta se pedirá para guardar, crear alertas, registrar seguimiento o postular dentro de LinkUp.
- Habrá oportunidades indexadas con postulación externa y oportunidades con postulación gestionada dentro de la plataforma. Solo las que tengan intervención operativa real usarán `Gestionada por LinkUp`.
- El foco inicial de empleo será para mayores de 18 años. La experiencia para menores requiere un producto y revisión legal separados.
- El núcleo inicial son startups, vacantes, pasantías, proyectos pagados y programas que produzcan evidencia profesional.
- No habrá feed social, conexiones, likes, cursos propios ni aplicación móvil en el MVP.
- La IA enriquecerá datos y explicaciones; no rechazará candidatos ni será el diferenciador central.
- El stack productivo recomendado sigue siendo Next.js, TypeScript, Supabase/PostgreSQL y trabajos asíncronos con Trigger.dev. Esta alfa desplegable usa el runtime compatible Vinext y Cloudflare D1/SIWC; la adaptación está registrada como D-023.
- La marca conservará el símbolo y la familia azul-turquesa-menta, pero utilizará una interfaz blanca, sobria y de alta precisión.

## Resultado que debe producir el MVP

El MVP no se considera exitoso por cantidad de páginas, perfiles o visitas. Debe demostrar el circuito completo:

```text
oportunidad vigente
    -> candidato compatible
    -> postulación
    -> respuesta de la organización
    -> entrevista o experiencia
    -> resultado verificado
    -> perfil más valioso para la siguiente oportunidad
```

La métrica norte propuesta es la cantidad mensual de pares persona–oportunidad que alcanzan un nuevo resultado verificado: entrevista, selección/oferta, empleo o experiencia iniciada, proyecto pagado completado o programa completado con evidencia. Cada par cuenta una vez por mes con su hito más alto y el total siempre se desglosa.

## Ejecutar la alfa

Requisitos: Node.js 22.13 o posterior.

```bash
npm ci
npm run dev
```

Comprobaciones:

```bash
npm run lint
npx tsc --noEmit
npm test
```

El proyecto crea las tablas D1 de la alfa de forma idempotente y conserva migraciones Drizzle en `drizzle/`. Las rutas privadas usan la identidad proporcionada por el entorno de hosting; explorar, buscar y abrir fichas no exige cuenta.

## Antes de publicar

Deben cerrarse cuatro asuntos empresariales que la documentación técnica no puede resolver:

- Acuerdo de cofundadores, vesting, propiedad intelectual y autoridad de decisión.
- Disponibilidad legal y comercial del nombre LinkUp, marca, dominio y cuentas.
- Acceso al archivo vectorial original del logotipo y confirmación de sus colores oficiales.
- Compromisos reales de startups y aliados para el piloto.

Estos asuntos no bloquearon la alfa o la investigación, pero sí un lanzamiento público con inversión significativa.
