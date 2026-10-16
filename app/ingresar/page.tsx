import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { emailEnabled } from "@/lib/email";
import { getCurrentUser } from "@/lib/session";
import { safeRelativeReturnPath } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Ingresar",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; cuenta?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(params.return_to || "/mi-linkup");
  // Actions that need an account send people here with ?cuenta=nueva.
  const newAccount = params.cuenta === "nueva";
  if (await getCurrentUser()) redirect(returnTo);
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col px-4 py-5 sm:px-6"
    >
      <Brand />
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
        <AuthForm
          returnTo={returnTo}
          initialMode={newAccount ? "signup" : "signin"}
          emailCodes={emailEnabled()}
        />
        <Link
          className="mt-6 self-center text-sm font-medium text-muted transition-colors hover:text-action"
          href="/"
        >
          Seguir explorando sin cuenta
        </Link>
      </div>
    </main>
  );
}
