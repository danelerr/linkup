import type { Metadata } from "next";
import { ArrowUpRight, LockKeyhole, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { ApplicationProgress } from "@/components/application-progress";
import { OrganizationApplicationControl } from "@/components/organization-application-control";
import { EmptyState, sectionTitleClass } from "@/components/ui/layout";
import {
  formatShortDate,
  opportunitiesForOrganization,
  opportunityBySlug,
  organizationBySlug,
} from "@/lib/catalog";
import { requireOrganizationRecruiter } from "@/lib/permissions";
import { listOrganizationApplications } from "@/lib/user-data";
import { isSafeHttpUrl } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Candidatos",
  robots: { index: false, follow: false },
};

function safeObject(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function safeAnswers(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

const factLabel =
  "font-meta text-xs font-semibold tracking-[0.08em] text-muted uppercase";

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  const user = await requireOrganizationRecruiter(
    `/organizacion/${slug}/candidatos`,
    slug,
  );
  // Closed opportunities keep their candidates: reviews usually happen after closing.
  const opportunityRows = opportunitiesForOrganization(slug, true);
  const candidates = await listOrganizationApplications(
    slug,
    opportunityRows.map((item) => item.slug),
    user.userId,
  );
  return (
    <div className="grid gap-6">
      <div>
        <h2 className={sectionTitleClass}>Candidatos</h2>
        <p className="mt-1 text-[15px] leading-6 text-body">
          Solo perfiles compartidos expresamente al postular a{" "}
          {organization.name}. Actualiza el estado para que cada persona sepa en
          qué punto está su proceso.
        </p>
      </div>
      {candidates.length ? (
        <div className="grid gap-4">
          {candidates.map((candidate) => {
            const opportunity = opportunityBySlug(candidate.opportunitySlug);
            const profile = safeObject(candidate.profileSnapshotJson);
            const answers = safeAnswers(candidate.answersJson).filter(Boolean);
            const skills = Array.isArray(profile.skills)
              ? profile.skills.filter(
                  (item): item is string => typeof item === "string",
                )
              : [];
            const location = [profile.city, profile.country]
              .filter((item) => typeof item === "string" && item)
              .join(", ");
            return (
              <article
                className="rounded-panel border border-line bg-paper p-5 sm:p-6"
                key={candidate.id}
              >
                <header className="flex flex-wrap items-start gap-4">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface font-meta text-sm font-semibold text-action"
                    aria-hidden="true"
                  >
                    {candidate.candidateName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">
                      {candidate.candidateName}
                    </h3>
                    <p className="text-sm text-body">
                      {String(profile.objective ?? "Perfil de talento")}
                      {opportunity && (
                        <span className="text-muted">
                          {" · "}
                          {opportunity.title}
                        </span>
                      )}
                    </p>
                  </div>
                  <OrganizationApplicationControl
                    applicationId={candidate.id}
                    organizationSlug={slug}
                    currentStatus={candidate.status}
                    candidateName={candidate.candidateName}
                  />
                </header>

                <ApplicationProgress
                  className="mt-5"
                  status={candidate.status}
                  mode="native"
                />

                <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className={factLabel}>Contacto</dt>
                    <dd className="mt-0.5 truncate">
                      <a
                        className="inline-flex items-center gap-1.5 text-action hover:underline"
                        href={`mailto:${candidate.candidateEmail}`}
                      >
                        <Mail className="size-3.5" aria-hidden="true" />
                        {candidate.candidateEmail}
                      </a>
                    </dd>
                  </div>
                  {location && (
                    <div>
                      <dt className={factLabel}>Ubicación</dt>
                      <dd className="mt-0.5 text-ink">{location}</dd>
                    </div>
                  )}
                  {typeof profile.availability === "string" &&
                    profile.availability && (
                      <div>
                        <dt className={factLabel}>Disponibilidad</dt>
                        <dd className="mt-0.5 text-ink">
                          {profile.availability}
                        </dd>
                      </div>
                    )}
                </dl>

                {skills.length > 0 && (
                  <ul
                    className="mt-4 flex flex-wrap gap-1.5"
                    aria-label="Habilidades"
                  >
                    {skills.map((skill) => (
                      <li
                        className="rounded-full border border-line bg-surface px-2.5 py-1 text-[13px] font-medium text-body"
                        key={skill}
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}

                {answers.length > 0 && (
                  <details className="mt-4 rounded-control border border-line">
                    <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-semibold text-ink">
                      Ver respuestas ({answers.length})
                    </summary>
                    <ol className="grid gap-4 border-t border-line px-4 py-4 text-[15px] leading-6 text-body">
                      {answers.map((answer, index) => (
                        <li key={`${candidate.id}-${index}`}>
                          <span className="font-meta text-xs font-bold text-muted">
                            {index + 1}.
                          </span>{" "}
                          {answer}
                        </li>
                      ))}
                    </ol>
                  </details>
                )}

                <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <LockKeyhole className="size-3.5" aria-hidden="true" />
                    Compartido para esta postulación ·{" "}
                    {formatShortDate(candidate.createdAt.slice(0, 10))}
                  </span>
                  {typeof profile.portfolioUrl === "string" &&
                    isSafeHttpUrl(profile.portfolioUrl) && (
                      <a
                        className="inline-flex items-center gap-1 font-semibold text-action hover:underline"
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver evidencia
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">
                          (se abre en otra pestaña)
                        </span>
                      </a>
                    )}
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Aún no hay postulaciones dentro de LinkUp.">
          Cuando alguien postule a una oportunidad gestionada, aparecerá aquí
          con lo que decidió compartir.
        </EmptyState>
      )}
    </div>
  );
}
