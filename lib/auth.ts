import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getDb } from "@/db";
import {
  authAccount,
  authRateLimit,
  authSession,
  authUser,
  authVerification,
} from "@/db/schema";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth-policy";
import { codeEmail, emailEnabled, sendEmail } from "@/lib/email";

function localSecret() {
  if (process.env.BETTER_AUTH_SECRET) return process.env.BETTER_AUTH_SECRET;
  if (process.env.VERCEL)
    throw new Error("Falta BETTER_AUTH_SECRET en las variables de Vercel.");
  // Locally, a private secret is created once and kept out of git.
  const path = resolve(".data/auth-secret");
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
  // With email, accounts are created only by signing in with a 6-digit code,
  // so every account has proven its address. A password is optional and is
  // added afterwards with another code (Para ti → Perfil).
  const email = emailEnabled();
  // Production sets BETTER_AUTH_URL. Preview deployments have no fixed
  // address, so their deployment and branch URLs are trusted instead.
  const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .filter(Boolean)
    .map((host) => `https://${host}`);
  return {
    appName: "LinkUp",
    baseURL:
      process.env.BETTER_AUTH_URL ||
      vercelOrigins[0] ||
      "http://localhost:3000",
    trustedOrigins: vercelOrigins,
    secret: localSecret(),
    // The tables are part of db/schema.ts and its migrations.
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: authUser,
        session: authSession,
        account: authAccount,
        verification: authVerification,
        rateLimit: authRateLimit,
      },
    }),
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    emailAndPassword: {
      enabled: true,
      disableSignUp: email,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: 128,
      // A password reset by email code closes every open session.
      revokeSessionsOnPasswordReset: true,
    },
    plugins: email
      ? [
          emailOTP({
            otpLength: 6,
            expiresIn: 10 * 60,
            storeOTP: "hashed",
            sendVerificationOTP: ({ email: to, otp, type }) =>
              sendEmail(codeEmail(to, otp, type)),
          }),
        ]
      : [],
    rateLimit: { enabled: true, window: 60, max: 30, storage: "database" },
    advanced: { cookiePrefix: "linkup" },
  };
}

let instance: ReturnType<typeof betterAuth> | undefined;
export async function getAuth() {
  return (instance ??= betterAuth(options()));
}
