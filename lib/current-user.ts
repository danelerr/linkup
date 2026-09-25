import { requireCurrentUser } from "@/lib/session";
import { syncUser } from "@/lib/user-data";

export async function requireSyncedUser(returnTo: string) {
  const user = await requireCurrentUser(returnTo);
  await syncUser(user);
  return user;
}
