import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/** Pooled connection string for the app; migrations use the direct one. */
export function databaseUrl(direct = false) {
  const url =
    (direct && process.env.DATABASE_URL_UNPOOLED) || process.env.DATABASE_URL;
  if (!url)
    throw new Error(
      "DATABASE_URL no está configurada. Trae las variables de Vercel con `vercel env pull`.",
    );
  // pg already treats sslmode=require as verify-full and warns about it on
  // every connection; saying it explicitly keeps the same behavior quietly.
  return url.replace("sslmode=require", "sslmode=verify-full");
}

function connect() {
  const pool = new Pool({ connectionString: databaseUrl() });
  // On Vercel, keeps the function alive until idle clients are released.
  attachDatabasePool(pool);
  return { pool, db: drizzle(pool, { schema }) };
}

const state = globalThis as unknown as {
  linkupDatabase?: ReturnType<typeof connect>;
};
export function getDb() {
  return (state.linkupDatabase ??= connect()).db;
}
export function getPool() {
  return (state.linkupDatabase ??= connect()).pool;
}
export type Database = ReturnType<typeof getDb>;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/** Closes the pool so scripts and tests can exit. */
export async function closeDb() {
  const current = state.linkupDatabase;
  state.linkupDatabase = undefined;
  await current?.pool.end();
}

/** PostgreSQL rejected a row that would repeat a unique value. */
export function isUniqueViolation(error: unknown) {
  for (let current = error; current; current = (current as Error).cause)
    if ((current as { code?: string }).code === "23505") return true;
  return false;
}
