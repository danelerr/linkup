import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { containerClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

/** Public page frame: header, centered main content and footer. */
export function SiteShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
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
