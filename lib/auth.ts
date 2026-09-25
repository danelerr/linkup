import { betterAuth, type BetterAuthOptions } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getSqlite } from "@/db";

function localSecret() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  const path = resolve(
    dirname(process.env.LINKUP_DATABASE_PATH || ".data/linkup.sqlite"),
    "auth-secret",
  );
  mkdirSync(dirname(path), { recursive: true });
  if (!existsSync(path)) {
    try {
      writeFileSync(path, randomBytes(48).toString("hex"), {
        mode: 0o600,
        flag: "wx",
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }
  return readFileSync(path, "utf8").trim();
}

function options(): BetterAuthOptions {
  return {
    appName: "LinkUp",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: localSecret(),
    database: getSqlite(),
    user: { modelName: "auth_user" },
    session: {
      modelName: "auth_session",
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    account: { modelName: "auth_account" },
    verification: { modelName: "auth_verification" },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
    },
    rateLimit: { enabled: true, window: 60, max: 30 },
    advanced: { cookiePrefix: "linkup" },
  };
}

let migration: Promise<void> | undefined;
let instance: ReturnType<typeof betterAuth> | undefined;
export async function ensureAuth() {
  migration ??= (async () => {
    const config = options();
    const { runMigrations } = await getMigrations(config);
    await runMigrations();
    instance = betterAuth(config);
  })().catch((error) => {
    migration = undefined;
    throw error;
  });
  await migration;
}

export async function getAuth() {
  await ensureAuth();
  return instance!;
}
