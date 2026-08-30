import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="app-main simple-state">
        <p className="eyebrow">404</p>
        <h1>No encontramos esta página.</h1>
        <p>Puede que el enlace haya cambiado o el contenido ya no esté disponible.</p>
        <Link className="button-primary" href="/">Volver a explorar</Link>
      </main>
    </div>
  );
}
