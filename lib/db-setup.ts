import { env } from "cloudflare:workers";

let setupPromise: Promise<void> | null = null;

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'talent',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS talent_profiles (
    user_id TEXT PRIMARY KEY NOT NULL,
    objective TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    modality TEXT NOT NULL DEFAULT '',
    availability TEXT NOT NULL DEFAULT '',
    skills_json TEXT NOT NULL DEFAULT '[]',
    bio TEXT NOT NULL DEFAULT '',
    portfolio_url TEXT NOT NULL DEFAULT '',
    privacy TEXT NOT NULL DEFAULT 'private',
    is_adult INTEGER NOT NULL DEFAULT 0,
    accepted_terms_at TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS saved_opportunities (
    user_id TEXT NOT NULL,
    opportunity_slug TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, opportunity_slug)
  )`,
  `CREATE TABLE IF NOT EXISTS saved_searches (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL,
    query_json TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'semanal',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    opportunity_slug TEXT NOT NULL,
    mode TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'enviada',
    answers_json TEXT NOT NULL DEFAULT '[]',
    profile_snapshot_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS applications_user_opportunity_unique
    ON applications (user_id, opportunity_slug)`,
  `CREATE TABLE IF NOT EXISTS application_events (
    id TEXT PRIMARY KEY NOT NULL,
    application_id TEXT NOT NULL,
    status TEXT NOT NULL,
    actor TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS organization_members (
    organization_slug TEXT NOT NULL,
    user_id TEXT NOT NULL,
    member_role TEXT NOT NULL DEFAULT 'viewer',
    status TEXT NOT NULL DEFAULT 'active',
    approved_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (organization_slug, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT,
    contact_email TEXT NOT NULL,
    kind TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    website_url TEXT NOT NULL DEFAULT '',
    opportunity_title TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS moderation_decisions (
    id TEXT PRIMARY KEY NOT NULL,
    submission_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    status TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY NOT NULL,
    actor_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    detail_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS saved_searches_user_idx ON saved_searches (user_id)`,
  `CREATE INDEX IF NOT EXISTS applications_user_idx ON applications (user_id)`,
  `CREATE INDEX IF NOT EXISTS application_events_application_idx ON application_events (application_id)`,
  `CREATE INDEX IF NOT EXISTS organization_members_user_idx ON organization_members (user_id)`,
  `CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status)`,
  `CREATE INDEX IF NOT EXISTS moderation_decisions_submission_idx ON moderation_decisions (submission_id)`,
];

export async function ensureDatabase() {
  if (!setupPromise) {
    setupPromise = env.DB.batch(statements.map((statement) => env.DB.prepare(statement)))
      .then(() => undefined)
      .catch((error) => {
        setupPromise = null;
        throw error;
      });
  }
  return setupPromise;
}
