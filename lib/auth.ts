import { betterAuth, type BetterAuthOptions } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { emailOTP } from "better-auth/plugins/email-otp";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getSqlite } from "@/db";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-policy";
import {
  codeEmail,
  emailEnabled,
  existingAccountEmail,
  sendEmail,
} from "@/lib/email";

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
  // With email, every account proves its address with a 6-digit code: when
  // created with a password, and on each code sign-in. Requiring it for
  // password accounts also matters because a code sign-in into an unproven
  // account deletes that account's password (Better Auth's protection
  // against someone registering another person's email first).
  const email = emailEnabled();
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
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: 128,
      requireEmailVerification: email,
      // A password reset by email code closes every open session.
      revokeSessionsOnPasswordReset: true,
      // Sign-up answers the same for new and existing emails; tell the owner.
      onExistingUserSignUp: email
        ? ({ user }) => sendEmail(existingAccountEmail(user.email))
        : undefined,
    },
    emailVerification: email
      ? { sendOnSignIn: true, autoSignInAfterVerification: true }
      : undefined,
    plugins: email
      ? [
          emailOTP({
            otpLength: 6,
            expiresIn: 10 * 60,
            storeOTP: "hashed",
            overrideDefaultEmailVerification: true,
            sendVerificationOTP: ({ email: to, otp, type }) =>
              sendEmail(codeEmail(to, otp, type)),
          }),
        ]
      : [],
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
