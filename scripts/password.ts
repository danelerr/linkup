import "./env";
import { randomInt } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { closeDb, getDb } from "../db/index";
import { auditEvents, authUser } from "../db/schema";
import { getAuth } from "../lib/auth";

// Without email configured nobody can reset a password on their own. An
// operator runs this and hands the temporary password over in private; the
// person then changes it in Para ti → Perfil.
const emailIndex = process.argv.indexOf("--email");
const email = process.argv[emailIndex + 1]?.trim().toLowerCase();
if (emailIndex === -1 || !email?.includes("@"))
  throw new Error("Uso: npm run password -- --email persona@correo.com");

const db = getDb();
const auth = await getAuth();
const [account] = await db
  .select({ id: authUser.id })
  .from(authUser)
  .where(eq(sql`lower(${authUser.email})`, email));
if (!account) throw new Error("No existe una cuenta con ese correo.");

const context = await auth.$context;
const credential = await context.internalAdapter.findCredentialAccount(
  account.id,
);
if (!credential) throw new Error("Esa cuenta no ingresa con contraseña.");

// Four groups of five unambiguous characters: easy to dictate.
const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
const temporary = Array.from({ length: 4 }, () =>
  Array.from({ length: 5 }, () => alphabet[randomInt(alphabet.length)]).join(
    "",
  ),
).join("-");

await context.internalAdapter.updateAccount(credential.id, {
  password: await context.password.hash(temporary),
});
await context.internalAdapter.deleteUserSessions(account.id);
await db.insert(auditEvents).values({
  id: crypto.randomUUID(),
  actorId: "cli",
  action: "account.password_reset",
  entityType: "user",
  entityId: account.id,
});
await closeDb();

console.log(
  `Contraseña temporal: ${temporary}\nSe cerraron todas sus sesiones. Compártela por un canal privado y pide que la cambie en Para ti → Perfil.`,
);
