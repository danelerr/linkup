import type { ReactNode } from "react";
import { AccountNav } from "@/components/account-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteShell } from "@/components/site-shell";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getCurrentUser } from "@/lib/session";

export default async function ForYouLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Without a session, /para-ti explains what is here and the other
  // sections send to sign-in, so there is no section navigation to show.
  if (!(await getCurrentUser())) return <SiteShell>{children}</SiteShell>;
  return (
    <WorkspaceShell
      nav={
        <AccountNav>
          <SignOutButton />
        </AccountNav>
      }
    >
      {children}
    </WorkspaceShell>
  );
}
