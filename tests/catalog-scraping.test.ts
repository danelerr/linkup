import assert from "node:assert/strict";
import test from "node:test";
import { mapOpportunityRow } from "../lib/catalog-import";
import {
  ashbyFeedSchema, ashbyOpportunity, contentHash, ripplingPublicJob,
  robotsAllow, salaryFor, type AshbyJob, type JobReview,
} from "../lib/catalog-scraping";

const job: AshbyJob = {
  id: "job-123", title: "Backend Engineer", location: "Remote, Global",
  isListed: true, isRemote: null, workplaceType: null,
  employmentType: "FullTime", publishedAt: "2026-09-20T10:00:00+00:00",
  jobUrl: "https://jobs.ashbyhq.com/acme/job-123",
  applyUrl: "https://jobs.ashbyhq.com/acme/job-123/application",
  descriptionPlain: "This is an official description of a public remote job.",
};
const review: JobReview = {
  id: job.id, title: job.title, organization: "acme", area: "Ingeniería",
  expectedLocation: job.location, countries: "Contratación global; confirmar elegibilidad.",
  summary: "Construye sistemas backend para el producto de la empresa.",
  responsibilities: ["Desarrollar servicios backend"],
  requirements: ["Experiencia desarrollando servicios"],
};

test("public API data becomes a validated draft, with no invented pay or level", () => {
  const parsed = ashbyFeedSchema.parse({ jobs: [{ ...job, candidateEmail: "never-store@example.com" }] });
  assert.equal("candidateEmail" in parsed.jobs[0], false);
  const row = ashbyOpportunity(parsed.jobs[0], review, "2026-09-30");
  assert.equal(row.nivel, "No especificado");
  assert.equal(row.compensacion, "Monto no publicado");
  assert.equal(row.tipo_compensacion, "Por definir");
  const mapped = mapOpportunityRow(row, "2026-09-30", () => "acme");
  assert.ok(mapped.ok, mapped.ok ? "" : mapped.errors.join(" · "));
  if (mapped.ok) {
    assert.equal(mapped.data.status, "draft");
    assert.equal(mapped.data.applicationMode, "external");
    assert.equal(mapped.data.isDemo, false);
    assert.equal(mapped.data.verifiedAt, "2026-09-30");
  }
});

test("unlisted, renamed, relocated, non-remote and future jobs require review", () => {
  for (const change of [
    { isListed: false }, { title: "Different role" }, { id: "other-id" },
    { location: "United States only" },
    { isRemote: false, workplaceType: "OnSite", location: "Office" },
    { employmentType: "Other" }, { publishedAt: "2026-10-01T00:00:00Z" },
  ]) assert.throws(() => ashbyOpportunity({ ...job, ...change }, review, "2026-09-30"));
  const onsite = { ...job, location: "Office", isRemote: false, workplaceType: "OnSite" };
  assert.throws(() => ashbyOpportunity(onsite, { ...review, expectedLocation: "Office" }, "2026-09-30"), /modalidad/);
});

test("job/application URLs cannot drift to an unrelated host or another job", () => {
  assert.throws(() => ashbyOpportunity({ ...job, applyUrl: "https://evil.example/job-123" }, review, "2026-09-30"));
  assert.throws(() => ashbyOpportunity({ ...job, jobUrl: "https://jobs.ashbyhq.com/acme/other-job" }, review, "2026-09-30"));
  assert.equal(ashbyFeedSchema.safeParse({ jobs: [{ ...job, applyUrl: "javascript:alert(1)" }] }).success, false);
});

test("salary keeps the currency and interval, and never merges country tiers", () => {
  const salary = { compensationType: "Salary", interval: "1 YEAR", currencyCode: "USD", minValue: 100000, maxValue: 150000 };
  const paid = { ...job, compensation: { summaryComponents: [salary] } };
  assert.equal(salaryFor(paid), "USD 100.000–150.000 / año");
  assert.equal(salaryFor({ ...paid, compensation: { summaryComponents: [salary, salary] } }), null);
  assert.equal(salaryFor({ ...paid, compensation: { summaryComponents: [{ ...salary, interval: "NONE" }] } }), null);
  assert.equal(salaryFor({ ...paid, compensation: { summaryComponents: [{ ...salary, currencyCode: null }] } }), null);
  assert.equal(salaryFor({ ...paid, compensation: { summaryComponents: [{ ...salary, minValue: 200000 }] } }), null);
});

test("robots honors path restrictions, wildcards, specific agent and Allow ties", () => {
  const url = (path: string) => new URL(path, "https://example.com");
  const policy = "User-agent: *\nDisallow: /private\nDisallow: /search?*\nAllow: /private/public\nDisallow: /same\nAllow: /same";
  assert.equal(robotsAllow(policy, url("/private/profile")), false);
  assert.equal(robotsAllow(policy, url("/private/public/job")), true);
  assert.equal(robotsAllow(policy, url("/search?q=jobs")), false);
  assert.equal(robotsAllow(policy, url("/search")), true);
  assert.equal(robotsAllow(policy, url("/same")), true);
  assert.equal(robotsAllow("User-agent: *\nDisallow: /\nUser-agent: LinkUpCatalogBot\nAllow: /jobs$", url("/jobs")), true);
  assert.equal(robotsAllow("User-agent: *\nDisallow: /jobs$", url("/jobs/detail")), true);
});

test("Rippling parser reads public job JSON without executing scripts or retaining forms", () => {
  const data = { props: { pageProps: { apiData: { jobPost: {
    uuid: "abc", name: "Accountant", url: "https://ats.rippling.com/acme/jobs/abc",
    createdOn: "2026-09-01", workLocations: ["La Paz"], unlistedFromSearch: false,
    activeJobApplication: { candidateEmail: "do-not-retain@example.com" },
  } } } } };
  const html = `<script>throw new Error('never execute')</script><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(data)}</script>`;
  const result = ripplingPublicJob(html);
  assert.equal(result.name, "Accountant");
  assert.equal("activeJobApplication" in result, false);
  assert.throws(() => ripplingPublicJob("<html>Login required</html>"));
  assert.throws(() => ripplingPublicJob('<script id="__NEXT_DATA__">invalid</script>'));
});

test("source hashes retain evidence without storing the full original page", () => {
  assert.equal(contentHash("source").length, 64);
  assert.equal(contentHash("source"), contentHash("source"));
  assert.notEqual(contentHash("source"), contentHash("changed"));
});
