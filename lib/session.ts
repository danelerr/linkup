import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { signInPath } from "@/lib/navigation";
export { safeRelativeReturnPath, signInPath } from "@/lib/navigation";

export type LinkUpUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getCurrentUser(): Promise<LinkUpUser | null> {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")) return null;
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return null;
  return {
    userId: session.user.id,
    displayName: session.user.name,
    email: session.user.email,
    fullName: session.user.name,
  };
}

export async function requireCurrentUser(returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(signInPath(returnTo));
  return user;
}
