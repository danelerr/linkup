import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startup } from "./fixtures";

const directory = mkdtempSync(join(tmpdir(), "linkup-account-unit-"));
process.env.LINKUP_DATABASE_PATH = join(directory, "test.sqlite");
process.env.LINKUP_SEED_DEMO = "false";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.BETTER_AUTH_SECRET = crypto.randomUUID() + crypto.randomUUID();
const { getSqlite } = await import("../db");
const { ensureAuth } = await import("../lib/auth");
const { saveCatalogEntry } = await import("../lib/catalog-editor");
const { syncUser, saveOrganizationMember, deleteUserData } =
  await import("../lib/user-data");
await ensureAuth();
after(() => {
  getSqlite().close();
  rmSync(directory, { recursive: true, force: true });
});

async function account(id: string) {
  await syncUser({
    userId: id,
    email: `${id}@example.test`,
    displayName: id,
    fullName: id,
  });
}

function organization(slug: string) {
  saveCatalogEntry("test", {
    kind: "startup",
    data: startup(slug),
    reason: "Prueba de cierre de cuenta",
  });
}

function countUserRows(
  table: "talent_profiles" | "saved_opportunities" | "organization_members",
  userId: string,
) {
  return (
    getSqlite()
      .prepare(`SELECT count(*) AS value FROM ${table} WHERE user_id=?`)
      .get(userId) as { value: number }
  ).value;
}

test("account deletion keeps all data when any startup would lose its last active owner", async () => {
  await account("owner");
  await account("other");
  organization("sole-owner");
  organization("shared-owners");
  await saveOrganizationMember("test", "sole-owner", "owner", "owner");
  await saveOrganizationMember("test", "sole-owner", "other", "recruiter");
  await saveOrganizationMember("test", "shared-owners", "owner", "owner");
  await saveOrganizationMember("test", "shared-owners", "other", "owner");
  const db = getSqlite();
  db.prepare(
    "INSERT INTO saved_opportunities(user_id,opportunity_slug) VALUES (?,?)",
  ).run("owner", "saved-role");
  const before = db.prepare("SELECT * FROM users WHERE id=?").get("owner");

  assert.deepEqual(await deleteUserData("owner"), {
    deleted: false,
    organizations: [{ slug: "sole-owner", name: "Estudio sole-owner" }],
  });
  assert.deepEqual(
    db.prepare("SELECT * FROM users WHERE id=?").get("owner"),
    before,
  );
  assert.equal(countUserRows("talent_profiles", "owner"), 1);
  assert.equal(countUserRows("saved_opportunities", "owner"), 1);
  assert.equal(countUserRows("organization_members", "owner"), 2);

  await saveOrganizationMember("owner", "sole-owner", "other", "owner");
  assert.deepEqual(await deleteUserData("owner"), { deleted: true });
  for (const table of [
    "talent_profiles",
    "saved_opportunities",
    "organization_members",
  ] as const)
    assert.equal(countUserRows(table, "owner"), 0);
  assert.equal(
    db.prepare("SELECT * FROM users WHERE id=?").get("owner"),
    undefined,
  );
  // After the first owner's deletion, deleting the remaining owner is denied.
  assert.deepEqual(await deleteUserData("other"), {
    deleted: false,
    organizations: [
      { slug: "shared-owners", name: "Estudio shared-owners" },
      { slug: "sole-owner", name: "Estudio sole-owner" },
    ],
  });
});

test("inactive owners and active viewers cannot replace an active owner", async () => {
  await account("active-owner");
  await account("inactive-owner");
  await account("viewer");
  organization("active-team");
  await saveOrganizationMember("test", "active-team", "active-owner", "owner");
  await saveOrganizationMember("test", "active-team", "inactive-owner", "owner");
  await saveOrganizationMember("test", "active-team", "viewer", "viewer");
  getSqlite()
    .prepare("UPDATE organization_members SET status='revoked' WHERE user_id=?")
    .run("inactive-owner");
  assert.deepEqual(await deleteUserData("active-owner"), {
    deleted: false,
    organizations: [{ slug: "active-team", name: "Estudio active-team" }],
  });
  assert.deepEqual(await deleteUserData("inactive-owner"), { deleted: true });
  assert.deepEqual(await deleteUserData("viewer"), { deleted: true });
});
