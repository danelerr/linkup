import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { containerClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

/** Private areas: section navigation beside (desktop) or above (phone). */
export function WorkspaceShell({
  nav,
  heading,
  children,
}: {
  nav: ReactNode;
  heading?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main
        id="main-content"
        className={cx(containerClass, "flex-1 pt-5 pb-24 sm:pt-10")}
      >
        {heading}
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            {nav}
          </aside>
          <div className="max-w-[820px] min-w-0">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
