import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { AccountDataActions } from "@/components/account-data-actions";
import { requireSyncedUser } from "@/lib/current-user";
import { getProfile } from "@/lib/user-data";
import { safeRelativeReturnPath } from "@/app/chatgpt-auth";

export const metadata: Metadata = { title: "Perfil", robots: { index: false, follow: false } };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ return_to?: string }> }) {
  const user = await requireSyncedUser("/mi-linkup/perfil");
  const params = await searchParams;
  const returnTo = params.return_to ? safeRelativeReturnPath(params.return_to) : undefined;
  const profile = await getProfile(user.userId);
  return (
    <div className="account-page">
      <header className="account-heading">
        <p className="eyebrow">Perfil privado</p>
        <h1>Tu punto de partida.</h1>
        <p>Completa solo lo necesario para encontrar y explicar un buen encaje.</p>
      </header>
      <ProfileForm initialProfile={profile} returnTo={returnTo} />
      <AccountDataActions />
    </div>
  );
}
