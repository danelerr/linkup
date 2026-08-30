import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p>Vista piloto · Los registros actuales son demostrativos.</p>
        <nav aria-label="Información">
          <Link href="/confianza">Cómo verificamos</Link>
          <Link href="/agregar">Agregar información</Link>
        </nav>
      </div>
    </footer>
  );
}
