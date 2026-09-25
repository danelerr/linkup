import Image from "next/image";
import { cx } from "@/lib/cx";

/** Startup logo in a neutral container; monogram when there is no logo. */
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
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center overflow-hidden border border-line bg-paper",
        size >= 56 ? "rounded-panel" : "rounded-[12px]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          width={size}
          height={size}
          unoptimized
          referrerPolicy="no-referrer"
          className="size-full object-contain p-[12%]"
        />
      ) : (
        <span
          className="font-meta font-bold tracking-[0.02em] text-action"
          style={{ fontSize: Math.round(size * 0.3) }}
        >
          {monogram}
        </span>
      )}
    </span>
  );
}
