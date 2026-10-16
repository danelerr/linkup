import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Brand } from "@/components/brand";
import { HeaderLink } from "@/components/header-link";
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
          {/* On phones the logo already leads to Explorar. */}
          <HeaderLink className="max-sm:hidden" href="/" exact>
            Explorar
          </HeaderLink>
          <HeaderLink href="/para-ti">Para ti</HeaderLink>
          {user ? (
            <>
              <HeaderLink className="max-sm:hidden" href="/agregar">
                Agregar
              </HeaderLink>
              <Link
                className="ml-1 grid size-9 place-items-center rounded-full border border-line bg-surface font-meta text-xs font-semibold text-action transition-colors hover:border-action/40"
                href="/para-ti/perfil"
                aria-label={`Tu perfil, ${user.displayName}`}
              >
                {initials(user.displayName)}
              </Link>
            </>
          ) : (
            <Link
              className={buttonClass({
                variant: "secondary",
                size: "sm",
                className: "ml-1 rounded-full",
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
