import { existsSync } from "node:fs";

// Next.js reads .env.local on its own; tsx scripts do not. Values already set
// in the environment win, so a command can still point at another database.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
