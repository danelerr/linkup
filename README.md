# LinkUp

Estado: alfa local con catálogo editable, autenticación propia y pruebas de integración. No es un lanzamiento público. El catálogo comienza vacío; los ejemplos son una opción explícita de desarrollo.

LinkUp reúne startups y sus oportunidades en una sola búsqueda y ayuda a quien tiene poca experiencia formal a conseguir la primera y demostrarla. `/` abre directamente el directorio.

Hecho con Next.js, React, TypeScript, Tailwind CSS, Better Auth y SQLite con Drizzle (D-024).

## Documentación

- [Producto](docs/producto.md): qué es, para quién, alcance del MVP, métrica norte, negocio y piloto.
- [Marca e interfaz](docs/marca.md): logotipo, paleta, tipografía, layout, voz y contraste.
- [Confianza y privacidad](docs/confianza-y-privacidad.md): qué significa cada etiqueta, qué protege la alfa y qué falta antes del piloto.
- [Decisiones y asuntos abiertos](docs/decisiones.md): registro D-001 a D-026 y O-001 a O-015. Prevalece si otro documento lo contradice.
- [Infraestructura y costos](docs/infraestructura-y-costos.md): opciones de alojamiento, base de datos y correo.

## Ejecutar la alfa

Requisitos: Node.js 22.13 o posterior.

```bash
npm ci
npm run dev
```

Next.js envía telemetría anónima de uso. Para desactivarla en tu equipo, una sola vez: `npx next telemetry disable`.

Comprobaciones:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run test:integration
```

Abre `http://localhost:3000`. Las variables opcionales están en `.env.example`; para Next.js pueden guardarse en `.env.local`. Si cambias el puerto o el dominio, ajusta `BETTER_AUTH_URL` al origen exacto. Los comandos `tsx` de administración leen variables del entorno, no `.env.local`: usa el mismo `LINKUP_DATABASE_PATH` cuando trabajes con una base distinta.

La aplicación crea `.data/linkup.sqlite` y aplica las migraciones de `drizzle/`. Better Auth crea sus tablas al primer uso. Las contraseñas se procesan con Better Auth; no se guardan en texto plano. El secreto local se genera en `.data/auth-secret` con permisos privados. No subas `.data`, secretos ni copias de datos a git.

Para probar las fichas ficticias sin mezclarlas con datos reales, usa una base aparte en `.env.local` y reinicia `npm run dev`:

```bash
LINKUP_DATABASE_PATH=.data/demo.sqlite
LINKUP_SEED_DEMO=true
```

Las fechas originales se conservan: una oportunidad demostrativa vencida no aparece como activa. Desactivar el seed no borra registros ya insertados; usa una base separada.

### Operar el catálogo

1. Crea una cuenta en `/ingresar`.
2. Concede administración localmente a esa cuenta: `npm run admin -- --email tu@correo.com`. No hay autoasignación por email ni contraseña de administrador predefinida.

   Si alguien olvida su contraseña, con correo configurado la restablece con un código desde «¿Olvidaste tu contraseña?». Sin correo: `npm run password -- --email persona@correo.com` genera una contraseña temporal, cierra sus sesiones y deja registro. Compártela por un canal privado; la persona la cambia en Mi LinkUp → Perfil.
3. Abre `/admin/catalogo`: agrega startups y oportunidades, edita condiciones, guarda borradores o cierra registros.
4. Los envíos de `/agregar` (requieren cuenta; hasta 5 por día y cuenta) y las importaciones CSV/JSON de `/admin/importar` llegan a `/admin`. Se publican desde el editor, después de revisar la fuente. Aprobar y publicar son una sola transacción.
5. Una corrección se aplica al registro existente. Reclamar una startup requiere cuenta y aprobación explícita de una persona administradora; tener un correo no acredita representación.
6. Roles: la primera administración se concede por terminal (paso 2). Después, en `/admin/personas` una persona administradora nombra curaduría (revisa envíos y edita el catálogo) u otra administración; nadie cambia su propio rol. Cada startup gestiona su equipo en `/organizacion/<startup>/equipo`: su responsable suma cuentas existentes como responsable, selección de personas (ve y actualiza candidatos) o solo lectura, y siempre queda al menos una persona responsable.

Si eres la última persona responsable de una startup, asigna otra cuenta activa como Responsable en su equipo antes de eliminar tu cuenta. El cierre se bloquea sin borrar tus datos mientras alguna startup quede sin responsable; no se conceden permisos automáticamente a otros miembros.

Para cargar datos reales, `/admin/importar` → **Fichas completas** ofrece plantillas CSV de startups y de vacantes (títulos de columna en español, sin importar tildes ni mayúsculas; fechas `25/09/2026` o `2026-09-25`; separador `,` o `;`). Sube primero la hoja de startups y después la de vacantes: cada vacante se une a su startup por nombre. Todo se crea como borrador con errores explicados por fila, y se publica desde el editor tras revisar la fuente.

Las mismas plantillas se cargan desde la terminal, sin límite de filas: `npm run importar -- datos/catalogo/startups.csv datos/catalogo/vacantes.csv`. Crea borradores atribuidos a `system`, pone primero las startups y no duplica si se repite. `datos/catalogo/` contiene el catálogo inicial curado (startups bolivianas y vacantes remotas que aceptan Bolivia, con fuentes y notas de revisión en la columna `notas`, que el importador ignora).

Para recopilar fuentes oficiales: `npm run recopilar` genera JSON con fichas, fuentes, hashes y avisos pendientes sin tocar la base. `npm run recopilar -- --importar` además respalda SQLite y crea borradores, sin sobrescribir ni publicar registros. Usa una selección editorial de páginas oficiales y la API pública de Ashby; no es un crawler general ni una actualización automática de avisos existentes. Véase [recopilación y límites](datos/recopilaciones/LEEME.md).

La lista de propuestas admite hasta 100 filas / 1 MB. Columnas: `kind` (startup u opportunity), `organizationName`, `sourceUrl`; las oportunidades también necesitan `opportunityTitle`. Opcionales: `websiteUrl`, `notes`, `contactEmail`. Hay vista previa y resultados por fila. La interfaz no visita los enlaces de propuestas y no hay publicación automática. Los slugs, sitios y fuentes canónicas previenen duplicados; una edición desactualizada se rechaza para no pisar cambios ajenos.

### Alcance que funciona y límites

- Directorio único con búsqueda en títulos, descripciones, requisitos y responsabilidades; filtros en URL y paginación SQL de 12 startups. Se envía al navegador solo la página actual y hasta 3 oportunidades por startup.
- Las oportunidades similares requieren la misma área y nivel de experiencia, y priorizan tipo y modalidad coincidentes. No se recomiendan roles de otra área solo por ser empleos; si no hay afinidad suficiente, no se muestra esa sección.
- Guardados, perfil, postulaciones nativas con consentimiento y copia del perfil, seguimiento externo, roles de organización, revisión de candidatos, exportación y eliminación de cuenta/sesiones.
- Alertas con todos los filtros, máximo 20 por cuenta, sin duplicados. Las coincidencias nuevas se generan al entrar en Alertas según la frecuencia. `npm run alerts` permite ejecutarlo en un programador local, en lotes de hasta 200 búsquedas vencidas por ejecución. No se ha programado ni conectado ningún servicio.
- **Correo con Resend** (D-027): con `RESEND_API_KEY` en `.env.local`, se ingresa con contraseña o con un código de 6 dígitos que llega por correo, y toda cuenta confirma su correo con un código antes de su primera sesión. Una cuenta creada con código no tiene contraseña; puede crear una en Mi LinkUp → Perfil con otro código. Restablecer la contraseña con un código cierra todas las sesiones abiertas. Sin la clave no se envía nada y solo hay contraseña, como antes.
- **Resend sin dominio verificado** solo entrega desde `onboarding@resend.dev` y solo al correo dueño de la cuenta de Resend. Para que cualquiera reciba códigos hay que verificar un dominio en Resend (O-012) y definir `LINKUP_EMAIL_FROM`. Si Resend rechaza un correo, la terminal del servidor muestra el motivo.
- Todavía no se envían por correo los cambios de estado de una postulación ni las alertas; siguen dentro de la app. Las reclamaciones de startups siguen requiriendo comprobación humana.
- SQLite sirve para una instancia con disco persistente. No usar esta configuración en varias réplicas o en un hosting con disco efímero. Para ese escenario, migrar el adaptador y las consultas a PostgreSQL, revisar autorización y ejecutar estas mismas pruebas. No se promete escalabilidad ilimitada.
- La búsqueda usa campos normalizados y filtros indexados, no IA ni ranking semántico. A gran volumen, evaluar FTS5/PostgreSQL y medir latencia. El catálogo y los campos públicos no se recopilan ni verifican solos.
- El override de `esbuild` actualiza una dependencia transitiva antigua de la herramienta de migraciones. Se comprueba con `npm run db:generate`, además del build y tests.

Para una ejecución local de producción: `npm run build` y `npm run start`. No hay comandos ni configuración de despliegue automático.

Las pruebas usan bases temporales aisladas; nunca la base del proyecto. Antes de un cambio de esquema en una base real, realiza una copia consistente con la API de backup de SQLite y comprueba su restauración. No copies solo el `.sqlite` mientras haya escrituras WAL activas.

## Antes de publicar

Deben cerrarse cuatro asuntos empresariales que la documentación técnica no puede resolver:

- Acuerdo de cofundadores, vesting, propiedad intelectual y autoridad de decisión.
- Disponibilidad legal y comercial del nombre LinkUp, marca, dominio y cuentas.
- Archivo vectorial original del logotipo; el símbolo actual es un redibujo fiel del tablero de marca.
- Compromisos reales de startups y aliados para el piloto.

Estos asuntos no bloquearon la alfa o la investigación, pero sí un lanzamiento público con inversión significativa.
