import Link from "next/link";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { Brand } from "@/components/brand";

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts.at(-1)?.[0]}`.toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

export async function SiteHeader() {
  const user = await getChatGPTUser();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="header-actions" aria-label="Navegación principal">
          <Link className="header-add" href="/agregar">
            Agregar
          </Link>
          {user ? (
            <Link className="account-link" href="/mi-linkup" aria-label={`Abrir mi LinkUp, ${user.displayName}`}>
              <span className="account-avatar" aria-hidden="true">
                {initials(user.displayName)}
              </span>
              <span className="account-label">Mi LinkUp</span>
            </Link>
          ) : (
            <Link className="sign-in-link" href="/ingresar">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
