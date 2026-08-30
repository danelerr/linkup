import type { Metadata } from "next";
import { ExternalLink, LockKeyhole, Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { OrganizationApplicationControl } from "@/components/organization-application-control";
import { formatShortDate, opportunitiesForOrganization, opportunityBySlug, organizationBySlug } from "@/lib/catalog";
import { requireOrganizationRecruiter } from "@/lib/permissions";
import { listOrganizationApplications } from "@/lib/user-data";
import { isSafeHttpUrl } from "@/lib/validation";

export const metadata: Metadata = { title: "Candidatos", robots: { index: false, follow: false } };

function safeObject(value: string) {
  try { return JSON.parse(value) as Record<string, unknown>; } catch { return {}; }
}

function safeAnswers(value: string) {
  try { const parsed = JSON.parse(value) as unknown; return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}

export default async function CandidatesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const organization = organizationBySlug(slug);
  if (!organization) notFound();
  const user = await requireOrganizationRecruiter(`/organizacion/${slug}/candidatos`, slug);
  const opportunityRows = opportunitiesForOrganization(slug);
  const candidates = await listOrganizationApplications(slug, opportunityRows.map((item) => item.slug), user.userId);
  return (
    <div className="organization-page">
      <header className="organization-page-heading"><h2>Candidatos</h2><p>Solo perfiles compartidos expresamente al postular a {organization.name}.</p></header>
      {candidates.length ? (
        <div className="candidate-list">
          {candidates.map((candidate) => {
            const opportunity = opportunityBySlug(candidate.opportunitySlug);
            const profile = safeObject(candidate.profileSnapshotJson);
            const answers = safeAnswers(candidate.answersJson);
            const skills = Array.isArray(profile.skills) ? profile.skills.filter((item): item is string => typeof item === "string") : [];
            return (
              <article className="candidate-item" key={candidate.id}>
                <header>
                  <div className="candidate-avatar" aria-hidden="true">{candidate.candidateName.slice(0, 2).toUpperCase()}</div>
                  <div><h3>{candidate.candidateName}</h3><p>{String(profile.objective ?? "Perfil de talento")} · {opportunity?.title}</p></div>
                  <OrganizationApplicationControl applicationId={candidate.id} organizationSlug={slug} currentStatus={candidate.status} />
                </header>
                <div className="candidate-facts">
                  <span><Mail size={14} aria-hidden="true" /> {candidate.candidateEmail}</span>
                  <span>{String(profile.city ?? "")} {profile.country ? `· ${String(profile.country)}` : ""}</span>
                  <span>{String(profile.availability ?? "")}</span>
                </div>
                {skills.length > 0 && <div className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
                {answers.length > 0 && <details><summary>Ver respuestas ({answers.filter(Boolean).length})</summary><ol>{answers.filter(Boolean).map((answer, index) => <li key={`${candidate.id}-${index}`}>{answer}</li>)}</ol></details>}
                {typeof profile.portfolioUrl === "string" && isSafeHttpUrl(profile.portfolioUrl) && <a href={profile.portfolioUrl} target="_blank" rel="noreferrer">Ver evidencia <ExternalLink size={14} aria-hidden="true" /></a>}
                <footer><LockKeyhole size={13} aria-hidden="true" /> Compartido para esta postulación · {formatShortDate(candidate.createdAt.slice(0, 10))}</footer>
              </article>
            );
          })}
        </div>
      ) : <div className="account-empty account-empty-large"><p>Aún no hay postulaciones nativas para esta organización.</p></div>}
    </div>
  );
}
