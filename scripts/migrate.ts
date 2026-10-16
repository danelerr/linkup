import "./env";
import { databaseUrl } from "../db";
import { migrateDatabase } from "../db/migrate";

// Runs in every Vercel build (vercel.json) before `next build`, with the
// direct connection Neon recommends for schema changes.
await migrateDatabase(databaseUrl(true));
console.log("Base de datos al día.");
