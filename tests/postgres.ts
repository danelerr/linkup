import EmbeddedPostgres from "embedded-postgres";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrateDatabase } from "../db/migrate";

async function freePort() {
  const probe = createServer();
  await new Promise<void>((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const address = probe.address();
  if (!address || typeof address !== "object") throw new Error("No port.");
  await new Promise<void>((resolve) => probe.close(() => resolve()));
  return address.port;
}

/**
 * A throwaway local PostgreSQL 18 (the version Neon runs) with LinkUp's
 * migrations applied. Tests never touch the database in .env.local.
 */
export async function startTestDatabase() {
  const directory = mkdtempSync(join(tmpdir(), "linkup-pg-"));
  const port = await freePort();
  const server = new EmbeddedPostgres({
    databaseDir: join(directory, "data"),
    user: "postgres",
    password: "postgres",
    port,
    persistent: false,
    // UTF-8 everywhere; Windows would otherwise pick its own code page.
    initdbFlags: ["--encoding=UTF8", "--no-locale"],
    onLog: () => {},
  });
  await server.initialise();
  await server.start();
  await server.createDatabase("linkup");
  const url = `postgres://postgres:postgres@127.0.0.1:${port}/linkup`;
  await migrateDatabase(url);
  return {
    url,
    async stop() {
      await server.stop();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
