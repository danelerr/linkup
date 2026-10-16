import assert from "node:assert/strict";
import { after, test } from "node:test";
import { startup } from "./fixtures";
import { startTestDatabase } from "./postgres";

const database = await startTestDatabase();
process.env.DATABASE_URL = database.url;
process.env.LINKUP_SEED_DEMO = "false";
const { closeDb, getPool } = await import("../db");
const { saveCatalogEntry } = await import("../lib/catalog-editor");
const { syncUser, saveOrganizationMember, deleteUserData } =
  await import("../lib/user-data");
after(async () => {
  await closeDb();
  await database.stop();
});

async function account(id: string) {
  await syncUser({
    userId: id,
    email: `${id}@example.test`,
    displayName: id,
    fullName: id,
  });
}

async function organization(slug: string) {
  await saveCatalogEntry("test", {
    kind: "startup",
    data: startup(slug),
    reason: "Prueba de cierre de cuenta",
  });
}

async function countUserRows(
  table: "talent_profiles" | "saved_opportunities" | "organization_members",
  userId: string,
) {
  const { rows } = await getPool().query<{ value: number }>(
    `SELECT count(*)::int AS value FROM ${table} WHERE user_id=$1`,
    [userId],
  );
  return rows[0].value;
}

async function userRow(id: string) {
  const { rows } = await getPool().query("SELECT * FROM users WHERE id=$1", [
    id,
  ]);
  return rows[0];
}

test("account deletion keeps all data when any startup would lose its last active owner", async () => {
  await account("owner");
  await account("other");
  await organization("sole-owner");
  await organization("shared-owners");
  await saveOrganizationMember("test", "sole-owner", "owner", "owner");
  await saveOrganizationMember("test", "sole-owner", "other", "recruiter");
  await saveOrganizationMember("test", "shared-owners", "owner", "owner");
  await saveOrganizationMember("test", "shared-owners", "other", "owner");
  await getPool().query(
    "INSERT INTO saved_opportunities(user_id,opportunity_slug) VALUES ($1,$2)",
    ["owner", "saved-role"],
  );
  const before = await userRow("owner");

  assert.deepEqual(await deleteUserData("owner"), {
    deleted: false,
    organizations: [{ slug: "sole-owner", name: "Estudio sole-owner" }],
  });
  assert.deepEqual(await userRow("owner"), before);
  assert.equal(await countUserRows("talent_profiles", "owner"), 1);
  assert.equal(await countUserRows("saved_opportunities", "owner"), 1);
  assert.equal(await countUserRows("organization_members", "owner"), 2);

  await saveOrganizationMember("owner", "sole-owner", "other", "owner");
  assert.deepEqual(await deleteUserData("owner"), { deleted: true });
  for (const table of [
    "talent_profiles",
    "saved_opportunities",
    "organization_members",
  ] as const)
    assert.equal(await countUserRows(table, "owner"), 0);
  assert.equal(await userRow("owner"), undefined);
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
  await organization("active-team");
  await saveOrganizationMember("test", "active-team", "active-owner", "owner");
  await saveOrganizationMember(
    "test",
    "active-team",
    "inactive-owner",
    "owner",
  );
  await saveOrganizationMember("test", "active-team", "viewer", "viewer");
  await getPool().query(
    "UPDATE organization_members SET status='revoked' WHERE user_id=$1",
    ["inactive-owner"],
  );
  assert.deepEqual(await deleteUserData("active-owner"), {
    deleted: false,
    organizations: [{ slug: "active-team", name: "Estudio active-team" }],
  });
  assert.deepEqual(await deleteUserData("inactive-owner"), { deleted: true });
  assert.deepEqual(await deleteUserData("viewer"), { deleted: true });
});

test("the last two owners closing their accounts at the same time cannot both leave", async () => {
  await account("first-owner");
  await account("second-owner");
  await organization("pair-team");
  await saveOrganizationMember("test", "pair-team", "first-owner", "owner");
  await saveOrganizationMember("test", "pair-team", "second-owner", "owner");
  const results = await Promise.all([
    deleteUserData("first-owner"),
    deleteUserData("second-owner"),
  ]);
  assert.equal(results.filter((result) => result.deleted).length, 1);
  const { rows } = await getPool().query<{ value: number }>(
    "SELECT count(*)::int AS value FROM organization_members WHERE organization_slug='pair-team' AND member_role='owner' AND status='active'",
  );
  assert.equal(rows[0].value, 1);
});
