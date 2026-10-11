import { randomInt } from "node:crypto";
import { getSqlite } from "../db/index";
import { getAuth } from "../lib/auth";

// Without an email provider nobody can recover a password on their own. An
// operator runs this on the server and hands the temporary password over in
// private; the person then changes it in Mi LinkUp → Perfil.
const emailIndex = process.argv.indexOf("--email");
const email = process.argv[emailIndex + 1]?.trim().toLowerCase();
if (emailIndex === -1 || !email?.includes("@"))
  throw new Error("Uso: npm run password -- --email persona@correo.com");

const db = getSqlite();
const auth = await getAuth();
const account = db
  .prepare("SELECT id FROM auth_user WHERE lower(email) = ?")
  .get(email) as { id: string } | undefined;
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
db.prepare(
  "INSERT INTO audit_events(id, actor_id, action, entity_type, entity_id, detail_json, created_at) VALUES (?, 'cli', 'account.password_reset', 'user', ?, '{}', ?)",
).run(crypto.randomUUID(), account.id, new Date().toISOString());

console.log(
  `Contraseña temporal: ${temporary}\nSe cerraron todas sus sesiones. Compártela por un canal privado y pide que la cambie en Mi LinkUp → Perfil.`,
);
