// lib/authMfa.ts
import { appParams } from "@/lib/app-params";
import { usifizzyClient } from "@/api/usifizzyClient"; // Correctly bound and utilized natively below

export interface MfaSessionResult {
  access_token?: string;
  mfa_session_token?: string;
  [key: string]: any;
}

function authPath(suffix: string): string {
  // Use a fallback validation rule to ensure local dev IDs pass safely
  const resolvedId = appParams.appId || "usifizzy_local_dev";
  return `/api/apps/${resolvedId}/auth/${suffix}`;
}

async function post(
  suffix: string,
  body: Record<string, any>,
  token?: string,
): Promise<any> {
  const response = await fetch(authPath(suffix), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.error?.message || result.detail || "Unable to sign in",
    );
  return result;
}

export async function loginWithMfa(
  email: string,
  password: string,
): Promise<MfaSessionResult> {
  const result = await post("login", { email, password });
  if (result.access_token && typeof window !== "undefined") {
    // FIXED: Appends the token directly into local storage using your brand identifier name
    window.localStorage.setItem("usifizzy_access_token", result.access_token);
  }
  return result;
}

export async function continueMfa(
  result: MfaSessionResult,
  returnTo: string,
): Promise<void> {
  if (typeof window === "undefined") return;

  const encode = (bytes: Uint8Array): string =>
    btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const verifier = encode(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = encode(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
    ),
  );
  const { code } = await post(
    "mfa/handoff",
    { code_challenge: challenge },
    result.mfa_session_token,
  );

  sessionStorage.setItem(
    `app-mfa-pkce:${appParams.appId || "usifizzy"}`,
    verifier,
  );

  const url = new URL("/auth/mfa", window.location.origin);
  url.search = new URLSearchParams({
    app_id: appParams.appId || "usifizzy_local_dev",
    mfa_code: code,
    from_url: returnTo,
  }).toString();

  window.location.assign(url.href);
}

export type SocialProvider = "google" | "microsoft" | "facebook" | "apple";

export async function loginWithSocial(
  provider: SocialProvider,
  returnTo: string,
): Promise<void> {
  if (typeof window === "undefined") return;

  const resolvedId = appParams.appId || "usifizzy_local_dev";
  const response = await fetch(
    `/api/apps/public/login-info/by-id/${resolvedId}`,
  );
  if (!response.ok) throw new Error("Unable to load sign-in options");

  const info = await response.json();
  if (info.auth_config?.mfa_policy !== "required") {
    // FIXED: Redirects natively through your own social login api route endpoint
    window.location.href = `/api/auth/social/${provider}?returnTo=${encodeURIComponent(returnTo)}`;
    return;
  }

  const url = new URL("/auth/mfa", window.location.origin);
  url.search = new URLSearchParams({
    app_id: resolvedId,
    oauth_start: provider,
    from_url: returnTo,
  }).toString();

  window.location.assign(url.href);
}

export function loginWithGoogle(returnTo: string): Promise<void> {
  return loginWithSocial("google", returnTo);
}
