import { createClient } from "@/lib/supabase/client";

export async function loginWithPassword(email: string, password: string) {
  const { error } = await createClient().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
}

export async function registerWithEmail(email: string, password: string) {
  const returnTo = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  ).get("returnTo");
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  if (returnTo) callbackUrl.searchParams.set("returnTo", returnTo);

  const { data, error } = await createClient().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl.toString() },
  });
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email: string) {
  const redirectTo = new URL("/auth/callback", window.location.origin);
  redirectTo.searchParams.set("next", "/auth/reset-password");
  const { error } = await createClient().auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo.toString(),
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await createClient().auth.updateUser({ password });
  if (error) throw error;
}

export async function loginWithGoogle(returnTo: string): Promise<void> {
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("returnTo", returnTo);
  const { error } = await createClient().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });
  if (error) throw error;
}
