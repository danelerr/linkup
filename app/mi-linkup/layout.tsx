import type { ReactNode } from "react";
import { AccountNav } from "@/components/account-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { WorkspaceShell } from "@/components/workspace-shell";

export default async function MyLinkUpLayout({
  children,
}: {
  children: ReactNode;
}) {
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
