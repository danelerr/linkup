import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { syncUser } from "@/lib/user-data";

export async function requireSyncedUser(returnTo: string) {
  const user = await requireChatGPTUser(returnTo);
  await syncUser(user);
  return user;
}
