import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("talent"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastSeenAt: text("last_seen_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const talentProfiles = sqliteTable("talent_profiles", {
  userId: text("user_id").primaryKey(),
  objective: text("objective").notNull().default(""),
  city: text("city").notNull().default(""),
  country: text("country").notNull().default(""),
  modality: text("modality").notNull().default(""),
  availability: text("availability").notNull().default(""),
  skillsJson: text("skills_json").notNull().default("[]"),
  bio: text("bio").notNull().default(""),
  portfolioUrl: text("portfolio_url").notNull().default(""),
  privacy: text("privacy").notNull().default("private"),
  isAdult: integer("is_adult", { mode: "boolean" }).notNull().default(false),
  acceptedTermsAt: text("accepted_terms_at"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const savedOpportunities = sqliteTable(
  "saved_opportunities",
  {
    userId: text("user_id").notNull(),
    opportunitySlug: text("opportunity_slug").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [primaryKey({ columns: [table.userId, table.opportunitySlug] })],
);

export const savedSearches = sqliteTable(
  "saved_searches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    label: text("label").notNull(),
    queryJson: text("query_json").notNull(),
    frequency: text("frequency").notNull().default("semanal"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("saved_searches_user_idx").on(table.userId)],
);

export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    opportunitySlug: text("opportunity_slug").notNull(),
    mode: text("mode").notNull(),
    status: text("status").notNull().default("enviada"),
    answersJson: text("answers_json").notNull().default("[]"),
    profileSnapshotJson: text("profile_snapshot_json").notNull().default("{}"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("applications_user_opportunity_unique").on(table.userId, table.opportunitySlug),
    index("applications_user_idx").on(table.userId),
  ],
);

export const applicationEvents = sqliteTable(
  "application_events",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id").notNull(),
    status: text("status").notNull(),
    actor: text("actor").notNull(),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("application_events_application_idx").on(table.applicationId)],
);

export const organizationMembers = sqliteTable(
  "organization_members",
  {
    organizationSlug: text("organization_slug").notNull(),
    userId: text("user_id").notNull(),
    memberRole: text("member_role").notNull().default("viewer"),
    status: text("status").notNull().default("active"),
    approvedBy: text("approved_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.organizationSlug, table.userId] }),
    index("organization_members_user_idx").on(table.userId),
  ],
);

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    contactEmail: text("contact_email").notNull(),
    kind: text("kind").notNull(),
    organizationName: text("organization_name").notNull(),
    websiteUrl: text("website_url").notNull().default(""),
    opportunityTitle: text("opportunity_title").notNull().default(""),
    sourceUrl: text("source_url").notNull(),
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("submissions_status_idx").on(table.status)],
);

export const moderationDecisions = sqliteTable(
  "moderation_decisions",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id").notNull(),
    actorId: text("actor_id").notNull(),
    status: text("status").notNull(),
    reason: text("reason").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("moderation_decisions_submission_idx").on(table.submissionId)],
);

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  detailJson: text("detail_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
