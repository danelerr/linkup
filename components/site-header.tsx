import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Brand } from "@/components/brand";
import { buttonClass } from "@/components/ui/button";
import { containerClass } from "@/components/ui/layout";
import { cx } from "@/lib/cx";

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1)
    return `${parts[0][0]}${parts.at(-1)?.[0]}`.toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-canvas/90 backdrop-blur-md">
      <div
        className={cx(
          containerClass,
          "flex h-14 items-center justify-between sm:h-[68px]",
        )}
      >
        <Brand />
        <nav
          className="flex items-center gap-1 text-sm font-semibold sm:gap-2"
          aria-label="Navegación principal"
        >
          <Link
            className="rounded-full px-3 py-2 text-muted transition-colors hover:text-action"
            href="/agregar"
          >
            Agregar
          </Link>
          {user ? (
            <Link
              className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition-colors hover:bg-surface sm:pr-3"
              href="/mi-linkup"
              aria-label={`Abrir mi LinkUp, ${user.displayName}`}
            >
              <span
                className="grid size-8 place-items-center rounded-full border border-line bg-surface font-meta text-xs font-semibold text-action"
                aria-hidden="true"
              >
                {initials(user.displayName)}
              </span>
              <span className="hidden sm:inline">Mi LinkUp</span>
            </Link>
          ) : (
            <Link
              className={buttonClass({
                variant: "secondary",
                size: "sm",
                className: "rounded-full",
              })}
              href="/ingresar"
            >
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
