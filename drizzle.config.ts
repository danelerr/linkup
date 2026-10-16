import { defineConfig } from "drizzle-kit";

// `npm run db:generate` writes migrations to drizzle/; `npm run db:migrate`
// applies them.
export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
});
