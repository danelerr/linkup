import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/cx";

/**
 * LinkUp lockup: the "lU" symbol and the wordmark with "Up" in the brand's
 * teal. `dark` is the version for navy backgrounds.
 */
export function Brand({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <Link
      className="inline-flex items-center gap-2 rounded-lg"
      href="/"
      aria-label="LinkUp, inicio"
    >
      <Image
        src={dark ? "/marca/simbolo-blanco.svg" : "/marca/simbolo.svg"}
        alt=""
        width={31}
        height={32}
        priority={!dark}
        unoptimized
        className="h-8 w-auto"
      />
      <span
        className={cx(
          "font-display text-[1.375rem] leading-none font-extrabold tracking-[-0.02em]",
          dark ? "text-white" : "text-navy",
        )}
      >
        Link<span className={dark ? "text-cyan" : "text-teal"}>Up</span>
      </span>
    </Link>
  );
}
