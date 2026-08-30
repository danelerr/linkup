import { env } from "cloudflare:workers";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { getDb } from "@/db";
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
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function syncUser(user: ChatGPTUser) {
  await ensureDatabase();
  const db = getDb();
  const now = new Date().toISOString();
  const adminEmails = (env.LINKUP_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLocaleLowerCase())
    .filter(Boolean);
  const initialRole = adminEmails.includes(user.email.toLocaleLowerCase()) ? "admin" : "talent";
  const existingUser = await db.query.users.findFirst({ where: eq(users.id, user.userId) });
  const displayName = user.fullName ?? existingUser?.displayName ?? user.email;
  await db
    .insert(users)
    .values({
      id: user.userId,
      email: user.email,
      displayName,
      role: initialRole,
      updatedAt: now,
      lastSeenAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: user.email,
        displayName,
        ...(initialRole === "admin" ? { role: "admin" } : {}),
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
  const row = await getDb().query.talentProfiles.findFirst({ where: eq(talentProfiles.userId, userId) });
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

export async function isOpportunitySaved(userId: string, opportunitySlug: string) {
  await ensureDatabase();
  const row = await getDb().query.savedOpportunities.findFirst({
    where: and(
      eq(savedOpportunities.userId, userId),
      eq(savedOpportunities.opportunitySlug, opportunitySlug),
    ),
  });
  return Boolean(row);
}

export async function setOpportunitySaved(userId: string, opportunitySlug: string, save: boolean) {
  await ensureDatabase();
  const db = getDb();
  if (save) {
    await db
      .insert(savedOpportunities)
      .values({ userId, opportunitySlug })
      .onConflictDoNothing({ target: [savedOpportunities.userId, savedOpportunities.opportunitySlug] });
  } else {
    await db
      .delete(savedOpportunities)
      .where(and(eq(savedOpportunities.userId, userId), eq(savedOpportunities.opportunitySlug, opportunitySlug)));
  }
  await recordAudit(userId, save ? "opportunity.saved" : "opportunity.unsaved", "opportunity", opportunitySlug);
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
  const row = await getDb().query.users.findFirst({ where: eq(users.id, userId) });
  return row?.role ?? "talent";
}

export async function listOrganizationMemberships(userId: string) {
  await ensureDatabase();
  return getDb()
    .select()
    .from(organizationMembers)
    .where(and(eq(organizationMembers.userId, userId), eq(organizationMembers.status, "active")));
}

export async function hasOrganizationAccess(userId: string, organizationSlug: string) {
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

async function organizationMemberRole(userId: string, organizationSlug: string) {
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

export async function hasOrganizationCandidateAccess(userId: string, organizationSlug: string) {
  const role = await getUserRole(userId);
  if (role === "admin") return true;
  const memberRole = await organizationMemberRole(userId, organizationSlug);
  return memberRole === "owner" || memberRole === "recruiter";
}

export async function hasOrganizationOwnerAccess(userId: string, organizationSlug: string) {
  const role = await getUserRole(userId);
  if (role === "admin") return true;
  return (await organizationMemberRole(userId, organizationSlug)) === "owner";
}

export async function countOrganizationApplications(opportunitySlugs: string[]) {
  await ensureDatabase();
  if (!opportunitySlugs.length) return 0;
  const [result] = await getDb()
    .select({ value: count() })
    .from(applications)
    .where(and(eq(applications.mode, "native"), inArray(applications.opportunitySlug, opportunitySlugs)));
  return result?.value ?? 0;
}

export async function countOrganizationMembers(organizationSlug: string) {
  await ensureDatabase();
  const [result] = await getDb()
    .select({ value: count() })
    .from(organizationMembers)
    .where(and(eq(organizationMembers.organizationSlug, organizationSlug), eq(organizationMembers.status, "active")));
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

export async function listOrganizationApplications(organizationSlug: string, opportunitySlugs: string[], actorId?: string) {
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
    .where(and(eq(applications.mode, "native"), inArray(applications.opportunitySlug, opportunitySlugs)))
    .orderBy(desc(applications.updatedAt));
  if (actorId) await recordAudit(actorId, "organization.candidates_viewed", "organization", organizationSlug, { count: rows.length });
  return rows;
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
  const db = getDb();
  const row = await db.query.applications.findFirst({
    where: and(eq(applications.id, applicationId), inArray(applications.opportunitySlug, opportunitySlugs)),
  });
  if (!row || row.mode !== "native") return false;
  if (["seleccionada", "no_continua", "retirada"].includes(row.status)) return false;
  const now = new Date().toISOString();
  await db.update(applications).set({ status, updatedAt: now }).where(eq(applications.id, applicationId));
  await db.insert(applicationEvents).values({
    id: crypto.randomUUID(),
    applicationId,
    status,
    actor: actorId,
    note,
    createdAt: now,
  });
  await recordAudit(actorId, "organization.application_status_updated", "application", applicationId, {
    organizationSlug,
    status,
  });
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
    where: and(eq(applications.userId, input.userId), eq(applications.opportunitySlug, input.opportunitySlug)),
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
    profileSnapshotJson: JSON.stringify(input.profile),
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(applications).values(application).onConflictDoNothing({
    target: [applications.userId, applications.opportunitySlug],
  });
  const stored = await db.query.applications.findFirst({
    where: and(eq(applications.userId, input.userId), eq(applications.opportunitySlug, input.opportunitySlug)),
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
  const db = getDb();
  const application = await db.query.applications.findFirst({
    where: and(eq(applications.id, applicationId), eq(applications.userId, userId)),
  });
  if (!application) return false;
  if (["seleccionada", "no_continua", "retirada"].includes(application.status)) return false;
  const now = new Date().toISOString();
  await db.update(applications).set({ status, updatedAt: now }).where(eq(applications.id, applicationId));
  await db.insert(applicationEvents).values({
    id: crypto.randomUUID(),
    applicationId,
    status,
    actor: userId,
    note,
    createdAt: now,
  });
  await recordAudit(userId, "application.status_updated", "application", applicationId, { status });
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
  await getDb().insert(savedSearches).values({
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
  await getDb().delete(savedSearches).where(and(eq(savedSearches.id, id), eq(savedSearches.userId, userId)));
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
  await getDb().insert(submissions).values({ id, ...input });
  await recordAudit(input.userId ?? "public", "submission.created", "submission", id, { kind: input.kind });
  return id;
}

export async function tooManyRecentSubmissions(contactEmail: string) {
  await ensureDatabase();
  const [result] = await getDb()
    .select({ value: count() })
    .from(submissions)
    .where(and(eq(submissions.contactEmail, contactEmail), sql`${submissions.createdAt} >= datetime('now', '-1 day')`));
  return (result?.value ?? 0) >= 5;
}

export async function listPendingSubmissions(actorId?: string) {
  await ensureDatabase();
  const rows = await getDb().select().from(submissions).orderBy(desc(submissions.createdAt));
  if (actorId) await recordAudit(actorId, "admin.submission_queue_viewed", "system", "submission_queue", { count: rows.length });
  return rows;
}

export async function getSubmissionById(id: string) {
  await ensureDatabase();
  return getDb().query.submissions.findFirst({ where: eq(submissions.id, id) });
}

export async function updateSubmissionStatus(actorId: string, id: string, status: string, reason: string) {
  await ensureDatabase();
  const now = new Date().toISOString();
  const db = getDb();
  await db.update(submissions).set({ status, updatedAt: now }).where(eq(submissions.id, id));
  await db.insert(moderationDecisions).values({ id: crypto.randomUUID(), submissionId: id, actorId, status, reason, createdAt: now });
  await recordAudit(actorId, "submission.status_updated", "submission", id, { status, reason });
}

export async function approveSubmission(actorId: string, id: string, reason: string, organizationSlug?: string) {
  await ensureDatabase();
  const db = getDb();
  const submission = await db.query.submissions.findFirst({ where: eq(submissions.id, id) });
  if (!submission) return false;
  if (submission.kind === "claim" && (!submission.userId || !organizationSlug)) return false;
  const now = new Date().toISOString();
  await db.update(submissions).set({ status: "approved", updatedAt: now }).where(eq(submissions.id, id));
  await db.insert(moderationDecisions).values({ id: crypto.randomUUID(), submissionId: id, actorId, status: "approved", reason, createdAt: now });
  if (submission.kind === "claim" && submission.userId && organizationSlug) {
    await db
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
        target: [organizationMembers.organizationSlug, organizationMembers.userId],
        set: { memberRole: "owner", status: "active", approvedBy: actorId },
      });
  }
  await recordAudit(actorId, "submission.approved", "submission", id, { organizationSlug, reason });
  return true;
}

export async function getPilotMetrics() {
  await ensureDatabase();
  const db = getDb();
  const [userCount, saveCount, applicationCount, submissionCount, progressedCount] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(savedOpportunities),
    db.select({ value: count() }).from(applications),
    db.select({ value: count() }).from(submissions),
    db.select({ value: count() }).from(applications).where(inArray(applications.status, ["entrevista", "oferta", "seleccionada"])),
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
  const [userRecord, profile, saves, alerts, applicationRows, submissionRows, memberships, audits] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.talentProfiles.findFirst({ where: eq(talentProfiles.userId, userId) }),
    db.select().from(savedOpportunities).where(eq(savedOpportunities.userId, userId)),
    db.select().from(savedSearches).where(eq(savedSearches.userId, userId)),
    db.select().from(applications).where(eq(applications.userId, userId)),
    db.select().from(submissions).where(eq(submissions.userId, userId)),
    db.select().from(organizationMembers).where(eq(organizationMembers.userId, userId)),
    db.select().from(auditEvents).where(eq(auditEvents.actorId, userId)),
  ]);
  const applicationIds = applicationRows.map((application) => application.id);
  const events = applicationIds.length
    ? await db.select().from(applicationEvents).where(inArray(applicationEvents.applicationId, applicationIds))
    : [];
  return {
    exportedAt: new Date().toISOString(),
    account: userRecord ?? null,
    profile: profile ?? null,
    savedOpportunities: saves,
    alerts,
    applications: applicationRows,
    applicationEvents: events,
    submissions: submissionRows,
    organizationMemberships: memberships,
    auditEvents: audits,
  };
}

export async function deleteUserData(userId: string) {
  await ensureDatabase();
  const db = getDb();
  const pseudonym = `deleted:${crypto.randomUUID()}`;
  const applicationRows = await db.select({ id: applications.id }).from(applications).where(eq(applications.userId, userId));
  const applicationIds = applicationRows.map((application) => application.id);
  if (applicationIds.length) await db.delete(applicationEvents).where(inArray(applicationEvents.applicationId, applicationIds));
  await db.delete(applications).where(eq(applications.userId, userId));
  await db.delete(savedOpportunities).where(eq(savedOpportunities.userId, userId));
  await db.delete(savedSearches).where(eq(savedSearches.userId, userId));
  await db.delete(talentProfiles).where(eq(talentProfiles.userId, userId));
  await db.delete(organizationMembers).where(eq(organizationMembers.userId, userId));
  await db
    .update(organizationMembers)
    .set({ approvedBy: pseudonym })
    .where(eq(organizationMembers.approvedBy, userId));
  await db
    .update(submissions)
    .set({ userId: null, contactEmail: "deleted@invalid.local", notes: "" })
    .where(eq(submissions.userId, userId));
  await db.update(moderationDecisions).set({ actorId: pseudonym }).where(eq(moderationDecisions.actorId, userId));
  await db.update(auditEvents).set({ actorId: pseudonym }).where(eq(auditEvents.actorId, userId));
  await db
    .update(auditEvents)
    .set({ entityId: pseudonym })
    .where(and(eq(auditEvents.entityType, "talent_profile"), eq(auditEvents.entityId, userId)));
  await db.delete(users).where(eq(users.id, userId));
}

async function recordAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail: Record<string, unknown> = {},
) {
  await ensureDatabase();
  await getDb().insert(auditEvents).values({
    id: crypto.randomUUID(),
    actorId,
    action,
    entityType,
    entityId,
    detailJson: JSON.stringify(detail),
  });
}
