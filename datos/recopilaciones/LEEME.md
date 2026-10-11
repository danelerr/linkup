# Recopilación de fuentes oficiales

`npm run recopilar` consulta páginas oficiales públicas y la API pública documentada de Ashby. Genera una carpeta fechada con `startups.json`, `vacantes.json`, `revision-pendiente.json` y `fuentes.json`. No toca SQLite por defecto.

`npm run recopilar -- --importar` hace la misma captura, respalda de forma consistente la base existente en `.data/backups/` y crea **borradores** mediante el importador del catálogo. Repetirlo omite duplicados; no sobrescribe publicaciones, ediciones o registros cerrados. Los comandos `tsx` usan variables de entorno, no `.env.local`: establece `LINKUP_DATABASE_PATH` si la app utiliza otra base.

Revisa y publica desde `/admin/catalogo`; publicar una vacante requiere que su startup también esté publicada. La fecha de comprobación indica acceso a la fuente, no una relación con la empresa ni garantía de elegibilidad. No hay despliegue, cron ni publicación automática.

## Qué conserva

- Fuentes oficiales, fecha UTC de captura, identificador externo, fecha original del aviso y hash SHA-256.
- Campos estructurados de la API y resúmenes editoriales en español; no transcripciones completas de anuncios.
- Salarios solo con moneda e intervalo explícitos. Si faltan, se indica monto no publicado.
- Notas de incertidumbre, errores y avisos que necesitan información antes de importarse.

`scripts/catalog-sources.ts` contiene la selección y las síntesis revisadas. Para ampliar la carga, añade una fuente pública permitida y sus posiciones después de comprobar condiciones y compatibilidad. No inventes modalidad, sueldo, etapa, tamaño de equipo o países admitidos para completar campos. Un cambio de título, ubicación o disponibilidad del feed detiene la carga de esa vacante; los cambios en los requisitos y en las síntesis requieren revisión humana.

Las solicitudes son secuenciales, separadas al menos 1,1 segundos por dominio, con timeout de 15 segundos y sin reintentos ni redirecciones. Se respetan las directivas robots para `LinkUpCatalogBot`; controles de acceso o errores detienen esa fuente. La API pública de Ashby se usa según su [documentación oficial](https://developers.ashbyhq.com/docs/public-job-posting-api).

## Descubrimientos que no se cargaron como vacantes

- Los anuncios de Torre de Product Engineer Interns, Data Analyst Intern y Remote Junior Recruiter muestran cierre en la página individual, aunque sigan apareciendo en careers. No se importan como activos.
- Las vacantes de Decisions con ubicación La Paz se guardan para revisión: el anuncio no determina claramente la modalidad requerida por el catálogo.
- Bucksapp y Facia devolvieron páginas de dominio aparcado, no contenido suficiente para confirmar una startup operativa.
- Avisos restringidos a otros países o regiones no se interpretan como contratación global por llevar la palabra «remote».

La selección actual favorece puestos profesionales porque son los que se pudieron confirmar. No convierte puestos senior en oportunidades de entrada ni fabrica pasantías para aumentar el volumen.
