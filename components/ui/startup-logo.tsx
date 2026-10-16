"use client";
import { useState } from "react";
import Image from "next/image";
import { cx } from "@/lib/cx";

// Monogram tones from the brand palette (docs/marca.md). The same initials
// always get the same tone, so a startup keeps its color across pages.
const monogramTones = [
  "border-navy bg-navy text-white",
  "border-action bg-action text-white",
  "border-transparent bg-action/10 text-action-active",
  "border-transparent bg-cyan/20 text-ink",
];

function monogramTone(monogram: string) {
  let sum = 0;
  for (const character of monogram) sum += character.charCodeAt(0);
  return monogramTones[sum % monogramTones.length];
}

/**
 * Startup logo in a neutral container. Falls back to the monogram when there
 * is no logo or the image fails to load (external logos move or disappear).
 */
export function StartupLogo({
  monogram,
  logoUrl,
  size = 48,
  className,
}: {
  monogram: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const showImage = Boolean(logoUrl) && failedUrl !== logoUrl;
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center overflow-hidden border",
        showImage ? "border-line bg-paper" : monogramTone(monogram),
        size >= 56 ? "rounded-panel" : "rounded-[12px]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={logoUrl!}
          alt=""
          width={size}
          height={size}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(logoUrl ?? "")}
          className="size-full object-contain p-[12%]"
        />
      ) : (
        <span
          className="font-meta font-bold tracking-[0.02em]"
          style={{ fontSize: Math.round(size * 0.3) }}
        >
          {monogram}
        </span>
      )}
    </span>
  );
}
