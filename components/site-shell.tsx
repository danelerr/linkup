import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { containerClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

/** Public page frame: header, centered main content and footer. */
export function SiteShell({
  children,
  className,
  actionBar = false,
}: {
  children: ReactNode;
  className?: string;
  /**
   * The page shows OpportunityActions, fixed to the bottom on phones. Leave
   * room for it below the footer so it never covers the footer links.
   */
  actionBar?: boolean;
}) {
  return (
    <div
      className={cx(
        "flex min-h-dvh flex-col",
        actionBar &&
          "max-lg:pb-[calc(3.5rem_+_1px_+_max(0.75rem,env(safe-area-inset-bottom)))]",
      )}
    >
      <SiteHeader />
      <main
        id="main-content"
        className={cx(containerClass, "flex-1", className)}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
