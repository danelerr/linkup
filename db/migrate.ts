import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/** Applies the pending migrations in drizzle/ to the given database. */
export async function migrateDatabase(connectionString: string) {
  const pool = new Pool({ connectionString, max: 1 });
  try {
    await migrate(drizzle(pool), {
      migrationsFolder: resolve(process.cwd(), "drizzle"),
    });
  } finally {
    await pool.end();
  }
}
