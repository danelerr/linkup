# Alternativas de infraestructura y costos

Versión: 2 · Precios verificados el 25 de septiembre de 2026 (fuentes al final). Los planes gratuitos cambian con frecuencia: vuelve a comprobarlos antes de decidir.
Estado: comparación para decidir. Según D-024, no se despliega ni se conecta ningún servicio externo sin instrucción expresa.

Este documento compara cómo llevar LinkUp de la alfa local a internet: dónde alojar la aplicación, qué base de datos usar, cómo enviar correos y alertas, y cómo guardar CV si algún día se admiten archivos.

## 1. La decisión de fondo

| | A. SQLite en un servidor con disco persistente | B. Supabase (PostgreSQL), según D-014 |
|---|---|---|
| Cambios de código | Ninguno en la capa de datos | Migración completa de la capa de datos (sección 3) |
| Tiempo hasta publicar | Días | 3 a 5 días de migración, más el despliegue |
| Costo de la base | Incluido en el servidor | $0 con el plan gratuito (500 MB) |
| Costo de alojar la app | Un servidor pequeño: pocos dólares al mes | Un hosting para Next.js; en Vercel, el uso comercial exige plan pago |
| Varias instancias | No (SQLite es una sola instancia) | Sí |
| Riesgos | Respaldos a cargo del equipo | El plan gratuito se pausa tras una semana sin actividad |

Mientras no haya datos reales, migrar es más barato ahora que después: después también habría que mover datos de personas sin perderlos. Si el destino es Supabase, conviene migrar antes de abrir el piloto. A solo gana si hay que publicar de inmediato.

## 2. Base de datos

La alfa usa SQLite con `better-sqlite3` y Drizzle. En hostings sin servidor (Vercel, Netlify) el sistema de archivos no persiste, así que SQLite solo sirve en un servidor con disco propio.

| Opción | Plan gratuito | Observaciones |
|---|---|---|
| **Supabase** (PostgreSQL) | 500 MB de base, 1 GB de archivos, 50.000 usuarios activos al mes de Supabase Auth (LinkUp usa Better Auth, no aplica) | Coincide con D-014. Un proyecto gratuito se pausa tras 1 semana sin actividad; una petición no lo reactiva: se restaura a mano desde el panel, dentro de 90 días |
| **Neon** (PostgreSQL) | 0,5 GB por proyecto | Misma migración que Supabase; sin almacenamiento de archivos equivalente |
| **Turso** (libSQL) | 5 GB y 100 bases | Es compatible con el SQL de SQLite, pero su cliente es asíncrono: exige casi la misma reescritura de código que PostgreSQL (sección 3) |
| **SQLite en servidor propio** | No hay opción gratuita confiable | Sin cambios de código. Fly.io, por ejemplo, no tiene plan gratuito, exige tarjeta y cobra los volúmenes a $0,15 por GB al mes |

## 3. Esfuerzo real de migrar la capa de datos

Medido en el código del 25 de septiembre de 2026:

- **82 llamadas** desde páginas y rutas a funciones de datos síncronas que pasarían a ser asíncronas.
- **34 consultas SQL** escritas a mano.
- **6 transacciones** síncronas (moderación, publicación, estados de postulación, borrado de cuenta, alertas y datos de demostración).
- **13 funciones propias de SQLite** (`julianday`, `datetime('now')`, `json_extract`, `INSERT OR IGNORE`, `COLLATE NOCASE`).
- **7 migraciones** que se regeneran para PostgreSQL, y el esquema de Drizzle pasa de `sqlite-core` a `pg-core`.
- Better Auth recibe hoy la conexión de SQLite; necesita su adaptador de PostgreSQL.
- Las pruebas necesitan un PostgreSQL de pruebas (Docker local o un proyecto aparte).
- La portada hace unas 30 consultas por página (2 por startup): instantáneo en SQLite, lento por red. Hay que reducirlas a 2 o 3 y ubicar la app y la base en la misma región (São Paulo para Bolivia).

## 4. Dónde alojar la aplicación

- **Vercel:** el plan Hobby es solo para uso personal no comercial; LinkUp es un proyecto con fines comerciales, así que necesita el plan Pro. SQLite no funciona ahí (opción B obligatoria).
- **Servidor propio o contenedor con disco:** admite SQLite (opción A) o PostgreSQL externo (opción B). Requiere mantener el servidor y sus respaldos.

## 5. Correo

El correo es necesario para verificar cuentas, recuperar contraseñas y enviar alertas. Todos los proveedores exigen un **dominio propio** configurado (SPF y DKIM) para no caer en spam; está pendiente en O-012.

| Proveedor | Plan gratuito | Lectura para LinkUp |
|---|---|---|
| **Resend** | 3.000 correos al mes, con máximo **100 por día** | El más simple de integrar con Better Auth |
| **Brevo** | 300 correos por día, compartidos entre marketing y transaccional | Más volumen gratuito |

Orden recomendado: verificación de cuenta → recuperación de contraseña → resumen de alertas.

**Volumen de alertas:** con 1.000 personas y un resumen diario serían 1.000 correos por día, por encima de cualquier plan gratuito. Un resumen **semanal** para 1.000 personas son unos 4.300 al mes: sigue superando los 3.000 de Resend. Las alertas por correo a esa escala tienen costo; la alerta dentro de la app (actual) sigue siendo gratuita.

## 6. Programar las alertas

Hoy las coincidencias se generan al entrar a Alertas o con `npm run alerts`. Para ejecutarlo solo, un programador llama a una ruta protegida con un secreto (`CRON_SECRET`), por ejemplo cada día a las 12:00 UTC (`0 12 * * *`):

- **Cron del hosting** (Vercel Cron o el `cron` del servidor en la opción A).
- **GitHub Actions** con un flujo programado; consume minutos del plan de GitHub.
- **Servicios de ping programado** externos; verificar sus límites antes de usarlos.

La ruta `/api/cron/alerts` todavía no existe.

## 7. CV y archivos

La política de producto ya lo decide:

- El CV es **opcional**; la evidencia puede ser un enlace (`docs/producto.md`).
- Si se admiten archivos, deben ser **privados**, con rutas no predecibles y enlaces firmados de corta duración; solo PDF y hasta 5 MB.
- Antes de guardar datos personales en proveedores de otro país, resolver la transferencia de datos (O-009).

Por eso **no se recomienda** pedir enlaces públicos de Google Drive o Dropbox: cualquiera con el enlace ve el CV, y LinkUp no puede borrarlo cuando la persona elimina su cuenta.

Opciones compatibles si se admiten archivos:

| Opción | Plan gratuito | Observaciones |
|---|---|---|
| **Cloudflare R2** | 10 GB al mes; descargas gratis; luego $0,015 por GB al mes | Bucket privado con enlaces firmados |
| **Supabase Storage** | 1 GB | Natural si se elige la opción B |
| **UploadThing** | 2 GB, compartidos entre aplicaciones | Componentes listos para Next.js |

Cualquier opción exige borrar los archivos al eliminar la cuenta; `deleteUserData` hoy no lo hace porque no hay archivos.

## 8. Costos mensuales estimados

| Escenario | Qué incluye | Costo |
|---|---|---|
| **Demo guiada** | La app corre en una computadora del equipo | $0 |
| **A. Piloto con SQLite** | Servidor pequeño + dominio + Resend gratis + alertas dentro de la app | Pocos dólares al mes más el dominio |
| **B. Piloto con Supabase** | Supabase gratis + hosting de Next.js (Vercel Pro u otro) + dominio + Resend gratis | El hosting más el dominio |
| **Crecimiento** | Alertas por correo a miles de personas, archivos, varias instancias | Resend o Brevo pagos, Supabase pago, almacenamiento |

## 9. Riesgos que ningún escenario resuelve solo

- **Respaldos:** definir quién los hace, con qué frecuencia y probar una restauración.
- **Dominio y marca** (O-002, O-012) antes de configurar correo.
- **Datos personales** (O-009) antes de guardar perfiles o CV en proveedores externos.

## Fuentes (verificadas el 25 de septiembre de 2026)

- [Vercel — Fair Use Guidelines, uso comercial](https://vercel.com/docs/limits/fair-use-guidelines)
- [Supabase — Pricing](https://supabase.com/pricing) · [Pausa de proyectos](https://supabase.com/docs/guides/platform/free-project-pausing) · [Restaurables por 90 días](https://supabase.com/changelog/27497-paused-free-plan-projects-are-restorable-for-90-days)
- [Neon — Límites del plan gratuito](https://neon.com/faqs/free-plan-limits-and-quotas)
- [Turso — Pricing](https://turso.tech/pricing)
- [Fly.io — Pricing](https://docs.fly.io/about/pricing/)
- [Resend — Pricing](https://resend.com/pricing)
- [Brevo — Pricing](https://www.brevo.com/pricing/) · [Planes de Brevo](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans)
- [Cloudflare R2 — Pricing](https://developers.cloudflare.com/r2/pricing/)
- [UploadThing — Pricing](https://uploadthing.com/pricing)
