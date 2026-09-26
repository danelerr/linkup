import {
  and,
  count,
  desc,
  eq,
  inArray,
  notInArray,
  sql,
  type SQL,
} from "drizzle-orm";
import type { LinkUpUser } from "@/lib/session";
import { getDb, getSqlite } from "@/db";
import {
  applicationEvents,
  applications,
  auditEvents,
  moderationDecisions,
  organizationMembers,
  savedOpportunities,
  savedSearches,
  submissions,
  talentProfiles,
  users,
} from "@/db/schema";
import { ensureDatabase } from "@/lib/db-setup";
import { canonicalSource } from "@/lib/catalog";
import { normalizeText } from "@/lib/catalog-types";

export type TalentProfile = {
  objective: string;
  city: string;
  country: string;
  modality: string;
  availability: string;
  skills: string[];
  bio: string;
  portfolioUrl: string;
  privacy: string;
  isAdult: boolean;
  acceptedTermsAt: string | null;
};

export type ProfileInput = Omit<TalentProfile, "acceptedTermsAt">;

const emptyProfile: TalentProfile = {
  objective: "",
  city: "",
  country: "",
  modality: "",
  availability: "",
  skills: [],
  bio: "",
  portfolioUrl: "",
  privacy: "private",
  isAdult: false,
  acceptedTermsAt: null,
};

function safeStringArray(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

const LAST_SEEN_RESOLUTION = 60 * 60 * 1000;

/** SQLite's CURRENT_TIMESTAMP has no "T" or zone; both forms are UTC. */
function parseTimestamp(value: string) {
  return Date.parse(
    value.includes("T") ? value : `${value.replace(" ", "T")}Z`,
  );
}

export async function syncUser(user: LinkUpUser) {
  await ensureDatabase();
  const db = getDb();
  const now = new Date().toISOString();
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, user.userId),
  });
  const displayName = user.fullName ?? existingUser?.displayName ?? user.email;
  // Most requests find nothing to change; skip the write unless the account
  // changed or the last visit is older than the resolution we keep.
  if (
    existingUser &&
    existingUser.email === user.email &&
    existingUser.displayName === displayName &&
    Date.now() - parseTimestamp(existingUser.lastSeenAt) < LAST_SEEN_RESOLUTION
  )
    return;
  await db
    .insert(users)
    .values({
      id: user.userId,
      email: user.email,
      displayName,
      role: "talent",
      updatedAt: now,
      lastSeenAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: user.email,
        displayName,
        updatedAt: now,
        lastSeenAt: now,
      },
    });
  await db
    .insert(talentProfiles)
    .values({ userId: user.userId })
    .onConflictDoNothing({ target: talentProfiles.userId });
}

export async function getProfile(userId: string): Promise<TalentProfile> {
  await ensureDatabase();
  const row = await getDb().query.talentProfiles.findFirst({
    where: eq(talentProfiles.userId, userId),
  });
  if (!row) return emptyProfile;
  return {
    objective: row.objective,
    city: row.city,
    country: row.country,
    modality: row.modality,
    availability: row.availability,
    skills: safeStringArray(row.skillsJson),
    bio: row.bio,
    portfolioUrl: row.portfolioUrl,
    privacy: row.privacy,
    isAdult: row.isAdult,
    acceptedTermsAt: row.acceptedTermsAt,
  };
}

export async function updateProfile(userId: string, input: ProfileInput) {
  await ensureDatabase();
  const now = new Date().toISOString();
  const acceptedTermsAt = input.isAdult ? now : null;
  await getDb()
    .insert(talentProfiles)
    .values({
      userId,
      objective: input.objective,
      city: input.city,
      country: input.country,
      modality: input.modality,
      availability: input.availability,
      skillsJson: JSON.stringify(input.skills),
      bio: input.bio,
      portfolioUrl: input.portfolioUrl,
      privacy: input.privacy,
      isAdult: input.isAdult,
      acceptedTermsAt,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: talentProfiles.userId,
      set: {
        objective: input.objective,
        city: input.city,
        country: input.country,
        modality: input.modality,
        availability: input.availability,
        skillsJson: JSON.stringify(input.skills),
        bio: input.bio,
        portfolioUrl: input.portfolioUrl,
        privacy: input.privacy,
        isAdult: input.isAdult,
        acceptedTermsAt,
        updatedAt: now,
      },
    });
  await recordAudit(userId, "profile.updated", "talent_profile", userId);
}

export function profileReadiness(profile: TalentProfile) {
  const checks = [
    Boolean(profile.objective),
    Boolean(profile.city && profile.country),
    Boolean(profile.modality),
    Boolean(profile.availability),
    profile.skills.length > 0,
    profile.isAdult,
  ];
  const complete = checks.filter(Boolean).length;
  return {
    complete,
    total: checks.length,
    readyToApply: complete === checks.length,
  };
}

export async function listSavedOpportunitySlugs(userId: string) {
  await ensureDatabase();
  const rows = await getDb()
    .select({ slug: savedOpportunities.opportunitySlug })
    .from(savedOpportunities)
    .where(eq(savedOpportunities.userId, userId))
    .orderBy(desc(savedOpportunities.createdAt));
  return rows.map((row) => row.slug);
}

export async function isOpportunitySaved(
  userId: string,
  opportunitySlug: string,
) {
  await ensureDatabase();
  const row = await getDb().query.savedOpportunities.findFirst({
    where: and(
      eq(savedOpportunities.userId, userId),
      eq(savedOpportunities.opportunitySlug, opportunitySlug),
    ),
  });
  return Boolean(row);
}

export async function setOpportunitySaved(
  userId: string,
  opportunitySlug: string,
  save: boolean,
) {
  await ensureDatabase();
  const db = getDb();
  if (save) {
    await db
      .insert(savedOpportunities)
      .values({ userId, opportunitySlug })
      .onConflictDoNothing({
        target: [savedOpportunities.userId, savedOpportunities.opportunitySlug],
      });
  } else {
    await db
      .delete(savedOpportunities)
      .where(
        and(
          eq(savedOpportunities.userId, userId),
          eq(savedOpportunities.opportunitySlug, opportunitySlug),
        ),
      );
  }
  await recordAudit(
    userId,
    save ? "opportunity.saved" : "opportunity.unsaved",
    "opportunity",
    opportunitySlug,
  );
}

export async function listApplications(userId: string) {
  await ensureDatabase();
  return getDb()
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.updatedAt));
}

export async function getUserRole(userId: string) {
  await ensureDatabase();
  const row = await getDb().query.users.findFirst({
    where: eq(users.id, userId),
  });
  return row?.role ?? "talent";
}

export async function listOrganizationMemberships(userId: string) {
  await ensureDatabase();
  return getDb()
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, "active"),
      ),
    );
}

export async function hasOrganizationAccess(
  userId: string,
  organizationSlug: string,
) {
  const role = await getUserRole(userId);
  if (role === "admin" || role === "curator") return true;
  await ensureDatabase();
  const row = await getDb().query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationSlug, organizationSlug),
      eq(organizationMembers.status, "active"),
    ),
  });
  return Boolean(row);
}

async function organizationMemberRole(
  userId: string,
  organizationSlug: string,
) {
  await ensureDatabase();
  const row = await getDb().query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationSlug, organizationSlug),
      eq(organizationMembers.status, "active"),
    ),
  });
  return row?.memberRole ?? null;
}

export async function hasOrganizationCandidateAccess(
  userId: string,
  organizationSlug: string,
) {
  const role = await getUserRole(userId);
  if (role === "admin") return true;
  const memberRole = await organizationMemberRole(userId, organizationSlug);
  return memberRole === "owner" || memberRole === "recruiter";
}

export async function hasOrganizationOwnerAccess(
  userId: string,
  organizationSlug: string,
) {
  const role = await getUserRole(userId);
  if (role === "admin") return true;
  return (await organizationMemberRole(userId, organizationSlug)) === "owner";
}

export async function countOrganizationApplications(
  opportunitySlugs: string[],
) {
  await ensureDatabase();
  if (!opportunitySlugs.length) return 0;
  const [result] = await getDb()
    .select({ value: count() })
    .from(applications)
    .where(
      and(
        eq(applications.mode, "native"),
        inArray(applications.opportunitySlug, opportunitySlugs),
      ),
    );
  return result?.value ?? 0;
}

export async function countOrganizationMembers(organizationSlug: string) {
  await ensureDatabase();
  const [result] = await getDb()
    .select({ value: count() })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationSlug, organizationSlug),
        eq(organizationMembers.status, "active"),
      ),
    );
  return result?.value ?? 0;
}

export async function listOrganizationMembers(organizationSlug: string) {
  await ensureDatabase();
  return getDb()
    .select({
      userId: organizationMembers.userId,
      displayName: users.displayName,
      email: users.email,
      memberRole: organizationMembers.memberRole,
      status: organizationMembers.status,
      createdAt: organizationMembers.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(eq(organizationMembers.organizationSlug, organizationSlug))
    .orderBy(organizationMembers.createdAt);
}

export async function listOrganizationApplications(
  organizationSlug: string,
  opportunitySlugs: string[],
  actorId?: string,
) {
  await ensureDatabase();
  if (!opportunitySlugs.length) return [];
  const rows = await getDb()
    .select({
      id: applications.id,
      userId: applications.userId,
      candidateName: users.displayName,
      candidateEmail: users.email,
      opportunitySlug: applications.opportunitySlug,
      mode: applications.mode,
      status: applications.status,
      answersJson: applications.answersJson,
      profileSnapshotJson: applications.profileSnapshotJson,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
    })
    .from(applications)
    .innerJoin(users, eq(users.id, applications.userId))
    .where(
      and(
        eq(applications.mode, "native"),
        inArray(applications.opportunitySlug, opportunitySlugs),
      ),
    )
    .orderBy(desc(applications.updatedAt));
  if (actorId)
    await recordAudit(
      actorId,
      "organization.candidates_viewed",
      "organization",
      organizationSlug,
      { count: rows.length },
    );
  return rows;
}

const closedApplicationStatuses = ["seleccionada", "no_continua", "retirada"];

/**
 * Checks and changes the status in one statement, so two concurrent updates
 * (the organization selecting while the person withdraws) cannot both win.
 */
function transitionApplication(
  scope: SQL | undefined,
  applicationId: string,
  actorId: string,
  status: string,
  note: string,
) {
  const now = new Date().toISOString();
  return getDb().transaction((tx) => {
    const { changes } = tx
      .update(applications)
      .set({ status, updatedAt: now })
      .where(
        and(scope, notInArray(applications.status, closedApplicationStatuses)),
      )
      .run();
    if (!changes) return false;
    tx.insert(applicationEvents)
      .values({
        id: crypto.randomUUID(),
        applicationId,
        status,
        actor: actorId,
        note,
        createdAt: now,
      })
      .run();
    return true;
  });
}

export async function updateOrganizationApplicationStatus(
  actorId: string,
  applicationId: string,
  organizationSlug: string,
  opportunitySlugs: string[],
  status: string,
  note = "",
) {
  await ensureDatabase();
  if (!opportunitySlugs.length) return false;
  const updated = transitionApplication(
    and(
      eq(applications.id, applicationId),
      eq(applications.mode, "native"),
      inArray(applications.opportunitySlug, opportunitySlugs),
    ),
    applicationId,
    actorId,
    status,
    note,
  );
  if (!updated) return false;
  await recordAudit(
    actorId,
    "organization.application_status_updated",
    "application",
    applicationId,
    {
      organizationSlug,
      status,
    },
  );
  return true;
}

export async function createApplication(input: {
  userId: string;
  opportunitySlug: string;
  mode: "native" | "external";
  answers: string[];
  profile: TalentProfile;
}) {
  await ensureDatabase();
  const db = getDb();
  const existing = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, input.userId),
      eq(applications.opportunitySlug, input.opportunitySlug),
    ),
  });
  if (existing) return { application: existing, created: false };

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const application = {
    id,
    userId: input.userId,
    opportunitySlug: input.opportunitySlug,
    mode: input.mode,
    status: "enviada",
    answersJson: JSON.stringify(input.answers),
    profileSnapshotJson: JSON.stringify(
      input.mode === "native"
        ? { ...input.profile, sharedAt: now, consent: "application" }
        : {},
    ),
    createdAt: now,
    updatedAt: now,
  };
  await db
    .insert(applications)
    .values(application)
    .onConflictDoNothing({
      target: [applications.userId, applications.opportunitySlug],
    });
  const stored = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, input.userId),
      eq(applications.opportunitySlug, input.opportunitySlug),
    ),
  });
  if (!stored) throw new Error("The application could not be persisted.");
  if (stored.id !== id) return { application: stored, created: false };
  await db.insert(applicationEvents).values({
    id: crypto.randomUUID(),
    applicationId: id,
    status: "enviada",
    actor: input.userId,
    createdAt: now,
  });
  await recordAudit(input.userId, "application.created", "application", id, {
    opportunitySlug: input.opportunitySlug,
    mode: input.mode,
  });
  return { application, created: true };
}

export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: string,
  note = "",
) {
  await ensureDatabase();
  const updated = transitionApplication(
    and(eq(applications.id, applicationId), eq(applications.userId, userId)),
    applicationId,
    userId,
    status,
    note,
  );
  if (!updated) return false;
  await recordAudit(
    userId,
    "application.status_updated",
    "application",
    applicationId,
    { status },
  );
  return true;
}

export async function listSavedSearches(userId: string) {
  await ensureDatabase();
  return getDb()
    .select()
    .from(savedSearches)
    .where(eq(savedSearches.userId, userId))
    .orderBy(desc(savedSearches.createdAt));
}

export async function createSavedSearch(input: {
  userId: string;
  label: string;
  query: Record<string, string>;
  frequency: "diaria" | "semanal";
}) {
  await ensureDatabase();
  const id = crypto.randomUUID();
  await getDb()
    .insert(savedSearches)
    .values({
      id,
      userId: input.userId,
      label: input.label,
      queryJson: JSON.stringify(input.query),
      frequency: input.frequency,
    });
  await recordAudit(input.userId, "alert.created", "saved_search", id);
  return id;
}

export async function deleteSavedSearch(userId: string, id: string) {
  await ensureDatabase();
  await getDb()
    .delete(savedSearches)
    .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
  await recordAudit(userId, "alert.deleted", "saved_search", id);
}

export async function createSubmission(input: {
  userId: string | null;
  contactEmail: string;
  kind: string;
  organizationName: string;
  websiteUrl: string;
  opportunityTitle: string;
  sourceUrl: string;
  notes: string;
}) {
  await ensureDatabase();
  const id = crypto.randomUUID();
  await getDb()
    .insert(submissions)
    .values({
      id,
      ...input,
      canonicalKey: ["startup", "opportunity"].includes(input.kind)
        ? canonicalSource(input.sourceUrl)
        : null,
      normalizedName: normalizeText(input.organizationName),
    });
  await recordAudit(
    input.userId ?? "public",
    "submission.created",
    "submission",
    id,
    { kind: input.kind },
  );
  return id;
}

/** Proposals are tied to an account; each account may send 5 per day. */
export async function tooManyRecentSubmissions(userId: string) {
  await ensureDatabase();
  const [result] = await getDb()
    .select({ value: count() })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        sql`${submissions.createdAt} >= datetime('now', '-1 day')`,
      ),
    );
  return (result?.value ?? 0) >= 5;
}

export async function listPendingSubmissions(actorId?: string) {
  await ensureDatabase();
  const rows = await getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.status, "pending"))
    .orderBy(submissions.createdAt)
    .limit(100);
  if (actorId)
    await recordAudit(
      actorId,
      "admin.submission_queue_viewed",
      "system",
      "submission_queue",
      { count: rows.length },
    );
  return rows;
}

export async function getSubmissionById(id: string) {
  await ensureDatabase();
  return getDb().query.submissions.findFirst({ where: eq(submissions.id, id) });
}

export async function updateSubmissionStatus(
  actorId: string,
  id: string,
  status: string,
  reason: string,
) {
  await ensureDatabase();
  if (status !== "rejected") return false;
  return decideSubmission(actorId, id, "rejected", reason);
}

export async function approveSubmission(
  actorId: string,
  id: string,
  reason: string,
  organizationSlug?: string,
) {
  await ensureDatabase();
  return decideSubmission(actorId, id, "approved", reason, organizationSlug);
}

function decideSubmission(
  actorId: string,
  id: string,
  status: "approved" | "rejected",
  reason: string,
  organizationSlug?: string,
) {
  return getDb().transaction((tx) => {
    const submission = tx
      .select()
      .from(submissions)
      .where(eq(submissions.id, id))
      .get();
    if (!submission || submission.status !== "pending") return false;
    if (
      status === "approved" &&
      (submission.kind !== "claim" || !submission.userId || !organizationSlug)
    )
      return false;
    const now = new Date().toISOString();
    tx.update(submissions)
      .set({ status, updatedAt: now })
      .where(eq(submissions.id, id))
      .run();
    tx.insert(moderationDecisions)
      .values({
        id: crypto.randomUUID(),
        submissionId: id,
        actorId,
        status,
        reason,
        createdAt: now,
      })
      .run();
    if (status === "approved" && submission.userId && organizationSlug) {
      tx.insert(organizationMembers)
        .values({
          organizationSlug,
          userId: submission.userId,
          memberRole: "owner",
          status: "active",
          approvedBy: actorId,
          createdAt: now,
        })
        .onConflictDoUpdate({
          target: [
            organizationMembers.organizationSlug,
            organizationMembers.userId,
          ],
          set: { memberRole: "owner", status: "active", approvedBy: actorId },
        })
        .run();
    }
    tx.insert(auditEvents)
      .values({
        id: crypto.randomUUID(),
        actorId,
        action: `submission.${status}`,
        entityType: "submission",
        entityId: id,
        detailJson: JSON.stringify({ organizationSlug, reason }),
        createdAt: now,
      })
      .run();
    return true;
  });
}

export async function getPilotMetrics() {
  await ensureDatabase();
  const db = getDb();
  const [
    userCount,
    saveCount,
    applicationCount,
    submissionCount,
    progressedCount,
  ] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(savedOpportunities),
    db.select({ value: count() }).from(applications),
    db.select({ value: count() }).from(submissions),
    db
      .select({ value: count() })
      .from(applications)
      .where(
        inArray(applications.status, ["entrevista", "oferta", "seleccionada"]),
      ),
  ]);
  return {
    users: userCount[0]?.value ?? 0,
    saves: saveCount[0]?.value ?? 0,
    applications: applicationCount[0]?.value ?? 0,
    submissions: submissionCount[0]?.value ?? 0,
    progressed: progressedCount[0]?.value ?? 0,
  };
}

export async function exportUserData(userId: string) {
  await ensureDatabase();
  const db = getDb();
  const [
    userRecord,
    profile,
    saves,
    alerts,
    applicationRows,
    submissionRows,
    memberships,
    audits,
  ] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.talentProfiles.findFirst({
      where: eq(talentProfiles.userId, userId),
    }),
    db
      .select()
      .from(savedOpportunities)
      .where(eq(savedOpportunities.userId, userId)),
    db.select().from(savedSearches).where(eq(savedSearches.userId, userId)),
    db.select().from(applications).where(eq(applications.userId, userId)),
    db.select().from(submissions).where(eq(submissions.userId, userId)),
    db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId)),
    db.select().from(auditEvents).where(eq(auditEvents.actorId, userId)),
  ]);
  const applicationIds = applicationRows.map((application) => application.id);
  const events = applicationIds.length
    ? await db
        .select()
        .from(applicationEvents)
        .where(inArray(applicationEvents.applicationId, applicationIds))
    : [];
  return {
    exportedAt: new Date().toISOString(),
    account: userRecord ?? null,
    profile: profile ?? null,
    savedOpportunities: saves,
    alerts,
    notifications: getSqlite()
      .prepare(
        "SELECT id,search_id,opportunity_slug,created_at,read_at FROM alert_notifications WHERE user_id=?",
      )
      .all(userId),
    applications: applicationRows,
    applicationEvents: events,
    submissions: submissionRows,
    organizationMemberships: memberships,
    auditEvents: audits,
  };
}

export async function deleteUserData(userId: string) {
  await ensureDatabase();
  const client = getSqlite();
  const pseudonym = `deleted:${crypto.randomUUID()}`;
  client.transaction(() => {
    client
      .prepare(
        "DELETE FROM application_events WHERE application_id IN (SELECT id FROM applications WHERE user_id=?)",
      )
      .run(userId);
    client
      .prepare("UPDATE application_events SET actor=?, note='' WHERE actor=?")
      .run(pseudonym, userId);
    for (const table of [
      "applications",
      "saved_opportunities",
      "saved_searches",
      "alert_notifications",
      "talent_profiles",
      "organization_members",
    ])
      client.prepare(`DELETE FROM ${table} WHERE user_id=?`).run(userId);
    client
      .prepare(
        "UPDATE organization_members SET approved_by=? WHERE approved_by=?",
      )
      .run(pseudonym, userId);
    client
      .prepare(
        "UPDATE submissions SET user_id=NULL, contact_email='deleted@invalid.local', notes='', payload_json='{}' WHERE user_id=?",
      )
      .run(userId);
    client
      .prepare(
        "UPDATE moderation_decisions SET actor_id=?, reason='Cuenta eliminada' WHERE actor_id=?",
      )
      .run(pseudonym, userId);
    client
      .prepare(
        "UPDATE audit_events SET actor_id=?, detail_json='{}' WHERE actor_id=?",
      )
      .run(pseudonym, userId);
    client
      .prepare(
        "UPDATE audit_events SET entity_id=? WHERE entity_type='talent_profile' AND entity_id=?",
      )
      .run(pseudonym, userId);
    client.prepare("DELETE FROM users WHERE id=?").run(userId);
    client.prepare("DELETE FROM auth_user WHERE id=?").run(userId);
  })();
}

async function recordAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail: Record<string, unknown> = {},
) {
  await ensureDatabase();
  await getDb()
    .insert(auditEvents)
    .values({
      id: crypto.randomUUID(),
      actorId,
      action,
      entityType,
      entityId,
      detailJson: JSON.stringify(detail),
    });
}
