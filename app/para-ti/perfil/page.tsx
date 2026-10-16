import type { Metadata } from "next";
import { headers } from "next/headers";
import { ProfileForm } from "@/components/profile-form";
import { AccountDataActions } from "@/components/account-data-actions";
import { ChangePasswordForm } from "@/components/change-password-form";
import { PageHeader } from "@/components/ui/layout";
import { getAuth } from "@/lib/auth";
import { requireSyncedUser } from "@/lib/current-user";
import { emailEnabled } from "@/lib/email";
import { getProfile } from "@/lib/user-data";
import { safeRelativeReturnPath } from "@/lib/session";

export const metadata: Metadata = {
  title: "Perfil",
  robots: { index: false, follow: false },
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const user = await requireSyncedUser("/para-ti/perfil");
  const params = await searchParams;
  const returnTo = params.return_to
    ? safeRelativeReturnPath(params.return_to)
    : undefined;
  const profile = await getProfile(user.userId);
  // Accounts created with an email code start without a password.
  const accounts = await (
    await getAuth()
  ).api.listUserAccounts({ headers: await headers() });
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  );
  return (
    <div className="grid gap-10">
      <PageHeader
        title="Perfil"
        description="Es privado. Solo lo ve una startup cuando postulas a ella dentro de LinkUp."
      />
      <ProfileForm initialProfile={profile} returnTo={returnTo} />
      <ChangePasswordForm
        email={user.email}
        hasPassword={hasPassword}
        emailCodes={emailEnabled()}
      />
      <AccountDataActions />
    </div>
  );
}
