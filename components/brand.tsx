import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="LinkUp, inicio">
      <span className="brand-mark" aria-hidden="true">
        <Image src="/linkup-mark.png" alt="" width={96} height={64} priority />
      </span>
      {!compact && <span className="brand-word">LinkUp</span>}
    </Link>
  );
}
