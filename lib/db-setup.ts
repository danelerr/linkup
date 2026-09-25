import { getDb } from "@/db";
export async function ensureDatabase() {
  getDb();
}
