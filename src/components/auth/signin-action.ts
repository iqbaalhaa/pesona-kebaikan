"use server";

import { signIn, signOut } from "@/auth";

export async function handleSignIn() {
  await signIn("github", { redirectTo: "/admin" });
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/auth/login" });
}
