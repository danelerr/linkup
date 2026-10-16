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
import { getDb, type Transaction } from "@/db";
import {
  alertNotifications,
  applicationEvents,
  applications,
  auditEvents,
  authUser,
  moderationDecisions,
  organizationMembers,
  savedOpportunities,
  savedSearches,
  submissions,
  talentProfiles,
  users,
} from "@/db/schema";
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

const LAST_SEEN_RESOLUTION = 60 * 60 * 1000;

export async function syncUser(user: LinkUpUser) {
  const db = getDb();
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.userId));
  // Accounts created with an email code have no name until the person adds
  // one; show the start of their email meanwhile.
  const displayName =
    user.fullName || existingUser?.displayName || user.email.split("@")[0];
  // Most requests find nothing to change; skip the write unless the account
  // changed or the last visit is older than the resolution we keep.
  if (
    existingUser &&
    existingUser.email === user.email &&
    existingUser.displayName === displayName &&
    Date.now() - existingUser.lastSeenAt.getTime() < LAST_SEEN_RESOLUTION
  )
    return;
  const now = new Date();
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
      set: { email: user.email, displayName, updatedAt: now, lastSeenAt: now },
    });
  await db
    .insert(talentProfiles)
    .values({ userId: user.userId })
    .onConflictDoNothing({ target: talentProfiles.userId });
}

export async function getProfile(userId: string): Promise<TalentProfile> {
  const [row] = await getDb()
    .select()
    .from(talentProfiles)
    .where(eq(talentProfiles.userId, userId));
  if (!row) return emptyProfile;
  return {
    objective: row.objective,
    city: row.city,
    country: row.country,
    modality: row.modality,
    availability: row.availability,
    skills: row.skills,
    bio: row.bio,
    portfolioUrl: row.portfolioUrl,
    privacy: row.privacy,
    isAdult: row.isAdult,
    acceptedTermsAt: row.acceptedTermsAt?.toISOString() ?? null,
  };
}

export async function updateProfile(userId: string, input: ProfileInput) {
  const now = new Date();
  const values = {
    objective: input.objective,
    city: input.city,
    country: input.country,
    modality: input.modality,
    availability: input.availability,
    skills: input.skills,
    bio: input.bio,
    portfolioUrl: input.portfolioUrl,
    privacy: input.privacy,
    isAdult: input.isAdult,
    acceptedTermsAt: input.isAdult ? now : null,
    updatedAt: now,
  };
  await getDb()
    .insert(talentProfiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: talentProfiles.userId, set: values });
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
  const rows = await getDb()
    .select({ slug: savedOpportunities.opportunitySlug })
    .from(savedOpportunities)
    .where(
      and(
        eq(savedOpportunities.userId, userId),
        eq(savedOpportunities.opportunitySlug, opportunitySlug),
      ),
    );
  return rows.length > 0;
}

export async function setOpportunitySaved(
  userId: string,
  opportunitySlug: string,
  save: boolean,
) {
  const db = getDb();
  if (save)
    await db
      .insert(savedOpportunities)
      .values({ userId, opportunitySlug })
      .onConflictDoNothing({
        target: [savedOpportunities.userId, savedOpportunities.opportunitySlug],
      });
  else
    await db
      .delete(savedOpportunities)
      .where(
        and(
          eq(savedOpportunities.userId, userId),
          eq(savedOpportunities.opportunitySlug, opportunitySlug),
        ),
      );
  await recordAudit(
    userId,
    save ? "opportunity.saved" : "opportunity.unsaved",
    "opportunity",
    opportunitySlug,
  );
}

export async function listApplications(userId: string) {
  return getDb()
    .select()
    .from(applications)
    .where(eq(applications.userId, userId))
    .orderBy(desc(applications.updatedAt));
}

export async function getUserRole(userId: string) {
  const [row] = await getDb()
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId));
  return row?.role ?? "talent";
}

export async function listOrganizationMemberships(userId: string) {
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

async function organizationMemberRole(
  userId: string,
  organizationSlug: string,
) {
  const [row] = await getDb()
    .select({ memberRole: organizationMembers.memberRole })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationSlug, organizationSlug),
        eq(organizationMembers.status, "active"),
      ),
    );
  return row?.memberRole ?? null;
}

export async function hasOrganizationAccess(
  userId: string,
  organizationSlug: string,
) {
  const role = await getUserRole(userId);
  if (role === "admin" || role === "curator") return true;
  return (await organizationMemberRole(userId, organizationSlug)) !== null;
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
      answers: applications.answers,
      profileSnapshot: applications.profileSnapshot,
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
  const now = new Date();
  return getDb().transaction(async (tx) => {
    const changed = await tx
      .update(applications)
      .set({ status, updatedAt: now })
      .where(
        and(scope, notInArray(applications.status, closedApplicationStatuses)),
      )
      .returning({ id: applications.id });
    if (!changed.length) return false;
    await tx.insert(applicationEvents).values({
      id: crypto.randomUUID(),
      applicationId,
      status,
      actor: actorId,
      note,
      createdAt: now,
    });
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
  if (!opportunitySlugs.length) return false;
  const updated = await transitionApplication(
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
    { organizationSlug, status },
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
  const db = getDb();
  const now = new Date();
  const [created] = await db
    .insert(applications)
    .values({
      id: crypto.randomUUID(),
      userId: input.userId,
      opportunitySlug: input.opportunitySlug,
      mode: input.mode,
      status: "enviada",
      answers: input.answers,
      profileSnapshot:
        input.mode === "native"
          ? {
              ...input.profile,
              sharedAt: now.toISOString(),
              consent: "application",
            }
          : {},
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({
      target: [applications.userId, applications.opportunitySlug],
    })
    .returning();
  if (!created) {
    const [existing] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.userId, input.userId),
          eq(applications.opportunitySlug, input.opportunitySlug),
        ),
      );
    if (!existing) throw new Error("The application could not be persisted.");
    return { application: existing, created: false };
  }
  await db.insert(applicationEvents).values({
    id: crypto.randomUUID(),
    applicationId: created.id,
    status: "enviada",
    actor: input.userId,
    createdAt: now,
  });
  await recordAudit(
    input.userId,
    "application.created",
    "application",
    created.id,
    { opportunitySlug: input.opportunitySlug, mode: input.mode },
  );
  return { application: created, created: true };
}

export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  status: string,
  note = "",
) {
  const updated = await transitionApplication(
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
  const id = crypto.randomUUID();
  await getDb().insert(savedSearches).values({
    id,
    userId: input.userId,
    label: input.label,
    query: input.query,
    frequency: input.frequency,
  });
  await recordAudit(input.userId, "alert.created", "saved_search", id);
  return id;
}

export async function deleteSavedSearch(userId: string, id: string) {
  await getDb().transaction(async (tx) => {
    await tx
      .delete(savedSearches)
      .where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
    await tx
      .delete(alertNotifications)
      .where(
        and(
          eq(alertNotifications.searchId, id),
          eq(alertNotifications.userId, userId),
        ),
      );
  });
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
  const [result] = await getDb()
    .select({ value: count() })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        sql`${submissions.createdAt} >= now() - interval '1 day'`,
      ),
    );
  return (result?.value ?? 0) >= 5;
}

export async function listPendingSubmissions(actorId?: string) {
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
  const [row] = await getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.id, id));
  return row;
}

export async function updateSubmissionStatus(
  actorId: string,
  id: string,
  status: string,
  reason: string,
) {
  if (status !== "rejected") return false;
  return decideSubmission(actorId, id, "rejected", reason);
}

export async function approveSubmission(
  actorId: string,
  id: string,
  reason: string,
  organizationSlug?: string,
) {
  return decideSubmission(actorId, id, "approved", reason, organizationSlug);
}

function decideSubmission(
  actorId: string,
  id: string,
  status: "approved" | "rejected",
  reason: string,
  organizationSlug?: string,
) {
  return getDb().transaction(async (tx) => {
    // Locked so two moderators cannot both decide the same proposal.
    const [submission] = await tx
      .select()
      .from(submissions)
      .where(eq(submissions.id, id))
      .for("update");
    if (!submission || submission.status !== "pending") return false;
    if (
      status === "approved" &&
      (submission.kind !== "claim" || !submission.userId || !organizationSlug)
    )
      return false;
    const now = new Date();
    await tx
      .update(submissions)
      .set({ status, updatedAt: now })
      .where(eq(submissions.id, id));
    await tx.insert(moderationDecisions).values({
      id: crypto.randomUUID(),
      submissionId: id,
      actorId,
      status,
      reason,
      createdAt: now,
    });
    if (status === "approved" && submission.userId && organizationSlug)
      await tx
        .insert(organizationMembers)
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
        });
    await tx.insert(auditEvents).values({
      id: crypto.randomUUID(),
      actorId,
      action: `submission.${status}`,
      entityType: "submission",
      entityId: id,
      detail: { organizationSlug, reason },
      createdAt: now,
    });
    return true;
  });
}

export async function getPilotMetrics() {
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
  const db = getDb();
  const [
    [account],
    [profile],
    saves,
    alerts,
    notifications,
    applicationRows,
    submissionRows,
    memberships,
    audits,
  ] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)),
    db.select().from(talentProfiles).where(eq(talentProfiles.userId, userId)),
    db
      .select()
      .from(savedOpportunities)
      .where(eq(savedOpportunities.userId, userId)),
    db.select().from(savedSearches).where(eq(savedSearches.userId, userId)),
    db
      .select({
        id: alertNotifications.id,
        searchId: alertNotifications.searchId,
        opportunitySlug: alertNotifications.opportunitySlug,
        createdAt: alertNotifications.createdAt,
        readAt: alertNotifications.readAt,
      })
      .from(alertNotifications)
      .where(eq(alertNotifications.userId, userId)),
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
    account: account ?? null,
    profile: profile ?? null,
    savedOpportunities: saves,
    alerts,
    notifications,
    applications: applicationRows,
    applicationEvents: events,
    submissions: submissionRows,
    organizationMemberships: memberships,
    auditEvents: audits,
  };
}

/**
 * Serializes, until the transaction ends, every change that could leave a
 * startup without an active owner: team edits and account deletions.
 */
async function lockOrganizationOwners(
  tx: Transaction,
  organizationSlug: string,
) {
  await tx.execute(
    sql`SELECT pg_advisory_xact_lock(hashtext(${`organization-owners:${organizationSlug}`}))`,
  );
}

export async function deleteUserData(userId: string) {
  const pseudonym = `deleted:${crypto.randomUUID()}`;
  return getDb().transaction(async (tx) => {
    // Lock every startup this person belongs to before checking ownership,
    // so two owners closing their accounts at once cannot both rely on the
    // other remaining. Sorted, so concurrent deletions take locks in order.
    const memberships = await tx
      .select({ slug: organizationMembers.organizationSlug })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
      .orderBy(organizationMembers.organizationSlug);
    for (const membership of memberships)
      await lockOrganizationOwners(tx, membership.slug);
    // A recruiter or an inactive owner cannot take over; the person must
    // choose a new owner first.
    const { rows: organizations } = await tx.execute<{
      slug: string;
      name: string;
    }>(sql`
      SELECT m.organization_slug AS slug,
        COALESCE(o.name, m.organization_slug) AS name
      FROM organization_members m
      LEFT JOIN catalog_organizations o ON o.slug = m.organization_slug
      WHERE m.user_id = ${userId} AND m.member_role = 'owner'
        AND m.status = 'active'
        AND NOT EXISTS (
          SELECT 1 FROM organization_members other
          WHERE other.organization_slug = m.organization_slug
            AND other.user_id <> m.user_id
            AND other.member_role = 'owner' AND other.status = 'active'
        )
      ORDER BY name, slug`);
    if (organizations.length) return { deleted: false as const, organizations };
    const ownApplications = tx
      .select({ id: applications.id })
      .from(applications)
      .where(eq(applications.userId, userId));
    await tx
      .delete(applicationEvents)
      .where(inArray(applicationEvents.applicationId, ownApplications));
    await tx
      .update(applicationEvents)
      .set({ actor: pseudonym, note: "" })
      .where(eq(applicationEvents.actor, userId));
    await tx.delete(applications).where(eq(applications.userId, userId));
    await tx
      .delete(savedOpportunities)
      .where(eq(savedOpportunities.userId, userId));
    await tx.delete(savedSearches).where(eq(savedSearches.userId, userId));
    await tx
      .delete(alertNotifications)
      .where(eq(alertNotifications.userId, userId));
    await tx.delete(talentProfiles).where(eq(talentProfiles.userId, userId));
    await tx
      .delete(organizationMembers)
      .where(eq(organizationMembers.userId, userId));
    await tx
      .update(organizationMembers)
      .set({ approvedBy: pseudonym })
      .where(eq(organizationMembers.approvedBy, userId));
    await tx
      .update(submissions)
      .set({
        userId: null,
        contactEmail: "deleted@invalid.local",
        notes: "",
        payload: {},
      })
      .where(eq(submissions.userId, userId));
    await tx
      .update(moderationDecisions)
      .set({ actorId: pseudonym, reason: "Cuenta eliminada" })
      .where(eq(moderationDecisions.actorId, userId));
    await tx
      .update(auditEvents)
      .set({ actorId: pseudonym, detail: {} })
      .where(eq(auditEvents.actorId, userId));
    await tx
      .update(auditEvents)
      .set({ entityId: pseudonym })
      .where(
        and(
          eq(auditEvents.entityType, "talent_profile"),
          eq(auditEvents.entityId, userId),
        ),
      );
    await tx.delete(users).where(eq(users.id, userId));
    // Sessions and sign-in methods go with the account (ON DELETE CASCADE).
    await tx.delete(authUser).where(eq(authUser.id, userId));
    return { deleted: true as const };
  });
}

async function recordAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail: Record<string, unknown> = {},
) {
  await getDb().insert(auditEvents).values({
    id: crypto.randomUUID(),
    actorId,
    action,
    entityType,
    entityId,
    detail,
  });
}

export type UserRole = "talent" | "curator" | "admin";
export type MemberRole = "owner" | "recruiter" | "viewer";

/**
 * Finds a LinkUp account by email and makes sure it has a users row, so a
 * role or membership can be given to someone who signed up but never synced.
 */
export async function findAccountByEmail(email: string) {
  const [account] = await getDb()
    .select({ id: authUser.id, name: authUser.name, email: authUser.email })
    .from(authUser)
    .where(eq(sql`lower(${authUser.email})`, email.trim().toLowerCase()));
  if (!account) return null;
  await syncUser({
    userId: account.id,
    displayName: account.name,
    email: account.email,
    fullName: account.name,
  });
  return account;
}

export async function listOperators() {
  return getDb()
    .select({
      userId: users.id,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.role, ["admin", "curator"]))
    .orderBy(users.role, users.displayName);
}

export async function setUserRole(
  actorId: string,
  userId: string,
  role: UserRole,
) {
  const now = new Date();
  await getDb().transaction(async (tx) => {
    await tx
      .update(users)
      .set({ role, updatedAt: now })
      .where(eq(users.id, userId));
    await tx.insert(auditEvents).values({
      id: crypto.randomUUID(),
      actorId,
      action: "user.role_changed",
      entityType: "user",
      entityId: userId,
      detail: { role },
      createdAt: now,
    });
  });
}

async function activeOwnerCount(tx: Transaction, organizationSlug: string) {
  const [result] = await tx
    .select({ value: count() })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationSlug, organizationSlug),
        eq(organizationMembers.memberRole, "owner"),
        eq(organizationMembers.status, "active"),
      ),
    );
  return result?.value ?? 0;
}

/** Adds someone to a startup's team or changes their role. */
export async function saveOrganizationMember(
  actorId: string,
  organizationSlug: string,
  userId: string,
  memberRole: MemberRole,
) {
  const now = new Date();
  return getDb().transaction(async (tx) => {
    await lockOrganizationOwners(tx, organizationSlug);
    const [current] = await tx
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationSlug, organizationSlug),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "active"),
        ),
      );
    // A startup always keeps someone who can manage it.
    if (
      current?.memberRole === "owner" &&
      memberRole !== "owner" &&
      (await activeOwnerCount(tx, organizationSlug)) <= 1
    )
      return "last_owner" as const;
    await tx
      .insert(organizationMembers)
      .values({
        organizationSlug,
        userId,
        memberRole,
        status: "active",
        approvedBy: actorId,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: [
          organizationMembers.organizationSlug,
          organizationMembers.userId,
        ],
        set: { memberRole, status: "active", approvedBy: actorId },
      });
    await tx.insert(auditEvents).values({
      id: crypto.randomUUID(),
      actorId,
      action: current
        ? "organization.member_role_changed"
        : "organization.member_added",
      entityType: "organization",
      entityId: organizationSlug,
      detail: { userId, memberRole },
      createdAt: now,
    });
    return current ? ("updated" as const) : ("added" as const);
  });
}

export async function removeOrganizationMember(
  actorId: string,
  organizationSlug: string,
  userId: string,
) {
  const now = new Date();
  return getDb().transaction(async (tx) => {
    await lockOrganizationOwners(tx, organizationSlug);
    const [current] = await tx
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationSlug, organizationSlug),
          eq(organizationMembers.userId, userId),
        ),
      );
    if (!current) return "not_found" as const;
    if (
      current.memberRole === "owner" &&
      current.status === "active" &&
      (await activeOwnerCount(tx, organizationSlug)) <= 1
    )
      return "last_owner" as const;
    await tx
      .delete(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationSlug, organizationSlug),
          eq(organizationMembers.userId, userId),
        ),
      );
    await tx.insert(auditEvents).values({
      id: crypto.randomUUID(),
      actorId,
      action: "organization.member_removed",
      entityType: "organization",
      entityId: organizationSlug,
      detail: { userId, memberRole: current.memberRole },
      createdAt: now,
    });
    return "removed" as const;
  });
}
