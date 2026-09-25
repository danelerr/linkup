"use client";
import Link from "next/link";
import { buttonClass, textLinkClass } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      className="grid min-h-dvh place-items-center px-4 py-24"
    >
      <div className="max-w-lg text-center">
        <h1 className="text-[2rem] leading-tight font-semibold tracking-[-0.04em]">
          No pudimos cargar esta página.
        </h1>
        <p className="mt-3 text-base leading-7 text-body">
          Intenta otra vez. Lo que ya guardaste se conserva.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <button className={buttonClass()} type="button" onClick={reset}>
            Volver a intentar
          </button>
          <Link className={textLinkClass} href="/">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
