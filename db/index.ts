import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

function connect() {
  const filename = resolve(
    /* turbopackIgnore: true */ process.env.LINKUP_DATABASE_PATH ||
      ".data/linkup.sqlite",
  );
  mkdirSync(dirname(filename), { recursive: true });
  const client = new Database(filename);
  client.pragma("journal_mode = WAL");
  client.pragma("foreign_keys = ON");
  client.pragma("busy_timeout = 5000");
  const db = drizzle(client, { schema });
  migrate(db, { migrationsFolder: resolve("drizzle") });
  return { db, client };
}

const state = globalThis as unknown as {
  linkupDatabase?: ReturnType<typeof connect>;
};
export function getDb() {
  return (state.linkupDatabase ??= connect()).db;
}
export function getSqlite() {
  return (state.linkupDatabase ??= connect()).client;
}
