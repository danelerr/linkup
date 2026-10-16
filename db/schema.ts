import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Opportunity, Organization } from "@/lib/catalog-types";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// Better Auth's tables (users, sessions, sign-in methods, codes and request
// limits). Property names are the field names Better Auth expects.
export const authUser = pgTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const authSession = pgTable(
  "auth_session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
  },
  (table) => [index("auth_session_user_idx").on(table.userId)],
);

export const authAccount = pgTable(
  "auth_account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUser.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("auth_account_user_idx").on(table.userId)],
);

export const authVerification = pgTable(
  "auth_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("auth_verification_identifier_idx").on(table.identifier)],
);

// Request limits live in the database: on Vercel each function instance has
// its own memory, so a limit kept there would not apply across instances.
export const authRateLimit = pgTable("auth_rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("talent"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const talentProfiles = pgTable("talent_profiles", {
  userId: text("user_id").primaryKey(),
  objective: text("objective").notNull().default(""),
  city: text("city").notNull().default(""),
  country: text("country").notNull().default(""),
  modality: text("modality").notNull().default(""),
  availability: text("availability").notNull().default(""),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  bio: text("bio").notNull().default(""),
  portfolioUrl: text("portfolio_url").notNull().default(""),
  privacy: text("privacy").notNull().default("private"),
  isAdult: boolean("is_adult").notNull().default(false),
  acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }),
  updatedAt: updatedAt(),
});

export const savedOpportunities = pgTable(
  "saved_opportunities",
  {
    userId: text("user_id").notNull(),
    opportunitySlug: text("opportunity_slug").notNull(),
    createdAt: createdAt(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.opportunitySlug] })],
);

export const savedSearches = pgTable(
  "saved_searches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    label: text("label").notNull(),
    query: jsonb("query").$type<Record<string, string>>().notNull(),
    frequency: text("frequency").notNull().default("semanal"),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index("saved_searches_user_idx").on(table.userId)],
);

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    opportunitySlug: text("opportunity_slug").notNull(),
    mode: text("mode").notNull(),
    status: text("status").notNull().default("enviada"),
    answers: jsonb("answers").$type<string[]>().notNull().default([]),
    profileSnapshot: jsonb("profile_snapshot")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("applications_user_opportunity_unique").on(
      table.userId,
      table.opportunitySlug,
    ),
    index("applications_user_idx").on(table.userId),
  ],
);

export const applicationEvents = pgTable(
  "application_events",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id").notNull(),
    status: text("status").notNull(),
    actor: text("actor").notNull(),
    note: text("note").notNull().default(""),
    createdAt: createdAt(),
  },
  (table) => [
    index("application_events_application_idx").on(table.applicationId),
  ],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    organizationSlug: text("organization_slug").notNull(),
    userId: text("user_id").notNull(),
    memberRole: text("member_role").notNull().default("viewer"),
    status: text("status").notNull().default("active"),
    approvedBy: text("approved_by").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.organizationSlug, table.userId] }),
    index("organization_members_user_idx").on(table.userId),
  ],
);

export const submissions = pgTable(
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
    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    canonicalKey: text("canonical_key"),
    normalizedName: text("normalized_name").notNull().default(""),
    status: text("status").notNull().default("pending"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("submissions_status_idx").on(table.status),
    uniqueIndex("submissions_pending_source_unique")
      .on(table.kind, table.canonicalKey)
      .where(sql`${table.status} = 'pending'`),
    index("submissions_name_idx").on(
      table.kind,
      table.status,
      table.normalizedName,
    ),
    index("submissions_contact_date_idx").on(
      table.contactEmail,
      table.createdAt,
    ),
    index("submissions_user_date_idx").on(table.userId, table.createdAt),
  ],
);

export const moderationDecisions = pgTable(
  "moderation_decisions",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id").notNull(),
    actorId: text("actor_id").notNull(),
    status: text("status").notNull(),
    reason: text("reason").notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("moderation_decisions_submission_idx").on(table.submissionId),
  ],
);

export const auditEvents = pgTable("audit_events", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  detail: jsonb("detail")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: createdAt(),
});

// Catalog records keep the full validated document in `data`; the other
// columns repeat the fields that search, filters and uniqueness need.
export const catalogOrganizations = pgTable(
  "catalog_organizations",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    industry: text("industry").notNull(),
    websiteKey: text("website_key").unique(),
    status: text("status").notNull().default("draft"),
    searchText: text("search_text").notNull(),
    data: jsonb("data").$type<Organization>().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("catalog_organizations_filter_idx").on(table.status, table.industry),
  ],
);

export const catalogOpportunities = pgTable(
  "catalog_opportunities",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    organizationSlug: text("organization_slug")
      .notNull()
      .references(() => catalogOrganizations.slug),
    title: text("title").notNull(),
    area: text("area").notNull(),
    type: text("type").notNull(),
    modality: text("modality").notNull(),
    level: text("level").notNull(),
    status: text("status").notNull().default("draft"),
    closesAt: date("closes_at", { mode: "string" }),
    sourceKey: text("source_key").unique(),
    searchText: text("search_text").notNull(),
    data: jsonb("data").$type<Opportunity>().notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("catalog_opportunities_org_idx").on(
      table.organizationSlug,
      table.status,
      table.closesAt,
    ),
    index("catalog_opportunities_filter_idx").on(
      table.status,
      table.modality,
      table.type,
      table.area,
    ),
  ],
);

export const alertNotifications = pgTable(
  "alert_notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    searchId: text("search_id").notNull(),
    opportunitySlug: text("opportunity_slug").notNull(),
    createdAt: createdAt(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("alert_notification_unique").on(
      table.searchId,
      table.opportunitySlug,
    ),
    index("alert_notification_user_idx").on(table.userId, table.createdAt),
  ],
);
