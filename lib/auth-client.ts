"use client";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// The code endpoints only exist when the server has email configured; the
// sign-in form hides the option otherwise.
export const authClient = createAuthClient({ plugins: [emailOTPClient()] });
