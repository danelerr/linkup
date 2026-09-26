import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { AccountDataActions } from "@/components/account-data-actions";
import { ChangePasswordForm } from "@/components/change-password-form";
import { PageHeader } from "@/components/ui/layout";
import { requireSyncedUser } from "@/lib/current-user";
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
  const user = await requireSyncedUser("/mi-linkup/perfil");
  const params = await searchParams;
  const returnTo = params.return_to
    ? safeRelativeReturnPath(params.return_to)
    : undefined;
  const profile = await getProfile(user.userId);
  return (
    <div className="grid gap-10">
      <PageHeader
        eyebrow="Perfil privado"
        title="Tu punto de partida."
        description="Completa solo lo necesario para encontrar y explicar un buen encaje."
      />
      <ProfileForm initialProfile={profile} returnTo={returnTo} />
      <ChangePasswordForm />
      <AccountDataActions />
    </div>
  );
}
