import "./env";
import { closeDb } from "../db/index";
import { generateNotifications } from "../lib/alerts";
console.log(
  `${await generateNotifications()} avisos nuevos en LinkUp. No se envían correos.`,
);
await closeDb();
