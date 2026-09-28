# Catálogo inicial

Datos públicos comprobados el 28 de septiembre de 2026, en el formato de las plantillas de `/admin/importar`.

- `startups.csv`: 12 startups bolivianas y 2 extranjeras (Worldly y PermitFlow) con puestos remotos que aceptan Bolivia.
- `vacantes.csv`: 2 vacantes tomadas de los portales de empleo oficiales de Worldly y PermitFlow (Ashby).

Cargar: `npm run importar -- datos/catalogo/startups.csv datos/catalogo/vacantes.csv`. Todo entra como borrador; se revisa y publica en `/admin/catalogo`.

## Antes de publicar

- La columna `notas` indica de dónde sale cada dato que no está en el sitio oficial y qué falta confirmar. El importador la ignora.
- La fuente de cada startup es su sitio oficial; ciudad, premios y rondas vienen de prensa citada en `notas`.

## Revisadas y no cargadas

| Startup | Motivo |
|---|---|
| UltraCasas | El sitio respondió con error 503 |
| Iconekta | El sitio no respondió |
| Koban | El dominio `koban.com.bo` no existe |
| Luka | No se encontró sitio oficial |
| Yamprs | No se encontró sitio oficial |
| Minkedu, Unicodemy | El sitio no permite confirmar qué hacen hoy |
| Jala University | Bootcamps sin convocatoria abierta ("Coming soon") |
| Vacantes de tuGerente | Siguen en su portal (Freshteam), pero se crearon entre enero y agosto de 2021; se retiraron por antiguas |

También se descartaron agencias de reclutamiento que repiten el mismo aviso por ciudad (Bluelight, Talentus) y avisos "LATAM" que no incluyen Bolivia en su lista de países (Anyone AI).
