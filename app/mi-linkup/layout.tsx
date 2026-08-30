import type { ReactNode } from "react";
import { AccountNav } from "@/components/account-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function MyLinkUpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="account-main">
        <div className="account-layout">
          <aside className="account-sidebar">
            <AccountNav />
          </aside>
          <div className="account-content">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
