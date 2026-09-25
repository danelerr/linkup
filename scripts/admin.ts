import { getSqlite } from "../db/index";
import { ensureAuth } from "../lib/auth";
const emailIndex = process.argv.indexOf("--email");
const email = process.argv[emailIndex + 1]?.trim().toLowerCase();
if (emailIndex === -1 || !email?.includes("@"))
  throw new Error(
    "Uso: npm run admin -- --email tu@correo.com. Crea primero la cuenta en LinkUp.",
  );
const db = getSqlite();
await ensureAuth();
const account = db
  .prepare("SELECT id, name, email FROM auth_user WHERE lower(email) = ?")
  .get(email) as { id: string; name: string; email: string } | undefined;
if (!account)
  throw new Error("No existe esa cuenta. Créala primero en /ingresar.");
db.prepare(
  "INSERT INTO users(id, email, display_name, role) VALUES (?, ?, ?, 'admin') ON CONFLICT(id) DO UPDATE SET role = 'admin'",
).run(account.id, account.email, account.name);
console.log(
  "Acceso de administración concedido a la cuenta indicada. Abre /admin.",
);
