import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className="inline-flex items-center gap-2.5 rounded-lg"
      href="/"
      aria-label="LinkUp, inicio"
    >
      <span
        className="relative block size-8 overflow-hidden"
        aria-hidden="true"
      >
        <Image
          src="/linkup-mark.png"
          alt=""
          width={96}
          height={64}
          priority
          className="absolute top-1/2 left-1/2 h-16 w-24 max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      </span>
      {!compact && (
        <span className="text-xl font-bold tracking-[-0.045em]">LinkUp</span>
      )}
    </Link>
  );
}
