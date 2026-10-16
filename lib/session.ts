import { headers } from "next/headers";
import { cache } from "react";
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

// Cached per request: the header, layouts and pages all ask for it.
export const getCurrentUser = cache(async (): Promise<LinkUpUser | null> => {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")) return null;
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return null;
  return {
    userId: session.user.id,
    // An account created with a code has no name until its first sign-in
    // finishes; show the start of its email meanwhile.
    displayName: session.user.name || session.user.email.split("@")[0],
    email: session.user.email,
    fullName: session.user.name || null,
  };
});

export async function requireCurrentUser(returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(signInPath(returnTo, true));
  return user;
}
