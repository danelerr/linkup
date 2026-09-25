"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RecordExternalApplication } from "@/components/record-external-application";
import { SavedOpportunityButton } from "@/components/saved-opportunity-button";
import { buttonClass } from "@/components/ui/button";
import { cx } from "@/lib/cx";

/**
 * Apply and save. In the desktop aside they sit in the flow; on phones they
 * become a bar fixed to the bottom, which offers to record an external
 * application once the person has opened the official site.
 */
export function OpportunityActions({
  opportunitySlug,
  mode,
  applicationUrl,
  open,
  trackable,
  authenticated,
  initialSaved,
  initialRecorded,
  autoSave,
  autoRecord,
  from,
}: {
  opportunitySlug: string;
  mode: "native" | "external";
  applicationUrl: string;
  open: boolean;
  trackable: boolean;
  authenticated: boolean;
  initialSaved: boolean;
  initialRecorded: boolean;
  autoSave: boolean;
  autoRecord: boolean;
  from: string;
}) {
  const [visitedOfficialSite, setVisitedOfficialSite] = useState(false);
  const primary = "max-lg:flex-1 lg:w-full";
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <div className="mx-auto flex max-w-xl items-stretch gap-2 lg:grid lg:max-w-none lg:gap-2.5">
        {!open ? (
          <span
            className={buttonClass({ variant: "inert", className: primary })}
          >
            Postulaciones cerradas
          </span>
        ) : mode === "native" ? (
          <Link
            className={buttonClass({ className: primary })}
            href={`/oportunidades/${opportunitySlug}/postular`}
          >
            Postular en LinkUp
          </Link>
        ) : applicationUrl ? (
          <a
            className={buttonClass({ className: primary })}
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setVisitedOfficialSite(true)}
          >
            Postular en el sitio oficial
            <ArrowUpRight className="size-4" aria-hidden="true" />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
        ) : (
          <span
            className={buttonClass({ variant: "inert", className: primary })}
          >
            Ejemplo sin enlace de postulación
          </span>
        )}
        <SavedOpportunityButton
          opportunitySlug={opportunitySlug}
          initialSaved={initialSaved}
          authenticated={authenticated}
          autoSave={autoSave}
          from={from}
          className="max-lg:w-11 max-lg:px-0 lg:w-full"
          labelClassName="max-lg:sr-only"
        />
      </div>
      {trackable && (
        <RecordExternalApplication
          opportunitySlug={opportunitySlug}
          authenticated={authenticated}
          initialRecorded={initialRecorded}
          autoRecord={autoRecord}
          className={cx(
            "mt-2.5 lg:mt-3",
            !visitedOfficialSite &&
              !initialRecorded &&
              !autoRecord &&
              "max-lg:hidden",
          )}
        />
      )}
    </div>
  );
}
