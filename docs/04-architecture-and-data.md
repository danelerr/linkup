# Arquitectura técnica y modelo de datos

Versión: 1.0  
Objetivo: definir una base sencilla para el MVP que no bloquee el directorio público, la operación de ingesta ni el circuito de postulaciones.

## Estado de implementación de la alfa

Actualizado el 24 de septiembre de 2026 (D-024): Next.js estándar + React + TypeScript; Tailwind y CSS/componentes locales; Morphicons para estados; Better Auth email/contraseña; SQLite local con Drizzle y migraciones. Catálogo persistido con columnas indexadas y documento de contenido validado, no arrays embebidos en el cliente. Publicación, auditoría y aprobación se ejecutan en una transacción. Ediciones concurrentes usan `updatedAt` como precondición. Autorización de roles en servidor y protección de origen en mutaciones.

La implementación **no** usa Supabase, RLS, Trigger.dev, Resend, PostHog ni Sentry. La tabla que sigue describe la arquitectura objetivo previa, no dependencias instaladas. El README documenta los comandos y límites vigentes. SQLite requiere una instancia con disco persistente; escalar horizontalmente implica migración explícita, no solo cambiar una variable. Alertas dentro de la app; correo, recuperación de contraseña y verificación de email pendientes de proveedor. No se publica ni se conecta infraestructura sin autorización.

## Decisión arquitectónica

LinkUp comienza como un **monolito modular en TypeScript**, con una aplicación Next.js y procesos asíncronos separados. No se crean microservicios hasta que exista una necesidad operativa medida.

### Stack

| Capa | Elección inicial |
|---|---|
| Web y backend | Next.js App Router, React, TypeScript |
| Estilos y componentes | Tailwind CSS + primitives de Radix UI donde se necesite comportamiento accesible; componentes locales inspirados en el patrón de shadcn, sin conservar su tema visual |
| Validación | Zod |
| Formularios | React Hook Form |
| Base de datos | PostgreSQL administrado por Supabase |
| Acceso a datos | Cliente Supabase tipado + SQL/RPC para operaciones de dominio; sin ORM inicial |
| Migraciones y tipos | Supabase CLI, migraciones SQL y tipos generados |
| Autenticación | Supabase Auth |
| Archivos privados | Supabase Storage |
| Autorización de datos | PostgreSQL Row Level Security |
| Búsqueda inicial | Full Text Search, índices GIN y `pg_trgm` |
| Tareas y cron | Trigger.dev |
| Recopilación | `fetch` y parser HTML; Cheerio cuando sea necesario; navegador solo como último recurso |
| Correo | Resend |
| Analítica de producto | PostHog |
| Monitoreo de errores | Sentry |
| Unitarias e integración | Vitest |
| End-to-end | Playwright |
| Hosting web | Vercel inicialmente |
| Toolchain | Node.js LTS compatible, `pnpm` mediante Corepack, ESLint y Prettier |

Las versiones se fijan en lockfile al iniciar la implementación. No se escribe una versión mayor en esta definición porque debe elegirse la última estable compatible en ese momento.

## Por qué Next.js y no React con Vite puro

El producto público depende de páginas indexables y compartibles para cada startup y oportunidad. Next.js entrega renderizado de servidor, generación de metadata, sitemap, Open Graph, caché y revalidación dentro del mismo framework.

Vite continúa siendo una herramienta válida para aplicaciones cliente o una herramienta interna aislada, pero su SSR de bajo nivel exigiría ensamblar infraestructura que no genera ventaja para LinkUp.

Referencias técnicas:

- [Metadata y Open Graph en Next.js](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [SSR de bajo nivel en Vite](https://vite.dev/guide/ssr.html)
- [Supabase con Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Autenticación y RLS en Supabase](https://supabase.com/docs/guides/auth)
- [Tareas, reintentos y colas en Trigger.dev](https://trigger.dev/docs/tasks/overview)

## Vista del sistema

```text
                         ┌─────────────────────────┐
Fuentes oficiales ─────>│ Adaptadores de ingesta │
APIs / feeds / careers  │ Trigger.dev            │
                         └───────────┬─────────────┘
                                     │ registros normalizados
                                     v
┌───────────────┐          ┌───────────────────────┐
│ Google / bots │─────────>│ Next.js               │
│ Navegadores   │<────────>│ público + privado     │
└───────────────┘          │ acciones + webhooks   │
                           └───────────┬───────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  v                    v                    v
          ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
          │ PostgreSQL   │    │ Storage privado│    │ Email /      │
          │ RLS + search │    │ CV y evidencia │    │ analítica    │
          └──────────────┘    └────────────────┘    └──────────────┘
```

## Módulos de dominio

- `identity`: cuentas, sesiones, roles y consentimiento.
- `organizations`: startups, aliados, miembros y reclamaciones.
- `opportunities`: oferta, condiciones, publicación y vigencia.
- `sources`: procedencia, adaptadores, registros crudos e ingesta.
- `talent`: perfil, preferencias, habilidades y evidencia.
- `applications`: postulaciones, estados y resultados.
- `matching`: restricciones, señales, scores y explicaciones.
- `notifications`: alertas, recordatorios y correos transaccionales.
- `moderation`: colas, reportes, decisiones y auditoría.
- `analytics`: eventos sin texto sensible y métricas agregadas.

Cada módulo expone servicios de dominio. Los componentes de interfaz no consultan tablas arbitrariamente ni duplican reglas de negocio.

## Estructura de repositorio propuesta

```text
app/
  (public)/
  (auth)/
  mi-linkup/
  organizacion/
  admin/
  api/
components/
  ui/
  search/
  organizations/
  opportunities/
features/
  identity/
  organizations/
  opportunities/
  talent/
  applications/
  matching/
lib/
  db/
  auth/
  analytics/
  email/
  permissions/
trigger/
  ingestion/
  notifications/
  maintenance/
supabase/
  migrations/
  seed/
  tests/        # SQL y RLS
tests/
  e2e/
  fixtures/
```

No se crea un paquete o capa si solo contiene un archivo sin frontera real. La estructura debe crecer con el dominio, no anticipar microservicios.

## Estrategia de renderizado

### Público

- Startup y oportunidad: servidor, cacheables y revalidables por entidad.
- Listados y búsqueda: servidor para primera carga; filtros reflejados en URL; interactividad progresiva en cliente.
- Sitemap: generado desde entidades activas.
- Open Graph: título, organización, modalidad y marca; sin datos privados.

### Privado

- Perfil, postulaciones, panel de organización y admin: renderizado dinámico con identidad verificada.
- No se confía solo en ocultar rutas en cliente; cada lectura y escritura aplica autorización de servidor y RLS.

### Revalidación

- Una aprobación, actualización o cierre invalida la página de entidad y listados afectados.
- Los listados pueden tolerar caché breve; el detalle de una vacante debe reflejar cierre con rapidez.
- Los datos de usuario nunca se comparten en cachés públicas.

## Identidad y acceso

### Métodos iniciales

- Enlace mágico por email.
- Google OAuth.
- Verificación de correo para acciones de organización.

No se requiere contraseña propia en el primer lanzamiento si los métodos anteriores cubren el piloto.

### Roles de aplicación

- `talent`
- `organization_member`
- `partner_member`
- `curator`
- `admin`
- `system_worker`

Una persona puede tener más de un rol. Los roles administrativos no se asignan desde la interfaz pública.

### Permisos resumidos

| Recurso | Público | Talento | Miembro de organización | Curador | Admin |
|---|---:|---:|---:|---:|---:|
| Organización activa | Leer | Leer | Editar la propia aprobada | Moderar | Administrar |
| Oportunidad activa | Leer | Leer | Editar la propia | Moderar | Administrar |
| Perfil privado | No | Propio | Solo datos enviados en una postulación propia | Soporte justificado | Acceso excepcional auditado |
| Evidencia privada | No | Propia | Solo la compartida | No por defecto | Acceso excepcional auditado |
| Postulación | No | Propia | Solo a oportunidad propia | Soporte limitado | Acceso auditado |
| Fuente e ingesta | Lectura resumida | Lectura resumida | Fuente de lo propio | Gestionar | Administrar |
| Auditoría | No | Eventos propios seleccionados | Eventos propios seleccionados | Lectura operativa | Lectura total restringida |

Dentro de una organización:

| Rol | Perfil y oportunidades | Candidatos consentidos | Equipo y propiedad |
|---|---|---|---|
| `owner` | Crear, editar, publicar y cerrar | Leer y cambiar estados | Invitar, retirar y transferir con controles |
| `recruiter` | Crear y gestionar oportunidades | Leer y cambiar estados | No administra propiedad; puede invitar solo si se habilita expresamente |
| `editor` | Editar perfil y borradores | Sin acceso | Sin acceso |
| `viewer` | Lectura de panel y métricas agregadas | Sin perfiles ni respuestas | Sin acceso |

La capacidad de ver candidatos nunca se hereda de poder editar contenido.

## Convenciones de datos

- Identificadores: UUID.
- Fechas y horas: UTC en almacenamiento, zona local en presentación.
- Países: ISO 3166-1 alpha-2.
- Monedas: ISO 4217.
- Idiomas: BCP 47 cuando sea necesario.
- Slugs: estables, únicos y con historial de redirecciones.
- Eliminación: `archived_at` o estado de dominio; eliminación dura solo mediante procedimiento de privacidad o retención.
- Procedencia: ningún valor importado sobrescribe silenciosamente un valor declarado.

## Modelo de datos

### Compartido

#### `slug_redirects`

- `entity_type`, `entity_id`
- `old_slug`, `current_slug`
- `created_at`

Permite cambiar un slug sin romper enlaces compartidos o indexados. Un slug histórico no puede reasignarse a otra entidad del mismo tipo.

### Identidad

#### `users`

- `id`
- `auth_user_id`
- `status`
- `primary_role`
- `accepted_terms_version`
- `accepted_privacy_version`
- `created_at`, `updated_at`, `last_seen_at`

#### `user_roles`

- `user_id`
- `role`
- `scope_type`, `scope_id`
- `granted_by`
- `granted_at`, `revoked_at`

#### `consents`

- `user_id`
- `purpose`
- `version`
- `granted_at`, `revoked_at`
- `context`

### Organizaciones

#### `organizations`

- `id`, `slug`
- `kind`: startup, empresa, ONG, universidad, programa, comunidad
- `display_name`, `legal_name`
- `short_description`, `description`
- `website_url`
- `country_code`, `city`, `remote_policy`
- `stage`, `team_size_min`, `team_size_max`, `founded_year`
- `operational_status`: active, activity_unconfirmed, inactive, acquired, closed
- `last_activity_at`, `activity_confidence`
- `verification_status`
- `claim_status`
- `source_confidence`
- `published_at`, `last_verified_at`, `archived_at`
- `created_at`, `updated_at`

#### `organization_industries`

- `organization_id`
- `industry_id`

#### `industries`

- `id`, `slug`, `name`
- `parent_id` opcional
- `aliases`
- `active`

#### `organization_people`

Solo datos públicos o declarados necesarios para comprender el equipo:

- `organization_id`
- `name`
- `role`
- `public_profile_url`
- `source_id`
- `visibility`

#### `organization_members`

- `organization_id`
- `user_id`
- `member_role`: owner, recruiter, editor, viewer
- `status`
- `verified_method`
- `approved_by`, `approved_at`

#### `organization_invitations`

- `id`, `organization_id`
- `email_hash`, `email_ciphertext`, `invited_role`
- `token_hash`, `expires_at`
- `status`: pending, accepted, revoked, expired
- `invited_by`, `accepted_by`
- `created_at`, `accepted_at`, `revoked_at`

El correo se cifra para poder entregar la invitación y se elimina al aceptar o expirar; el hash permite comparar sin conservar texto. El token se muestra una sola vez y se guarda únicamente como hash. Una organización activa conserva al menos un propietario; transferir ese rol requiere reautenticación y aceptación explícita.

#### `organization_claims`

- `organization_id`
- `requester_user_id`
- `evidence_type`, `evidence_reference`
- `status`, `review_reason`
- `reviewed_by`, `reviewed_at`

#### `verification_artifacts`

Metadatos de evidencia privada usada para reclamar o verificar; el archivo vive en Storage privado:

- `id`, `organization_id`, `claim_id` opcional
- `artifact_type`
- `storage_path` o `external_reference`
- `review_status`
- `retention_until`
- `created_by`, `reviewed_by`, `created_at`, `reviewed_at`, `deleted_at`

### Oportunidades

#### `content_submissions`

Cola común para propuestas comunitarias de startup u oportunidad:

- `id`, `entity_type`
- `existing_entity_id` opcional
- `proposed_data_json`, `source_url`
- `submitter_user_id` opcional
- `contact_email_hash`, `contact_email_ciphertext` opcionales
- `contact_verified_at`
- `status`: draft, pending, needs_changes, approved, rejected, withdrawn
- `review_reason`, `reviewed_by`, `reviewed_at`
- `created_at`, `updated_at`, `retention_until`

El correo cifrado se elimina al concluir soporte y retención; el envío aprobado crea o actualiza la entidad mediante un servicio auditado, no mediante copia directa del JSON.

#### `opportunities`

- `id`, `slug`, `organization_id`
- `responsible_member_id`, `response_target_days`
- `type`, `title`, `summary`, `description`
- `responsibilities`
- `application_mode`: external, native
- `management_mode`: external_source, organization_self_service, linkup_managed
- `external_apply_url`
- `seniority`, `workload`
- `declared_engagement_type`: employment, independent_contract, internship_agreement, educational_program, scholarship, not_disclosed
- `weekly_hours_min`, `weekly_hours_max`
- `duration_value`, `duration_unit`
- `remote_policy`, `city`, `country_code`
- `accepted_country_codes`
- `compensation_status`: paid_disclosed, paid_undisclosed, unpaid, not_disclosed, not_applicable
- `compensation_min`, `compensation_max`, `currency`, `compensation_period`
- `participation_cost_status`: free, participant_paid, scholarship_available, not_disclosed, not_applicable
- `participation_cost_amount`, `participation_cost_currency`, `coverage_description`
- `equity_disclosed`, `equity_description`
- `opens_at`, `deadline_at`, `published_at`
- `status`, `verification_status`, `last_verified_at`
- `material_version`
- `created_by`, `created_at`, `updated_at`, `archived_at`

Los textos largos pueden almacenarse como Markdown restringido y sanitizado. No se acepta HTML arbitrario.

#### `opportunity_requirements`

- `opportunity_id`
- `kind`: required, preferred
- `requirement_type`: skill, language, location, availability, legal, education, other
- `value`
- `normalized_reference_id`
- `display_order`

#### `opportunity_questions`

- `opportunity_id`
- `prompt`
- `response_type`
- `required`
- `max_length`
- `display_order`

El MVP permite máximo tres preguntas. No se solicitan atributos sensibles.

#### `areas`, `roles` y relaciones de oportunidad

Catálogo controlado para el filtro de área y su relación muchos-a-muchos:

- `areas`: `id`, `slug`, `name`, `parent_id`, `active`
- `roles`: `id`, `slug`, `name`, `area_id`, `aliases`, `active`
- `opportunity_areas`: `opportunity_id`, `area_id`, `is_primary`
- `opportunity_roles`: `opportunity_id`, `role_id`, `is_primary`

Ejemplos iniciales: ingeniería, producto, diseño, datos, marketing, ventas, operaciones, finanzas, talento y legal. Se añaden áreas solo al observar oferta real.

#### `opportunity_versions`

Congela los datos materiales mostrados en una versión:

- `id`, `opportunity_id`
- `material_version`
- `snapshot_json`
- `snapshot_hash`
- `change_reason`
- `created_by_type`, `created_by_id`, `created_at`

Una postulación nativa referencia la versión exacta de la oportunidad. Cambios tipográficos no requieren nueva versión material; compensación, funciones, requisitos, modalidad, ubicación, duración o fecha sí.

#### `managed_experiences`

Extensión para pasantías, trainees y proyectos operados por LinkUp:

- `opportunity_id`
- `linkup_owner_user_id`
- `organization_owner_user_id`
- `scope_included`, `scope_excluded`
- `acceptance_criteria`
- `mentor_name`, `feedback_cadence`
- `contract_reference`
- `ip_terms_summary`, `portfolio_permission_status`
- `payment_terms_summary`
- `dispute_status`
- `created_at`, `updated_at`

#### `project_milestones`

- `id`, `opportunity_id`
- `title`, `description`, `sequence`
- `due_at`
- `amount`, `currency`
- `acceptance_status`, `accepted_by`, `accepted_at`
- `payment_status`, `paid_at`

LinkUp no marca pago como realizado solo porque pasó la fecha; requiere confirmación o evidencia.

### Fuentes e ingesta

#### `sources`

- `id`
- `name`, `base_url`
- `source_type`: API, feed, sitemap, careers, manual, partner
- `terms_status`
- `adapter_key`
- `priority`, `refresh_interval`
- `active`, `last_success_at`, `last_failure_at`

#### `source_records`

- `id`, `source_id`
- `external_id`, `canonical_url`
- `entity_type`, `entity_id`
- `raw_hash`, `normalized_hash`
- `raw_payload_reference`
- `first_seen_at`, `last_seen_at`, `last_changed_at`
- `status`

`raw_payload_reference` apunta a almacenamiento restringido con expiración; no es un archivo permanente de páginas ajenas. El hash y los campos de procedencia sobreviven a su eliminación.

#### `ingestion_runs`

- `id`, `source_id`
- `started_at`, `finished_at`
- `status`
- `found_count`, `created_count`, `updated_count`, `closed_count`, `error_count`
- `error_summary`
- `worker_version`

#### `entity_field_provenance`

- `entity_type`, `entity_id`, `field_name`
- `source_id`, `source_record_id`
- `value_hash`
- `observed_at`
- `is_selected_value`

#### `source_suppressions`

Evita reingresar contenido retirado o una fuente no autorizada:

- `id`, `source_id`
- `canonical_url_hash` o `entity_id`
- `reason`, `scope`
- `requested_by`, `approved_by`
- `expires_at` opcional, `created_at`

### Talento

#### `talent_profiles`

- `user_id`
- `display_name`
- `headline`
- `about`
- `country_code`, `city`
- `remote_preference`
- `availability_hours_week`
- `available_from`
- `career_stage`
- `desired_opportunity_types`
- `profile_visibility`: private, link_only, public
- `completion_state`
- `created_at`, `updated_at`

Fecha de nacimiento o confirmación de mayoría de edad se conserva en una tabla privada separada y nunca participa en búsqueda pública.

#### `talent_private_data`

- `user_id`
- `legal_name`
- `adult_eligibility_status`: declared, verified, not_eligible
- `adult_confirmed_at`, `verification_method`
- `birth_date` solo si un flujo posterior la exige legalmente; cifrada y con retención propia
- `contact_email`, `contact_phone`
- `residency_or_work_constraints`
- `retention_until`

#### `skills`

- `id`, `slug`, `name`
- `category`
- `aliases`
- `active`

#### `talent_skills`

- `user_id`, `skill_id`
- `self_level`
- `evidence_count`
- `verification_level`
- `updated_at`

#### `talent_desired_roles`

- `user_id`, `role_id`
- `priority`
- `created_at`

#### `talent_languages`

- `user_id`
- `language_code`
- `proficiency`
- `verification_level`
- `updated_at`

#### `evidence_items`

- `id`, `user_id`
- `type`: link, repository, file, credential, project, reference, outcome
- `title`, `description`
- `url` o `storage_path`
- `visibility`
- `verification_status`
- `verified_by_type`, `verified_by_id`, `verified_at`
- `created_at`, `archived_at`

#### `evidence_skills`

- `evidence_id`, `skill_id`
- `claim_strength`
- `verified`

### Interacción

#### `saved_opportunities`

- `user_id`, `opportunity_id`, `created_at`
- clave única por usuario y oportunidad

#### `saved_searches`

- `id`, `user_id`
- `name`
- `query_json`
- `frequency`
- `enabled`, `last_sent_at`, `created_at`

#### `profile_snapshots`

Instantánea inmutable y minimizada de lo que una persona decide enviar:

- `id`, `user_id`
- `schema_version`
- `snapshot_json`
- `snapshot_hash`
- `created_at`, `retention_until`

No incluye secciones privadas no seleccionadas. La organización accede al snapshot por medio de la postulación, no al perfil vivo.

#### `applications`

- `id`, `user_id`, `opportunity_id`
- `mode`: external, native
- `status`
- `profile_snapshot_id`
- `opportunity_version_id`
- `consent_id`
- `submitted_at`, `last_status_at`, `withdrawn_at`, `closed_at`
- `source_attribution`
- `user_reported`

`profile_snapshot_id`, `opportunity_version_id` y `consent_id` son obligatorios en modo `native`. En modo `external` son opcionales porque LinkUp puede conocer únicamente el clic y el estado reportado.

#### `application_answers`

- `application_id`, `question_id`
- `answer_text`
- cifrado o control de acceso equivalente

#### `application_events`

- `id`, `application_id`
- `from_status`, `to_status`
- `actor_type`, `actor_id`
- `reason_code`, `note_visibility`
- `created_at`

Las notas internas de una organización no son visibles al candidato. El texto libre se minimiza y se aplica retención.

#### `matches`

- `id`, `user_id`, `opportunity_id`
- `ruleset_version`
- `hard_constraints_passed`
- `score`
- `score_components_json`
- `explanation_json`
- `created_at`, `shown_at`, `dismissed_at`

#### `outcomes`

- `id`, `application_id`
- `outcome_type`
- `reported_by_type`, `reported_by_id`
- `verification_level`
- `verification_reference`
- `occurred_at`, `verified_at`
- `creates_evidence`

Tipos canónicos iniciales:

- `interview`
- `selection_or_offer`
- `employment_or_experience_started`
- `paid_project_completed`
- `professional_program_completed`

Niveles de verificación:

- `self_reported`
- `counterparty_confirmed`
- `evidence_confirmed`
- `linkup_observed`

La métrica norte solo usa los tres últimos niveles. Un tipo de hito se registra una vez por postulación; correcciones actualizan auditoría, no crean duplicados.

#### `notification_deliveries`

- `id`, `user_id`
- `notification_type`, `channel`
- `saved_search_id` opcional, `opportunity_id` opcional, `application_id` opcional
- `deduplication_key`
- `provider_reference`
- `status`, `sent_at`, `delivered_at`, `failed_at`

La clave de deduplicación impide reenviar la misma oportunidad por una alerta sin cambio material.

### Moderación y auditoría

#### `moderation_cases`

- `id`
- `entity_type`, `entity_id`
- `reason`, `severity`
- `status`
- `assigned_to`
- `resolution`, `resolved_at`

#### `reports`

- `id`
- `reporter_user_id` opcional
- `entity_type`, `entity_id`
- `category`, `description`
- `status`, `created_at`

#### `audit_events`

- `id`
- `actor_type`, `actor_id`
- `action`
- `entity_type`, `entity_id`
- `before_hash`, `after_hash`
- `reason`
- `ip_reference` con retención limitada
- `created_at`

## Estados de dominio complementarios

Los estados de oportunidad y postulación están definidos en `02-product-requirements.md`. Los demás dominios usan estas claves iniciales:

| Campo | Valores |
|---|---|
| `users.status` | `pending`, `active`, `suspended`, `deletion_requested`, `deleted` |
| `organizations.verification_status` | `unverified`, `pending`, `verified`, `expired`, `suspended` |
| `organizations.claim_status` | `unclaimed`, `pending`, `claimed`, `disputed` |
| `opportunities.verification_status` | `unreviewed`, `source_confirmed`, `organization_confirmed`, `under_review` |
| `evidence_items.visibility` | `private`, `application_only`, `link_only`, `public` |
| `evidence_items.verification_status` | `declared`, `source_connected`, `counterparty_confirmed`, `linkup_verified`, `revoked` |
| `sources.terms_status` | `unreviewed`, `allowed`, `restricted`, `permission_required`, `blocked` |
| `moderation_cases.status` | `open`, `triaged`, `investigating`, `contained`, `resolved`, `appealed` |
| `notification_deliveries.status` | `queued`, `sent`, `delivered`, `failed`, `suppressed` |

`suspended`, `blocked`, `revoked` y `under_review` requieren motivo y auditoría. Los textos de interfaz se traducen; las claves almacenadas permanecen estables.

## Índices y restricciones clave

- Slugs únicos por tipo de entidad.
- URL canónica normalizada e indexada.
- Clave única de `source_id + external_id` cuando exista.
- Restricción que impide `content_submissions.pending` sin cuenta activa o correo verificado.
- Índice GIN sobre documentos de búsqueda de organización y oportunidad.
- Índices trigram sobre nombres, títulos y alias.
- Índices parciales para oportunidades `activas` y no archivadas.
- Índices por `last_verified_at` para colas de frescura.
- Clave única de guardado y miembro activo.
- Una sola postulación rastreable por `user_id + opportunity_id`; reintentos son idempotentes y una reapertura material usa nueva oportunidad o migración auditada.
- Restricción que impide postulación nativa sin perfil snapshot y consentimiento.
- Restricción que impide postulación nativa sin versión de oportunidad.
- Restricción que impide publicar una oportunidad nativa sin responsable activo y `response_target_days` entre 1 y 7 durante el piloto.
- Restricción que exige `external_source` para postulación externa y permite `organization_self_service` o `linkup_managed` para postulación nativa.
- Restricción que impide compensación numérica sin moneda y periodo.
- Restricción que exige monto o rango para `paid_disclosed` y lo impide en los demás estados; si la fuente afirma que existe pago sin cuantía, se usa `paid_undisclosed`.
- Restricción que impide `unpaid` con monto positivo.
- Restricción `compensation_min <= compensation_max` y periodo dentro de `hour`, `month`, `year`, `project_total`, `stipend_total`.
- Restricción que exige `paid_disclosed` para `proyecto_pagado` y `management_mode = linkup_managed`.
- Restricción que permite costo de participación solo en `programa_profesional` o `beca_formativa`; las demás categorías deben usar `not_applicable`.
- Restricción que impide marcar resultado como verificado sin actor o referencia válida.
- Unicidad de `opportunity_id + material_version` y `deduplication_key` de notificación.
- Unicidad de `application_id + outcome_type` para hitos verificados.

## Row Level Security

Reglas mínimas que deben tener pruebas automatizadas:

- `anon` lee únicamente organizaciones y oportunidades publicadas y activas.
- Un usuario lee y edita su perfil, datos privados, evidencias, guardados, alertas y postulaciones.
- Un miembro lee postulaciones solo cuando pertenecen a oportunidades de su organización y fueron enviadas nativamente.
- Un miembro nunca consulta el perfil completo; consulta el snapshot consentido de la postulación.
- Un curador no accede por defecto a archivos privados.
- `service_role` no se expone al navegador ni a acciones comunes del servidor.
- Los trabajadores tienen funciones o credenciales separadas según tarea.
- Una suspensión de organización invalida de inmediato acceso de sus miembros y visibilidad de sus oportunidades.

Las políticas se prueban con identidades positivas y negativas; no basta probar que el caso permitido funciona.

## Archivos

- Buckets separados para logotipos públicos y evidencia privada.
- CV y evidencia privada usan rutas no predecibles y URLs firmadas de corta duración.
- Tipos permitidos explícitos; PDF para CV en el MVP.
- Tamaño máximo inicial de 5 MB por CV, revisable por datos reales.
- Un archivo nuevo permanece en cuarentena hasta validación de tipo y escaneo.
- El nombre original no se usa como ruta.
- Las organizaciones descargan solo archivos incluidos en una postulación consentida.
- Borrar cuenta inicia flujo de borrado o anonimización también en Storage y respaldos según política.

## Servicios de dominio y escritura

Las escrituras sensibles pasan por funciones de servidor o procedimientos controlados:

- Publicar o cerrar oportunidad.
- Aprobar reclamación.
- Enviar postulación nativa.
- Cambiar estado de candidatura.
- Verificar resultado o evidencia.
- Exportar o eliminar datos.
- Asignar rol.

Cada operación valida entrada con Zod, comprueba permisos, ejecuta transacción y registra auditoría cuando corresponde.

## Eventos analíticos

No incluir títulos de CV, respuestas, nombres o texto libre.

| Evento | Propiedades permitidas |
|---|---|
| `search_performed` | pestaña, filtros normalizados, cantidad de resultados |
| `result_opened` | tipo de entidad, id interno, posición, query id |
| `opportunity_saved` | opportunity_id, source_type |
| `alert_created` | tipos de filtro, frecuencia |
| `external_apply_clicked` | opportunity_id, source_id |
| `external_application_reported` | opportunity_id, estado reportado |
| `native_application_started` | opportunity_id |
| `native_application_submitted` | opportunity_id, profile_completion_bucket |
| `application_status_changed` | opportunity_id, estado anterior y nuevo, actor_type |
| `outcome_reported` | tipo, actor_type, verification_level |
| `organization_claim_started` | organization_id, method |
| `organization_claim_approved` | organization_id, method |

La analítica de producto requiere consentimiento y configuración acorde a la jurisdicción aplicable.

## Notificaciones

- Correos transaccionales: acceso, confirmación, cambio de estado, cierre y seguridad.
- Alertas: nuevas oportunidades que cumplen consulta guardada.
- Recordatorios: fecha límite y seguimiento de postulación.
- Preferencias por categoría y frecuencia.
- Todo correo no transaccional incluye baja de suscripción.
- Evitar enviar repetidamente la misma oportunidad por cambios menores.

## Entornos y entrega

- `local`: Supabase local o proyecto aislado, datos ficticios.
- `preview`: por cambio, sin datos de producción.
- `staging`: integración previa a producción con fuentes de prueba.
- `production`: acceso restringido, auditoría y backups.

Pipeline mínimo:

1. Formato y lint.
2. Typecheck.
3. Unitarias e integración.
4. Pruebas de RLS.
5. Build de producción.
6. E2E crítico en preview o staging.
7. Migración validada antes de desplegar aplicación que la requiere.

Las migraciones son inmutables una vez desplegadas; correcciones se realizan con nueva migración.

## Observabilidad

- Errores de aplicación en Sentry con PII removida.
- Logs estructurados con `request_id`, `actor_type`, `entity_id` cuando sea seguro.
- Dashboard de ingesta por fuente.
- Alertas para fuente caída, aumento de duplicados, correos fallidos y cola atrasada.
- Métricas de base de datos: consultas lentas, conexiones, locks y tamaño.
- Historial de despliegues asociado a errores.

## Objetivos no funcionales del piloto

- Mobile-first desde 320 px.
- Accesibilidad WCAG 2.2 AA como estándar de aceptación.
- Objetivos p75 móviles: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 en páginas públicas principales.
- Búsqueda p95 <= 500 ms bajo volumen esperado del piloto.
- Acciones normales p95 <= 800 ms, excluyendo tareas asíncronas.
- Disponibilidad objetivo de 99.5% mensual durante piloto, sin promesa contractual.
- Oportunidades de fuentes prioritarias revisadas al menos cada 24 horas; resto según SLA documentado.
- RPO inicial <= 24 horas y procedimiento de recuperación ensayado antes de lanzamiento.

Estos son objetivos medibles, no afirmaciones previas al lanzamiento.

## Estrategia de pruebas

### Unitarias

- Normalización y deduplicación.
- Reglas de vigencia.
- Cálculo de ranking y matching.
- Transiciones de estado.
- Permisos de dominio.

### Integración

- Base de datos y RLS.
- Ingesta con fixtures por fuente.
- Correo en entorno de prueba.
- Webhooks idempotentes.
- Almacenamiento y URLs firmadas.

### End-to-end

- Explorar y filtrar sin cuenta.
- Guardar con autenticación diferida.
- Postulación externa y seguimiento.
- Postulación nativa de extremo a extremo.
- Reclamar organización.
- Moderar oportunidad.
- Cerrar vacante y comprobar retiro del índice.

### Calidad visual y accesibilidad

- Capturas desktop y móvil de rutas críticas.
- Navegación por teclado.
- Axe u otra auditoría automatizada como apoyo, no sustituto de revisión manual.
- Estados vacíos, error, carga y contenido largo.

### Seguridad

- Casos negativos de RLS.
- Intento de acceso cruzado entre organizaciones.
- Archivos no permitidos.
- Manipulación de `organization_id` y `user_id`.
- Rate limits de autenticación, envío y reportes.
- Dependencias y secretos.

## Cuándo separar servicios

Se considera extraer un servicio solo si existe evidencia de:

- Ingesta que supera consistentemente los límites del runtime elegido.
- Necesidad de escalar búsqueda de forma independiente.
- API pública con requisitos distintos al frontend.
- Procesamiento de archivos o modelos con recursos especializados.
- Equipos distintos que necesitan desplegar independientemente.

Hasta entonces, la separación conceptual vive en módulos y tareas, no en infraestructura distribuida.
