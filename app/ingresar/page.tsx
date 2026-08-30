import type { Metadata } from "next";
import { Bookmark, BriefcaseBusiness, Bell } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false, follow: false } };

export default function SignInPage() {
  return (
    <main className="signin-page">
      <Brand />
      <div className="signin-panel">
        <p className="eyebrow">Tu espacio privado</p>
        <h1>Continúa donde lo dejaste.</h1>
        <p>Explorar siempre es público. Ingresa solo cuando quieras conservar o gestionar una acción.</p>
        <ul>
          <li><Bookmark size={17} aria-hidden="true" /> Guardar oportunidades</li>
          <li><Bell size={17} aria-hidden="true" /> Crear alertas</li>
          <li><BriefcaseBusiness size={17} aria-hidden="true" /> Seguir postulaciones</li>
        </ul>
        <Link className="button-primary" href="/signin-with-chatgpt?return_to=%2Fmi-linkup">Ingresar de forma segura</Link>
        <Link className="signin-back" href="/">Seguir explorando sin cuenta</Link>
      </div>
    </main>
  );
}
