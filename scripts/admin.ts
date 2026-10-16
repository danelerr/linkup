import "./env";
import { eq, sql } from "drizzle-orm";
import { closeDb, getDb } from "../db/index";
import { authUser, users } from "../db/schema";

const emailIndex = process.argv.indexOf("--email");
const email = process.argv[emailIndex + 1]?.trim().toLowerCase();
if (emailIndex === -1 || !email?.includes("@"))
  throw new Error(
    "Uso: npm run admin -- --email tu@correo.com. Crea primero la cuenta en LinkUp.",
  );
const db = getDb();
const [account] = await db
  .select({ id: authUser.id, name: authUser.name, email: authUser.email })
  .from(authUser)
  .where(eq(sql`lower(${authUser.email})`, email));
if (!account)
  throw new Error("No existe esa cuenta. Créala primero en /ingresar.");
await db
  .insert(users)
  .values({
    id: account.id,
    email: account.email,
    displayName: account.name || account.email.split("@")[0],
    role: "admin",
  })
  .onConflictDoUpdate({ target: users.id, set: { role: "admin" } });
await closeDb();
console.log(
  "Acceso de administración concedido a la cuenta indicada. Abre /admin.",
);
