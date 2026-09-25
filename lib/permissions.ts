import { notFound } from "next/navigation";
import { requireSyncedUser } from "@/lib/current-user";
import {
  getUserRole,
  hasOrganizationAccess,
  hasOrganizationCandidateAccess,
  hasOrganizationOwnerAccess,
} from "@/lib/user-data";

export async function requireOperator(returnTo: string) {
  const user = await requireSyncedUser(returnTo);
  const role = await getUserRole(user.userId);
  if (role !== "admin" && role !== "curator") notFound();
  return { user, role };
}

export async function requireOrganizationMember(
  returnTo: string,
  organizationSlug: string,
) {
  const user = await requireSyncedUser(returnTo);
  if (!(await hasOrganizationAccess(user.userId, organizationSlug))) notFound();
  return user;
}

export async function requireOrganizationRecruiter(
  returnTo: string,
  organizationSlug: string,
) {
  const user = await requireSyncedUser(returnTo);
  if (!(await hasOrganizationCandidateAccess(user.userId, organizationSlug)))
    notFound();
  return user;
}

export async function requireOrganizationOwner(
  returnTo: string,
  organizationSlug: string,
) {
  const user = await requireSyncedUser(returnTo);
  if (!(await hasOrganizationOwnerAccess(user.userId, organizationSlug)))
    notFound();
  return user;
}
